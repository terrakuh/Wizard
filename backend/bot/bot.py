from bot.signal.communicator import SignalCommunicator
from config import Config


class Bot:
	def __init__(self, config: Config) -> None:
		self._signal = None if config.signal_communicator is None else SignalCommunicator(config.signal_communicator)
