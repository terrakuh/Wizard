import threading
import random
import logging
from typing import List, Optional
from datetime import datetime

from .round import Round
from .card import Card
from .player import Player, User
from .card_decks import CardDecks
from .game_history import GameHistory

class Settings:
    def __init__(self, mode: str, max_rounds: int=12):
        self.mode = mode
        self.max_rounds = max_rounds


class Game(threading.Thread):

    def __init__(self, users: List[User], settings: Settings):
        super().__init__()

        self.history = GameHistory(settings)

        random.shuffle(users)
        self.players = {user.user_id: Player(self.history, user, index) for index, user in enumerate(users)}
        self.history.set_players(self.players)

        self.first_player = random.choice(range(len(self.players)))

        self.settings = settings

        self.round_counter = 0
        self.curr_round = None

    def run(self):
        logging.info("Starting Game...")

        limit = 11 # min(len(self.card_deck)//len(self.players), 11)

        self.history.set_start(datetime.now())

        while self.round_counter <= limit:
            self.round_counter += 1

            self.curr_round = Round(history=self.history, first_player=self.first_player, round_counter=self.round_counter)
            self.curr_round.start_round()

            self.first_player = (self.first_player + 1) % len(self.players)

            self.history.save_round()

            for p in self.players.values(): p.reset()

        self.history.set_end(datetime.now())

    def complete_action(self, user: User, option: str) -> None:
        self.players[user.user_id].complete_task(option)
