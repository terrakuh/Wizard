from graphene import ObjectType, Field, ID, String, NonNull, ResolveInfo, Schema, Boolean, List, Int, InputObjectType
from database import Database


class User(ObjectType):
	id = NonNull(ID)
	name = NonNull(String)


class Lobby(ObjectType):
	mode = NonNull(Int)
	players = NonNull(List(NonNull(User)))


class LoginInformation(ObjectType):
	salt = NonNull(String)
	hash_type = NonNull(String)


class PlayerState(ObjectType):
	player = NonNull(User)
	score = NonNull(Int)
	tricks_called = Int
	tricks_made = Int


class RoundState(ObjectType):
	trump_color = Int
	round = NonNull(Int)


class PlayedCard(ObjectType):
	id = NonNull(ID)
	player = NonNull(User)
	is_winning = NonNull(Boolean)


class TrickState(ObjectType):
	players_states = NonNull(List(NonNull(PlayerState)))
	lead_color = Int
	round = Int
	turn = User
	deck = List(NonNull(PlayedCard))


class PlayableCard(ObjectType):
	id = NonNull(ID)
	playable = NonNull(Boolean)
	variants = List(NonNull(lambda: PlayableCard))


class Query(ObjectType):
	# user management
	login_information = Field(LoginInformation, name=NonNull(String))
	user = Field(User, id=NonNull(ID))
	whoami = Field(User)

	def resolve_login_information(root, info, name: str):
		pass

	def resolve_user(root, info, id: ID):
		pass

	def resolve_whoami(root, info: ResolveInfo):
		pass

	# lobby management
	lobby = Field(Lobby)

	def resolve_lobby(root, info: ResolveInfo):
		pass

	# game logic
	round_state = Field(RoundState)
	trick_state = Field(TrickState)
	hand = List(NonNull(PlayableCard))
	required_action = Int

	def resolve_round_state(root, info: ResolveInfo):
		pass

	def resolve_trick_state(root, info: ResolveInfo):
		pass

	def resolve_hand(root, info: ResolveInfo):
		pass

	def resolve_required_action(root, info: ResolveInfo):
		pass


class LobbySettings(InputObjectType):
	mode = NonNull(Int)


class Mutation(ObjectType):
	register = NonNull(Boolean, name=NonNull(String), password_hash=NonNull(String), salt=NonNull(String), hash_type=NonNull(String))
	login = NonNull(User, name=NonNull(String), password_hash=NonNull(String))
	logout = NonNull(Boolean)

	def resolve_register(root, info: ResolveInfo):
		pass

	def resolve_login(root, info: ResolveInfo):
		pass

	def resolve_logout(root, info: ResolveInfo):
		pass

	# lobby management
	create_lobby = NonNull(String)
	change_lobby_settings = NonNull(Boolean, settings=NonNull(LobbySettings))
	join_lobby = NonNull(Boolean, code=NonNull(String))
	leave_lobby = NonNull(Boolean)
	start_game = NonNull(Boolean)

	def resolve_create_lobby(root, info: ResolveInfo):
		pass

	def resolve_change_lobby_settings(root, info: ResolveInfo):
		pass

	def resolve_join_lobby(root, info: ResolveInfo):
		pass

	def resolve_leave_lobby(root, info: ResolveInfo):
		pass

	def resolve_start_game(root, info: ResolveInfo):
		pass

	# game logic
	play_card = List(NonNull(PlayableCard), id=NonNull(ID))
	call_tricks = NonNull(Boolean, amount=NonNull(Int))
	complete_action = NonNull(Boolean, argument=String())

	def resolve_play_card(root, info: ResolveInfo):
		pass

	def resolve_call_tricks(root, info: ResolveInfo):
		pass

	def resolve_complete_action(root, info: ResolveInfo):
		pass


schema = Schema(query=Query, mutation=Mutation)
# db = Database("wizard.db")

print(schema.execute("""
	query {
		hand {
			id
			playable
			variants {
				id
			}
		}
	}
"""))
