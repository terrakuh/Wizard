from graphene import InputObjectType, NonNull, Int


class LobbySettings(InputObjectType):
	mode = NonNull(Int)
