from game.game_interaction import GameInteraction
from game.player import Player
from datetime import datetime, timedelta
import functools
from threading import Lock
from graphql import GraphQLError
from graphql import ResolveInfo
from typing import Any, Callable, Dict, Optional, OrderedDict, Tuple, Union
from fastapi import Request
from database import Database
from api.security import UserAuthentication
from inspect import getfullargspec, iscoroutine
from lobby.manager import Manager
from lobby.lobby import Lobby
from game.round import Round
from game.trick import Trick
from game.player import User


class Cookie:
	def __init__(self, value: str, max_age: Optional[int] = None) -> None:
		self.value = value
		self.max_age = max_age


class Response:
	def __init__(self):
		self.cookies: Dict[str, Union[None, Cookie]] = {}


class State:
	db: Database
	user_authentication: UserAuthentication
	response: Response
	lobby_manager: Manager


class Cache:
	def __init__(self, size: int, timeout: timedelta):
		self.size = size
		self.timeout = timeout
		self._cache: OrderedDict[Dict[str, Any], Tuple[datetime, Any]] = OrderedDict()
		self._lock = Lock()

	def get_cached(self, args: Dict[str, Any]):
		key = Cache.__get_key(args)
		with self._lock:
			result = self._cache[key]
			if datetime.now() < result[0]:
				self._cache.move_to_end(key)
				return result[1]
			self._cache.pop(key)
		raise Exception("not cached")

	def cache(self, result: Any, args: Dict[str, Any]):
		key = Cache.__get_key(args)
		with self._lock:
			self._cache[key] = [datetime.now()+self.timeout, result]
			self._cache.move_to_end(key)
			if len(self._cache) > self.size:
				self._cache.popitem(last=False)

	@staticmethod
	def __get_key(args: Dict[str, Any]):
		return hash(frozenset(args.items()))


def smart_api(access_control: bool = True, cache: Cache = None):
	def decorator(func: Callable):
		@functools.wraps(func)
		async def wrapper(root, info: ResolveInfo, **kwargs):
			request: Request = info.context["request"]
			state: State = request.state
			user: User = None
			lobby: Lobby = None
			def assert_lobby() -> None:
				nonlocal lobby
				if lobby is None:
					try:
						lobby = state.lobby_manager.get_lobby_by_player(user)
					except:
						raise GraphQLError("lobby does not exist")

			# authorization
			if access_control:
				user = await state.user_authentication.authenticate(request)
			# try cache
			try:
				return cache.get_cached(kwargs)
			except:
				pass
			# pass special arguments
			spec = getfullargspec(func)
			additional = {}
			for key, value in spec.annotations.items():
				if value is Database:
					additional[key] = state.db
				elif value is Response:
					additional[key] = state.response
				elif value is Request:
					additional[key] = request
				elif value is Manager:
					additional[key] = state.lobby_manager
				elif value is User:
					additional[key] = user
				elif value is Optional[Lobby]:
					try: assert_lobby()
					except: pass
					additional[key] = lobby
				elif value is Lobby:
					assert_lobby()
					additional[key] = lobby
				elif value is Optional[GameInteraction]:
					try:
						assert_lobby()
						additional[key] = lobby.get_game_interaction()
					except:
						additional[key] = None
				elif value is GameInteraction:
					assert_lobby()
					additional[key] = lobby.get_game_interaction()
			# execute
			result = func(root, info, **kwargs, **additional)
			if iscoroutine(result):
				result = await result
			if cache is not None:
				cache.cache(result, kwargs)
			return result
		return wrapper
	return decorator
