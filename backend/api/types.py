from graphene import ObjectType, ID, String, NonNull, List, Int, Boolean, Field


class User(ObjectType):
	id = NonNull(ID)
	name = NonNull(String)


class Lobby(ObjectType):
	code = NonNull(String)
	mode = NonNull(Int)
	players = NonNull(List(NonNull(User)))
	can_start = Boolean()


class LoginInformation(ObjectType):
	salt = NonNull(String)
	hash_type = NonNull(String)


class PlayerState(ObjectType):
	player = NonNull(User)
	score = NonNull(Int)
	tricks_called = Int()
	tricks_made = Int()


class RoundState(ObjectType):
	trump_color = String()
	round = NonNull(Int)


class PlayedCard(ObjectType):
	id = NonNull(ID)
	player = NonNull(User)
	is_winning = NonNull(Boolean)


class TrickState(ObjectType):
	players_states = NonNull(List(NonNull(PlayerState)))
	lead_color = String()
	round = Int()
	turn = Field(User)
	deck = List(NonNull(PlayedCard))


class PlayableCard(ObjectType):
	id = NonNull(ID)
	playable = NonNull(Boolean)
	variants = List(NonNull(lambda: PlayableCard))


class RequiredAction(ObjectType):
	type = NonNull(String)
	options = NonNull(List(NonNull(String)))
