import functools
from graphql import GraphQLError
from graphql import ResolveInfo
from typing import Callable
from fastapi import Request
from database import Database
from api.security import AccessLevel, UserAuthentication
from inspect import getfullargspec


class State:
	db: Database
	user_authentication: UserAuthentication


def smart_api(access: AccessLevel = None):
	def decorator(func: Callable):
		@functools.wraps(func)
		async def wrapper(root, info: ResolveInfo, **kwargs):
			request: Request = info.context["request"]
			state: State = request.state
			# authorization
			if access is not None and await state.user_authentication(request) < access:
				raise GraphQLError("not authorized")
			spec = getfullargspec(func)
			additional = {}
			for key, value in spec.annotations.items():
				if value is Database:
					additional[key] = state.db
			return func(root, info, **kwargs, **additional)
		return wrapper
	return decorator
