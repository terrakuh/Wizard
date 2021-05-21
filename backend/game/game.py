import threading
import random
import logging
from typing import List, Optional
from time import sleep

from .round import Round
from .card import Card
from .player import Player, User
from .card_decks import CardDecks

class Settings:
    def __init__(self, mode: str):
        self.mode = mode


class Game(threading.Thread):

    def __init__(self, users: List[User], settings: Settings):
        super().__init__()

        random.shuffle(users)
        self.players = {user.user_id: Player(user) for user in users}
        self.first_player = random.choice(range(len(self.players)))

        self.settings = settings

        self.card_deck = CardDecks.MODES[self.settings.mode] # List of cards

        self.round_counter = 0
        self.curr_round = None

    def run(self):
        logging.info("Starting Game...")

        limit = min(len(self.card_deck)//len(self.players), 11)

        while self.round_counter <= limit:
            self.round_counter += 1

            mode = 0 if self.settings.mode == "Standard" else 1
            self.curr_round = Round(mode=mode, players=list(self.players.values()), first_player=self.first_player, card_deck=self.card_deck, round_counter=self.round_counter)
            print("ARE SAME IN GAME: " + str(list(self.players.values())[0] is self.curr_round.players[0]))
            self.curr_round.start_round()

            self.first_player = (self.first_player + 1) % len(self.players)

            for p in self.players.values(): p.reset()
