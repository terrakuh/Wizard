

class Client:
	pass


class Communicator:
	def send_message(self, client: Client, message: str) -> None:
		pass

	def create_client(self, argument: str) -> Client:
		pass
