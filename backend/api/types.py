from graphene import ObjectType, ID, String, NonNull, List, Int, Boolean, Field


class User(ObjectType):
	id = NonNull(ID)
	name = NonNull(String)


class Lobby(ObjectType):
	code = NonNull(String)
	mode = NonNull(String)
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


class PlayedCard(ObjectType):
	id = NonNull(ID)
	player = NonNull(User)
	is_winning = NonNull(Boolean)


class TrickState(ObjectType):
	player_states = NonNull(List(NonNull(PlayerState)))
	lead_color = String()
	lead_card = Field(PlayedCard)
	round = Int()
	turn = Field(User)
	deck = List(NonNull(PlayedCard))


class PlayableCard(ObjectType):
	id = NonNull(ID)
	playable = NonNull(Boolean)
	variants = List(NonNull(lambda: PlayableCard))


class RoundState(ObjectType):
	trump_color = String()
	trump_card = NonNull(String)
	round = NonNull(Int)
	past_tricks = NonNull(List(List(PlayedCard)))


class RequiredAction(ObjectType):
	type = NonNull(String)
	options = NonNull(List(NonNull(String)))


class GameInfo(ObjectType):
	round_state = NonNull(RoundState)
	trick_state = NonNull(TrickState)
	hand = NonNull(List(NonNull(PlayableCard)))
