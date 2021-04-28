import functools
from typing import Callable, Dict
from fastapi import Request
from fastapi.security.base import SecurityBase
from threading import Lock
from datetime import datetime, timedelta
from enum import IntEnum

from graphql import ResolveInfo, GraphQLError

# from database import Database

class AccessLevel(IntEnum):
	NONE = 0
	NORMAL_USER = 1
	ADMINISTRATOR = 2


class UserAuthentication(SecurityBase):
	def __init__(self, db, ttl: timedelta = timedelta(hours=1)):
		self._lock = Lock()
		self._cache: Dict[str, datetime] = {}
		self._ttl = ttl
		self.db = db

	async def __call__(self, request: Request) -> AccessLevel:
		try:
			cookie = request.cookies["login"]
		except:
			cookie = None
		if cookie is None or not await self._is_logged_in(cookie):
			return AccessLevel.NONE
		return AccessLevel.NORMAL_USER

	async def _is_logged_in(self, cookie: str) -> bool:
		with self._lock:
			try:
				time = self._cache[cookie]
				if datetime.now() < time:
					return True
			except:
				pass
		logged_in = await self.db.is_logged_in(cookie)
		with self._lock:
			self._cache[logged_in] = datetime.now() + self._ttl
		return logged_in


def requires_access_level(level: AccessLevel):
	def decorator(func: Callable):
		@functools.wraps(func)
		async def wrapper(root, info: ResolveInfo, **kwargs):
			request = info.context["request"]
			if await request.user_authentication(request) < level:
				raise GraphQLError("not authorized")
			return func(root, info, **kwargs)
		return wrapper
	return decorator
