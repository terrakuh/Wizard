from api.types import User
from datetime import datetime, timedelta
import functools
from threading import Lock
from graphql import GraphQLError
from graphql import ResolveInfo
from typing import Any, Callable, Dict, OrderedDict, Tuple, Union
from fastapi import Request
from database import Database
from api.security import UserAuthentication
from inspect import getfullargspec, iscoroutine
from lobby.manager import Manager


class Response:
	def __init__(self):
		self.cookies: Dict[str, Union[None, str]] = {}


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
			# execute
			result = func(root, info, **kwargs, **additional)
			if iscoroutine(result):
				result = await result
			if cache is not None:
				cache.cache(result, kwargs)
			return result
		return wrapper
	return decorator
