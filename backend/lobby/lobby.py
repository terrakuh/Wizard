from threading import Lock
from typing import Set
from datetime import datetime
from copy import deepcopy


class Settings:
	mode: int = 0


class Lobby:
	def __init__(self) -> None:
		self._settings = Settings()
		self._lock = Lock()
		self._players: list[int] = []
		self.created = datetime.now()
		self.game_started: datetime = None

	def _add_player(self, id: int) -> None:
		with self._lock:
			if self.game_started is not None:
				raise Exception("game already in progress")
			elif len(self._players) > 6:
				raise Exception("too many players")
			try:
				self._players.index(id)
			except:
				self._players.append(id)

	def _remove_player(self, id: int) -> None:
		with self._lock:
			if self.game_started is not None:
				raise Exception("game already in progress")
			try:
				self._players.remove(id)
			except:
				pass

	def is_lobby_master(self, id: int) -> bool:
		with self._lock:
			return self._players[0] == id

	def set_settings(self, mode: int) -> None:
		with self._lock:
			self._settings.mode = mode

	def get_settings(self) -> Settings:
		with self._lock:
			return deepcopy(self._settings)

	def get_players(self) -> Set[int]:
		with self._lock:
			return self._players.copy()

	def start_game(self, id: int) -> None:
		with self._lock:
			if self.game_started is not None:
				raise Exception("game already started")
			elif len(self._players) < 3:
				raise Exception("at least 3 players required")
			elif id != self._players[0]:
				raise Exception("not lobby master")
			self.game_started = datetime.now()
		#TODO

	def get_game(self):
		pass
