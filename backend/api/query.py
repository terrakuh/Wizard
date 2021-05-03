from datetime import timedelta
from api.decorators import Cache, smart_api
from graphene import ObjectType, Field, ID, String, NonNull, ResolveInfo, List, Int
from graphql import GraphQLError
from .types import Lobby as LobbyType, LoginInformation, PlayableCard, RoundState, TrickState, User
from database import Database
from lobby.manager import Manager
from lobby.lobby import Lobby
from game.round import Round
from game.player import Player
from game.trick import Trick
from .helpers import *
import game.game_interface


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
	def resolve_round_state(root, info: ResolveInfo, round: Round):
		round_state = game.game_interface.get_round_state(round)
		return RoundState(trump_color=round_state["trump_color"], round=round_state["number"])

	@smart_api()
	def resolve_trick_state(root, info: ResolveInfo, trick: Trick):
		trick_state = game.game_interface.get_trick_state(trick)
		turn = User(id=trick_state["turn"]["id"], name=trick_state["turn"]["name"])
		cards = cards_to_playable_cards(trick_state["cards"])
		return TrickState(player_states=players_to_player_states(trick_state["players"]), lead_color=trick_state["lead_color"], round=trick_state["trick_number"], turn=turn, deck=cards)

	@smart_api()
	def resolve_hand(root, info: ResolveInfo, player: Player, trick: Trick):
		return cards_to_playable_cards(game.game_interface.get_hand_cards(player, trick.lead_color))

	@smart_api()
	def resolve_required_action(root, info: ResolveInfo, player: Player):
		return game.game_interface.get_action_required(player)
