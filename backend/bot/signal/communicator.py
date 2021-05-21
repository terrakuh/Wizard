from bot.communicator import Communicator, Client
from re import match
from config import SignalCommunicator as Config
import requests


class SignalClient(Client):
	def __init__(self, number: str) -> None:
		self.number = number


class SignalCommunicator(Communicator):
	def __init__(self, config: Config) -> None:
		super().__init__()
		self.config = config

	def create_client(self, argument: str) -> Client:
		if match(r"^\+49\d+$", argument) is None:
			raise Exception("not a phone number")
		return SignalClient(argument)

	def send_message(self, client: Client, message: str) -> None:
		if not isinstance(client, SignalClient):
			raise Exception("not a signal client")
		resp = requests.post(f"{self.config.api}/v2/send", json={
			"base64_attachments": [],
			"message": message,
			"number": self.config.number,
			"recipients": [client.number]
		})
		if resp.status_code == 400:
			raise Exception(resp.json()["error"])
		elif resp.status_code != 201:
			raise Exception(f"bad response: {resp.status_code}")
