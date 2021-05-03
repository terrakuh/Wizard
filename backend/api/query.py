from datetime import timedelta
from api.decorators import Cache, smart_api
from graphene import ObjectType, Field, ID, String, NonNull, ResolveInfo, List, Int
from graphql import GraphQLError
from .types import Lobby as LobbyType, LoginInformation, PlayableCard, RoundState, TrickState, User
from database import Database
from lobby.manager import Manager
from lobby.lobby import Lobby


class Query(ObjectType):
	# user management
	login_information = Field(LoginInformation, name=NonNull(String))
	user = Field(User, id=NonNull(ID))
	whoami = Field(User)

	@smart_api(access_control=False, cache=Cache(64, timedelta(minutes=30)))
	async def resolve_login_information(root, info: ResolveInfo, name: str, db: Database):
		try:
			return await db.get_login_information(name)
		except:
			raise GraphQLError(f"User '{name}' does not exist.")

	@smart_api(cache=Cache(32, timedelta(minutes=30)))
	async def resolve_user(root, info: ResolveInfo, id: ID, db: Database):
		try:
			return User(id=id, name=await db.get_username(id))
		except:
			raise GraphQLError(f"User #{id} does not exist.")

	@smart_api(cache=Cache(32, timedelta(minutes=30)))
	async def resolve_whoami(root, info: ResolveInfo, user: User):
		return user


	# lobby management
	lobby = Field(LobbyType)

	@smart_api()
	async def resolve_lobby(root, info: ResolveInfo, lobby: Lobby):
		try:
			settings = lobby.get_settings()
			players = [await Query.resolve_user(root, info, id=id) for id in lobby.get_players()]
			return LobbyType(mode=settings.mode, players=players)
		except:
			return None


	# game logic
	round_state = Field(RoundState)
	trick_state = Field(TrickState)
	hand = List(NonNull(PlayableCard))
	required_action = Int

	@smart_api()
	def resolve_round_state(root, info: ResolveInfo):
		pass

	@smart_api()
	def resolve_trick_state(root, info: ResolveInfo):
		pass

	@smart_api()
	def resolve_hand(root, info: ResolveInfo):
		pass

	@smart_api()
	def resolve_required_action(root, info: ResolveInfo):
		pass
