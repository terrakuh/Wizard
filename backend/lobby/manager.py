from threading import RLock
from typing import Dict, List
from .lobby import Lobby
from datetime import datetime, timedelta
from random import choices
from string import ascii_uppercase


class Manager:
	def __init__(self, max_lobbies: int = 8, inactive_timeout: timedelta = timedelta(minutes=20)) -> None:
		self._lock = RLock()
		self._lobbies: Dict[str, Lobby] = {}
		self._player_code: Dict[str, str] = {}
		self._max_lobbies = max_lobbies
		self._inative_timeout = inactive_timeout

	# def __gc_lobbies(self):
	# 	now = datetime.now()
	# 	with self._lock:
	# 		self._lobbies = {code: lobby for code, lobby in self._lobbies.items() if now < lobby.created + self._inative_timeout}

	def create_lobby(self, id: int, code_length: int = 5) -> str:
		code = "".join(choices(ascii_uppercase, k=code_length))
		with self._lock:
			if len(self._lobbies) > self._max_lobbies:
				raise Exception("lobby limit reached")
			elif code in self._lobbies:
				raise Exception("bad luck")
			elif id in self._player_code:
				raise Exception("player already in lobby")
			self._lobbies[code] = Lobby()
			self.join_lobby(id, code)
		return code

	def join_lobby(self, id: int, code: str) -> None:
		with self._lock:
			lobby = self._lobbies[code]
			lobby._add_player(id)
			self._player_code[id] = code

	def leave_lobby(self, id: int) -> None:
		with self._lock:
			lobby = self._lobbies[self._player_code[id]]
			lobby._remove_player(id)
			del self._player_code[id]

	def get_lobby_by_player(self, id: int) -> Lobby:
		with self._lock:
			return self._lobbies[self._player_code[id]]

	def get_lobby(self, code: str) -> Lobby:
		with self._lock:
			return self._lobbies[code]
