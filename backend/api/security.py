from typing import Dict
from fastapi import Request
from fastapi.security.base import SecurityBase
from threading import Lock
from datetime import datetime, timedelta
from enum import IntEnum


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
