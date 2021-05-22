from smtplib import SMTP
from email.message import EmailMessage
from email.utils import formatdate
from config import EmailCommunicator as Config
from bot.communicator import Client, Communicator


class EmailClient(Client):
	def __init__(self, address: str) -> None:
		self.address = address


class EmailCommunicator(Communicator):
	def __init__(self, config: Config) -> None:
		super().__init__()
		self.config = config

	def create_client(self, argument: str) -> Client:
		return EmailClient(argument)

	def send_message(self, client: Client, message: str) -> None:
		if not isinstance(client, EmailClient):
			raise Exception("not an email client")
		msg = EmailMessage()
		msg["Subject"] = "Wizard"
		msg["From"] = self.config.from_
		msg["To"] = client.address
		msg["Date"] = formatdate(localtime=True)
		msg.set_content(message)
		s = SMTP(self.config.host, self.config.port)
		s.starttls()
		s.login(self.config.user, self.config.password)
		s.send_message(msg)
		s.quit()
