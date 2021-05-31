from threading import RLock
from typing import Callable, List
from datetime import datetime
from copy import deepcopy
import asyncio
import concurrent

from game.game import Game, Settings
from game.player import User
from game.game_history import GameHistory
from game.card_decks import CardDecks


class Lobby:
	def __init__(self, code: str, on_game_finish: Callable[[GameHistory, "Lobby"], None]) -> None:
		self.code = code
		self._settings = Settings("Jubiläum25")
		self._lock = RLock()
		self._players: List[User] = []
		self.created = datetime.now()
		self._game: Game = None
		self._on_game_finish = lambda history: on_game_finish(history, self)
		self.game_started: datetime = None

	def _add_player(self, user: User) -> None:
		with self._lock:
			if self.game_started is not None:
				raise Exception("game already in progress")
			elif len(self._players) > 6:
				raise Exception("too many players")
			try:
				self._players.index(user)
			except:
				self._players.append(user)

	def _remove_player(self, user: User) -> None:
		with self._lock:
			if self.game_started is not None:
				raise Exception("game already in progress")
			try:
				self._players.remove(user)
			except:
				pass

	def is_lobby_master(self, user: User) -> bool:
		with self._lock:
			return self._players[0].user_id == user.user_id

	def set_settings(self, mode: str=None, round_number: int=None) -> None:
		with self._lock:
			if mode is not None: self._settings.mode = mode
			if round_number is not None:
				if 0 < round_number <= self.get_max_rounds():
					self._settings.round_number = round_number
				else:
					raise Exception("Invalid round number")

	def get_settings(self) -> Settings:
		with self._lock:
			return deepcopy(self._settings)

	def get_max_rounds(self) -> int:
		with self._lock:
			return CardDecks.get_max_rounds(self._settings.mode, len(self._players))

	def get_players(self) -> List[User]:
		with self._lock:
			return self._players.copy()

	def start_game(self) -> None:
		with self._lock:
			print("Started ", self.game_started)
			if self.game_started is not None:
				raise Exception("game already started")
			# elif len(self._players) < 3:
			# 	raise Exception("at least 3 players required")
			self.game_started = datetime.now()
			self._game = Game(self._players, self._settings, self._on_game_finish)
			asyncio.create_task(self._game.start())

	def get_game(self) -> Game:
		with self._lock:
			if self._game is None:
				raise Exception("game not started")
			return self._game

	def get_game_history(self) -> GameHistory:
		with self._lock:
			if self._game is None:
				raise Exception("game not started")
			return self._game.history
