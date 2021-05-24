from datetime import datetime, timedelta
from typing import Optional

from graphene.types.field import Field
from api.decorators import Cookie, smart_api, Response
from graphene import ObjectType, Boolean, NonNull, String, ResolveInfo, Int, ID, List
from graphql import GraphQLError
from .types import Appointment, User as UserType, PlayableCard
from database import Database
from fastapi import Request

from lobby.manager import Manager
from lobby.lobby import Lobby

from game.player import Player, User
from game.game_interaction import GameInteraction

from .graphene_parser import *


class Mutation(ObjectType):
	# user management
	register = NonNull(Boolean, name=NonNull(String), password_hash=NonNull(String), salt=NonNull(String), hash_type=NonNull(String), token=NonNull(String))
	login = NonNull(UserType, name=NonNull(String), password_hash=NonNull(String), stay_logged_in=NonNull(Boolean))
	logout = NonNull(Boolean)

	@smart_api(access_control=False)
	async def resolve_register(root, info: ResolveInfo, name: str, password_hash: str, salt: str, hash_type: str, token: str, db: Database):
		await db.consume_token(token)
		try:
			await db.register_user(name, password_hash, salt, hash_type)
		except Exception as e:
			print(e)
			raise GraphQLError(f"User '{name}' already exists.")
		return True

	@smart_api(access_control=False)
	async def resolve_login(root, info: ResolveInfo, name: str, password_hash: str, db: Database, response: Response, stay_logged_in: bool = False):
		try:
			days = 31 if stay_logged_in else 1
			cookie = await db.login(name, password_hash, expires_days=days)
			response.cookies["login"] = Cookie(cookie, int(timedelta(days=days).total_seconds()) if stay_logged_in else None)
		except:
			raise GraphQLError(f"User '{name}' does not exist.")
		return UserType(id=0, name=name)

	@smart_api()
	async def resolve_logout(root, info: ResolveInfo, db: Database, request: Request, response: Response):
		cookie = request.cookies.get("login")
		if cookie is not None:
			await db.logout(cookie)
			response.cookies["login"] = None
		return True


	# lobby management
	create_lobby = NonNull(String)
	set_lobby_settings = NonNull(Boolean, mode=String())
	join_lobby = NonNull(Boolean, code=NonNull(String))
	leave_lobby = NonNull(Boolean)
	start_game = NonNull(Boolean)

	@smart_api()
	def resolve_create_lobby(root, info: ResolveInfo, manager: Manager, user: User):
		return manager.create_lobby(user)

	@smart_api()
	def resolve_set_lobby_settings(root, info: ResolveInfo, mode: Optional[str], lobby: Lobby, user: User):
		if not lobby.is_lobby_master(user):
			raise GraphQLError("not lobby master")
		if mode is not None:
			lobby.set_settings(mode)
		return True

	@smart_api()
	def resolve_join_lobby(root, info: ResolveInfo, code: str, manager: Manager, user: User):
		manager.join_lobby(user, code)
		return True

	@smart_api()
	def resolve_leave_lobby(root, info: ResolveInfo, manager: Manager, user: User):
		manager.leave_lobby(user)
		return True

	@smart_api()
	def resolve_start_game(root, info: ResolveInfo, lobby: Lobby, user: User):
		if not lobby.is_lobby_master(user):
			raise GraphQLError("not lobby master")
		lobby.start_game()
		return True


	# game logic
	complete_action = NonNull(Boolean, option=NonNull(String))

	@smart_api()
	def resolve_complete_action(root, info: ResolveInfo, user: User, option: str, game_i: GameInteraction):
		game_i.complete_action(option, user)
		return True


	# misc
	join_appointment = NonNull(Appointment, id=NonNull(ID))
	leave_appointment = Field(Appointment, id=NonNull(ID))
	create_appointment = NonNull(Appointment, start=NonNull(String))

	@smart_api()
	async def resolve_join_appointment(root, info: ResolveInfo, user: User, id: int, db: Database):
		await db.join_appointment(id, user.name)
		return await db.get_appointment(id)

	@smart_api()
	async def resolve_leave_appointment(root, info: ResolveInfo, user: User, id: int, db: Database):
		await db.leave_appointment(id, user.name)
		try:
			return await db.get_appointment(id)
		except:
			return None

	@smart_api()
	async def resolve_create_appointment(root, info: ResolveInfo, user: User, start: str, db: Database):
		id = await db.create_appointment(datetime.fromisoformat(start))
		await db.join_appointment(id, user.name)
		return await db.get_appointment(id)
