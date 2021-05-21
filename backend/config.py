from json import load
from typing import Optional
from os import getenv


class SignalCommunicator:
	api: str
	number: str


class EmailCommunicator:
	host: str
	port: int
	from_: str
	user: str
	password: str


class Config:
	signal_communicator: Optional[SignalCommunicator] = None
	email_communicator: Optional[EmailCommunicator] = None


config = Config()


def load_config(filename: str) -> None:
	global config
	with open(filename, "r") as f:
		tmp = load(f)

	config.signal_communicator = None
	try:
		t = tmp["communicators"]["signal"]
		if t["enabled"]:
			c = SignalCommunicator()
			c.number = t["number"]
			c.api = t["api"]
			config.signal_communicator = c
	except: pass

	config.email_communicator = None
	try:
		t = tmp["communicators"]["email"]
		if t["enabled"]:
			c = EmailCommunicator()
			c.host = t["host"]
			c.port = t["port"]
			c.from_ = t["from"]
			c.user = t["user"]
			c.password = getenv("WIZARD_EMAIL_PASSWORD")
			if c.password is None: raise Exception()
			config.email_communicator = c
	except: pass
