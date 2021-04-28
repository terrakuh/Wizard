from graphene import ObjectType, Field, ID, String, NonNull, ResolveInfo, List, Int
from graphql import GraphQLError
from starlette.routing import request_response
from .types import Lobby, LoginInformation, PlayableCard, RoundState, TrickState, User
from .security import requires_access_level, AccessLevel

from typing import TYPE_CHECKING
if TYPE_CHECKING:
	from database import Database

class Query(ObjectType):
	# user management
	login_information = Field(LoginInformation, name=NonNull(String))
	user = Field(User, id=NonNull(ID))
	whoami = Field(User)


	async def resolve_login_information(root, info: ResolveInfo, name: str):
		db: Database = info.context["request"].db
		try:
			return await db.get_logging_information(name)
		except:
			raise GraphQLError(f"User '{name}' does not exist.")


	@requires_access_level(AccessLevel.NORMAL_USER)
	async def resolve_user(root, info: ResolveInfo, id: ID):
		db: Database = info.context["request"].db
		try:
			return User(id=id, name=await db.get_username(id))
		except:
			raise GraphQLError(f"User #{id} does not exist.")


	@requires_access_level(AccessLevel.NORMAL_USER)
	def resolve_whoami(root, info: ResolveInfo):
		pass


	# lobby management
	lobby = Field(Lobby)


	@requires_access_level(AccessLevel.NORMAL_USER)
	def resolve_lobby(root, info: ResolveInfo):
		pass


	# game logic
	round_state = Field(RoundState)
	trick_state = Field(TrickState)
	hand = List(NonNull(PlayableCard))
	required_action = Int

	@requires_access_level(AccessLevel.NORMAL_USER)
	def resolve_round_state(root, info: ResolveInfo):
		pass


	@requires_access_level(AccessLevel.NORMAL_USER)
	def resolve_trick_state(root, info: ResolveInfo):
		pass


	@requires_access_level(AccessLevel.NORMAL_USER)
	def resolve_hand(root, info: ResolveInfo):
		pass


	@requires_access_level(AccessLevel.NORMAL_USER)
	def resolve_required_action(root, info: ResolveInfo):
		pass
