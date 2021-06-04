from graphene import ObjectType, ID, String, NonNull, List, Int, Boolean, Field, Float


class User(ObjectType):
	id = NonNull(ID)
	name = NonNull(String)


class Lobby(ObjectType):
	code = NonNull(String)
	mode = NonNull(String)
	round_limit = NonNull(Int)
	max_rounds = NonNull(Int)
	players = NonNull(List(NonNull(User)))
	can_start = Boolean()


class LoginInformation(ObjectType):
	salt = NonNull(String)
	hash_type = NonNull(String)


class PlayerState(ObjectType):
	player = NonNull(User)
	score = NonNull(Int)
	is_active = NonNull(Boolean)
	tricks_called = Int()
	tricks_made = Int()


class PlayedCard(ObjectType):
	id = NonNull(ID)
	player = NonNull(User)
	is_winning = NonNull(Boolean)


class TrickState(ObjectType):
	lead_color = String()
	lead_card = Field(PlayedCard)
	round = Int()
	deck = List(NonNull(PlayedCard))


class PlayableCard(ObjectType):
	id = NonNull(ID)
	playable = NonNull(Boolean)


class RoundState(ObjectType):
	trump_color = String()
	trump_card = NonNull(String)
	round = NonNull(Int)
	past_trick = Field(TrickState)


class RequiredAction(ObjectType):
	type = NonNull(String)
	options = NonNull(List(NonNull(String)))


class GameInfo(ObjectType):
	round_state = NonNull(RoundState)
	trick_state = Field(TrickState)
	player_states = NonNull(List(NonNull(PlayerState)))
	hand = NonNull(List(NonNull(PlayableCard)))


class Appointment(ObjectType):
	id = NonNull(ID)
	start = NonNull(String)
	end = NonNull(String)
	participants = NonNull(List(NonNull(User)))


class ActionDuration(ObjectType):
	type = NonNull(String)
	duration = NonNull(Float)


class ResidentSleeper(ObjectType):
	averages = NonNull(List(NonNull(ActionDuration)))
