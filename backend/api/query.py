from datetime import timedelta
from typing import Optional

from api.decorators import Cache, smart_api
from graphene import ObjectType, Field, ID, String, NonNull, ResolveInfo, List, DateTime, Int
from graphql import GraphQLError

from .types import Appointment, GameInfo, Lobby as LobbyType, LoginInformation, RequiredAction, ResidentSleeper, User as UserType
from database import Database

from lobby.lobby import Lobby

from game.player import User
from game.game_history import GameHistory
from game.card_decks import CardDecks

from . import graphene_parser


class Query(ObjectType):
	# user management
	login_information = Field(LoginInformation, name=NonNull(String))
	user = Field(UserType, id=NonNull(ID))
	whoami = Field(UserType)

	@smart_api(access_control=False, cache=Cache(64, timedelta(minutes=30)))
	async def resolve_login_information(root, info: ResolveInfo, name: str, db: Database):
		try:
			return await db.get_login_information(name)
		except:
			raise GraphQLError(f"User '{name}' does not exist.")

	# @smart_api(cache=Cache(32, timedelta(minutes=30)))
	@smart_api()
	async def resolve_user(root, info: ResolveInfo, id: ID, db: Database):
		try:
			return UserType(id=id, name=await db.get_username(id))
		except:
			raise GraphQLError(f"User #{id} does not exist.")

	@smart_api()
	async def resolve_whoami(root, info: ResolveInfo, user: User):
		return graphene_parser.parse_user(user)


	# lobby management
	lobby = Field(LobbyType)
	modes = List(String)
	max_rounds = Int()

	@smart_api()
	async def resolve_lobby(root, info: ResolveInfo, lobby: Optional[Lobby], user: User):
		try:
			settings = lobby.get_settings()
			result = LobbyType(
				code=lobby.code,
				mode=settings.mode,
				round_limit=settings.round_number,
				max_rounds=lobby.get_max_rounds(),
				players=[graphene_parser.parse_user(user) for user in lobby.get_players()]
			)
			if lobby.is_lobby_master(user):
				result.can_start = len(result.players) >= 3
				result.can_start = True
			return result
		except:
			return None

	def resolve_modes(root, info: ResolveInfo):
		return CardDecks.MODES.keys()

	@smart_api()
	async def resolve_max_rounds(root, info: ResolveInfo, lobby: Optional[Lobby]):
		print("Getting max...")
		try:
			return lobby.get_max_rounds()
		except:
			return 10


	# game logic
	game_info = Field(GameInfo)
	required_action = Field(RequiredAction)

	@smart_api()
	def resolve_game_info(root, info, user: User, history: Optional[GameHistory]):
		if history is None:
			return None
		return GameInfo(
			round_state=graphene_parser.get_round_state(history),
			trick_state=graphene_parser.get_trick_state(history),
			player_states=graphene_parser.get_player_states(history),
			hand=graphene_parser.get_hand(history, user)
		)

	@smart_api()
	def resolve_required_action(root, info: ResolveInfo, user: User, history: GameHistory):
		return graphene_parser.get_action(history, user)

	
	# misc
	appointments = NonNull(List(NonNull(Appointment)))

	@smart_api()
	async def resolve_appointments(root, info: ResolveInfo, db: Database):
		return await db.get_appointments()


	# statistics
	resident_sleeper = NonNull(ResidentSleeper)

	@smart_api()
	async def resolve_resident_sleeper(root, info: ResolveInfo, db: Database, user: User):
		return ResidentSleeper(averages=await db.get_action_averages(user.name))
