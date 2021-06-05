from database.database import Database
from game.game_history import GameHistory
from game.player import User
from threading import RLock
from typing import Dict
from .lobby import Lobby
from datetime import timedelta
from random import choices
from string import ascii_uppercase


class Manager:
	def __init__(self, db: Database, max_lobbies: int = 8, inactive_timeout: timedelta = timedelta(minutes=20)) -> None:
		self.db = db
		self._lock = RLock()
		self._lobbies: Dict[str, Lobby] = {}
		self._player_code: Dict[str, str] = {}
		self._max_lobbies = max_lobbies
		self._inative_timeout = inactive_timeout

	# def __gc_lobbies(self):
	# 	now = datetime.now()
	# 	with self._lock:
	# 		self._lobbies = {code: lobby for code, lobby in self._lobbies.items() if now < lobby.created + self._inative_timeout}
	def _on_game_finish(self, history: GameHistory, lobby: Lobby):
		self.db.queue_commit_game_history(history)
		with self._lock:
			del self._lobbies[lobby.code]
			self._player_code = {id: code for id, code in self._player_code.items() if code != lobby.code}

	def create_lobby(self, user: User, code_length: int = 5) -> str:
		code = "".join(choices(ascii_uppercase, k=code_length))
		with self._lock:
			if len(self._lobbies) > self._max_lobbies:
				raise Exception("lobby limit reached")
			elif code in self._lobbies:
				raise Exception("bad luck")
			elif self.__in_lobby(user):
				raise Exception("player already in lobby")
			self._lobbies[code] = Lobby(code, self._on_game_finish)
			self.join_lobby(user, code)
		return code

	def __in_lobby(self, user: User) -> bool:
		try: self._lobbies[self._player_code[user.user_id]]
		except: return False
		return True

	def join_lobby(self, user: User, code: str) -> None:
		with self._lock:
			lobby = self._lobbies[code]
			lobby._add_player(user)
			self._player_code[user.user_id] = code

	def leave_lobby(self, user: User) -> None:
		with self._lock:
			lobby = self._lobbies[self._player_code[user.user_id]]
			lobby._remove_player(user)
			del self._player_code[user.user_id]

	def get_lobby_by_player(self, user: User) -> Lobby:
		with self._lock:
			return self._lobbies[self._player_code[user.user_id]]

	def get_lobby(self, code: str) -> Lobby:
		with self._lock:
			return self._lobbies[code]
