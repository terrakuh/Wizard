from threading import Lock, Thread
from typing import Any, Callable, Dict, List
from datetime import date, datetime


class Lobby:
	def __init__(self):
		self._lock = Lock()
		self._players: set[int] = set()
		self.created = datetime.now()
		self.game_started: datetime = None

	def _add_player(self, id: int):
		with self._lock:
			if self.game_started is not None:
				raise Exception("game already in progress")
			elif len(self._players) > 6:
				raise Exception("too many players")
			self._players.add(id)

	def _remove_player(self, id: int):
		with self._lock:
			if self.game_started is not None:
				raise Exception("game already in progress")
			self._players.remove(id)

	def get_players(self):
		with self._lock:
			return self._players.copy()

	def start_game(self, id: int):
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
