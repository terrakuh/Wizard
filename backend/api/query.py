from datetime import timedelta
from typing import Optional
from api.decorators import Cache, smart_api
from graphene import ObjectType, Field, ID, String, NonNull, ResolveInfo, List
from graphql import GraphQLError

from .types import GameInfo, Lobby as LobbyType, LoginInformation, PlayableCard, RequiredAction, RoundState, TrickState, User as UserType
from database import Database

from lobby.manager import Manager
from lobby.lobby import Lobby

from game.player import Player, User
from game.game_interaction import GameInteraction
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

	@smart_api(cache=Cache(32, timedelta(minutes=30)))
	async def resolve_user(root, info: ResolveInfo, id: ID, db: Database):
		try:
			return UserType(id=id, name=await db.get_username(id))
		except:
			raise GraphQLError(f"User #{id} does not exist.")

	@smart_api(cache=Cache(32, timedelta(minutes=30)))
	async def resolve_whoami(root, info: ResolveInfo, user: User):
		return graphene_parser.parse_user(user)


	# lobby management
	lobby = Field(LobbyType)
	modes = List(String)

	@smart_api()
	async def resolve_lobby(root, info: ResolveInfo, lobby: Optional[Lobby], user: User):
		try:
			settings = lobby.get_settings()
			result = LobbyType(code=lobby.code, mode=settings.mode, players=[graphene_parser.parse_user(user) for user in lobby.get_players()])
			if lobby.is_lobby_master(user):
				result.can_start = len(result.players) >= 3
			result.can_start = True
			return result
		except:
			return None

	async def resolve_modes(root, info: ResolveInfo):
		return CardDecks.MODES.keys()


	# game logic
	game_info = Field(GameInfo)
	required_action = Field(RequiredAction)

	@smart_api()
	def resolve_game_info(root, info, user: User, game_i: Optional[GameInteraction]):
		if game_i is None: return None
		return GameInfo(
			round_state=graphene_parser.parse_round_state(game_i.get_round_state()),
			trick_state=graphene_parser.parse_trick_state(game_i.get_trick_state()),
			hand=graphene_parser.parse_hand_cards(game_i.get_hand_cards(user))
		)

	@smart_api()
	def resolve_required_action(root, info: ResolveInfo, user: User, game_i: Optional[GameInteraction]):
		if game_i is None:
			return None
		action = game_i.get_action_required(user)
		if action is None:
			return None
		return graphene_parser.parse_player_task(action)
