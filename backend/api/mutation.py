from api.decorators import smart_api, Response
from graphene import ObjectType, Boolean, NonNull, String, ResolveInfo, Int, ID, List
from graphql import GraphQLError
from .types import User, PlayableCard
from .inputs import LobbySettings
from database import Database
from fastapi import Request
from lobby.manager import Manager
from lobby.lobby import Lobby, Settings


class Mutation(ObjectType):
	# user management
	register = NonNull(Boolean, name=NonNull(String), password_hash=NonNull(String), salt=NonNull(String), hash_type=NonNull(String))
	login = NonNull(User, name=NonNull(String), password_hash=NonNull(String))
	logout = NonNull(Boolean)

	@smart_api(access_control=False)
	async def resolve_register(root, info: ResolveInfo, name: str, password_hash: str, salt: str, hash_type: str, db: Database):
		try:
			await db.register_user(name, password_hash, salt, hash_type)
		except:
			raise GraphQLError(f"User '{name}' already exists.'")
		return True

	@smart_api(access_control=False)
	async def resolve_login(root, info: ResolveInfo, name: str, password_hash: str, db: Database, response: Response):
		try:
			cookie = await db.login(name, password_hash)
			response.cookies["login"] = cookie
		except:
			raise GraphQLError(f"User '{name}' does not exist.")
		return User(id=0, name=name)

	@smart_api()
	async def resolve_logout(root, info: ResolveInfo, db: Database, request: Request, response: Response):
		cookie = request.cookies.get("login")
		if cookie is not None:
			await db.logout(cookie)
			response.cookies["login"] = None
		return True


	# lobby management
	create_lobby = NonNull(String)
	change_lobby_settings = NonNull(Boolean, settings=NonNull(LobbySettings))
	join_lobby = NonNull(Boolean, code=NonNull(String))
	leave_lobby = NonNull(Boolean)
	start_game = NonNull(Boolean)

	@smart_api()
	def resolve_create_lobby(root, info: ResolveInfo, manager: Manager, user: User):
		return manager.create_lobby(user.id)

	@smart_api()
	def resolve_change_lobby_settings(root, info: ResolveInfo, settings: LobbySettings, lobby: Lobby, user: User):
		print(settings.mode)
		if not lobby.is_lobby_master(user.id):
			raise GraphQLError("not lobby master")
		lobby.set_settings(settings.mode)
		return True

	@smart_api()
	def resolve_join_lobby(root, info: ResolveInfo, code: str, manager: Manager, user: User):
		manager.join_lobby(user.id, code)
		return True

	@smart_api()
	def resolve_leave_lobby(root, info: ResolveInfo, manager: Manager, user: User):
		manager.leave_lobby(user.id)
		return True

	@smart_api()
	def resolve_start_game(root, info: ResolveInfo, lobby: Lobby, user: User):
		if not lobby.is_lobby_master(user.id):
			raise GraphQLError("not lobby master")
		lobby.start_game(user.id)
		return True


	# game logic
	play_card = List(NonNull(PlayableCard), id=NonNull(ID))
	call_tricks = NonNull(Boolean, amount=NonNull(Int))
	complete_action = NonNull(Boolean, argument=String())

	@smart_api()
	def resolve_play_card(root, info: ResolveInfo):
		pass

	@smart_api()
	def resolve_call_tricks(root, info: ResolveInfo):
		pass

	@smart_api()
	def resolve_complete_action(root, info: ResolveInfo):
		pass
