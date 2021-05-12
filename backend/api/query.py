from datetime import timedelta
from api.decorators import Cache, smart_api
from graphene import ObjectType, Field, ID, String, NonNull, ResolveInfo, List
from graphql import GraphQLError

from .types import Lobby as LobbyType, LoginInformation, PlayableCard, RequiredAction, RoundState, TrickState, User
from database import Database

from lobby.manager import Manager
from lobby.lobby import Lobby

from game.player import Player
from game.game_interaction import GameInteraction

from . import graphene_parser


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
	async def resolve_lobby(root, info: ResolveInfo, lobby: Lobby, user: User):
		try:
			settings = lobby.get_settings()
			result = LobbyType(code=lobby.code, mode=settings.mode, players=lobby.get_players())
			if lobby.is_lobby_master(user):
				result.can_start = len(result.players) >= 3
			return result
		except:
			return None


	# game logic
	round_state = Field(RoundState)
	trick_state = Field(TrickState)
	hand = List(NonNull(PlayableCard))
	required_action = Field(RequiredAction)

	@smart_api()
	def resolve_round_state(root, info: ResolveInfo, game_i: GameInteraction):
		return graphene_parser.parse_round_state(game_i.get_round_state())

	@smart_api()
	def resolve_trick_state(root, info: ResolveInfo, game_i: GameInteraction):
		return graphene_parser.parse_trick_state(game_i.get_trick_state())

	@smart_api()
	def resolve_hand(root, info: ResolveInfo, player: Player, game_i: GameInteraction):
		return graphene_parser.parse_hand_cards(game_i.get_hand_cards(player))

	@smart_api()
	def resolve_required_action(root, info: ResolveInfo, player: Player, game_i: GameInteraction):
		return graphene_parser.parse_player_task(game_i.get_action_required(player))
