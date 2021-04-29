import functools
from graphql import GraphQLError
from graphql import ResolveInfo
from typing import Callable, Dict, Union
from fastapi import Request
from database import Database
from api.security import AccessLevel, UserAuthentication
from inspect import getfullargspec


class Response:
	def __init__(self):
		self.cookies: Dict[str, Union[None, str]] = {}


class State:
	db: Database
	user_authentication: UserAuthentication
	response: Response


def smart_api(access: AccessLevel = None):
	def decorator(func: Callable):
		@functools.wraps(func)
		async def wrapper(root, info: ResolveInfo, **kwargs):
			request: Request = info.context["request"]
			state: State = request.state
			# authorization
			if access is not None and await state.user_authentication(request) < access:
				raise GraphQLError("not authorized")
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
			return func(root, info, **kwargs, **additional)
		return wrapper
	return decorator
