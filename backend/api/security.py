from graphql import GraphQLError
from game.player import User
from typing import Dict, Tuple
from fastapi import Request
from fastapi.security.base import SecurityBase
from threading import Lock
from datetime import datetime, timedelta
from database import Database


class UserAuthentication(SecurityBase):
	def __init__(self, db: Database, ttl: timedelta = timedelta(minutes=1)) -> None:
		self._lock = Lock()
		self._cache: Dict[str, Tuple[datetime, User]] = {}
		self._ttl = ttl
		self.db = db

	async def authenticate(self, request: Request) -> User:
		try:
			cookie = request.cookies["login"]
			with self._lock:
				try:
					time, user = self._cache[cookie]
					if datetime.now() < time:
						return user
				except:
					pass
			user = await self.db.get_user_by_cookie(cookie)
			with self._lock:
				self._cache[cookie] = datetime.now()+self._ttl, user
			return user
		except:
			raise GraphQLError("authentication failed")
