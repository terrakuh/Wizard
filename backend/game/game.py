from api.types import User
from typing import List
from .round import Round
from .card import Card
from .player import Player
from threading import Thread
from .card_decks import CardDecks


class Settings:
    mode: int = 0


class Game(Thread):

    import itertools
    import random
    import logging

    def __init__(self, users: List[User], settings: Settings):
        super().__init__()
        self.random.shuffle(users)
        self.players = {user.id: Player(user) for user in users}
        self.first_player = self.random.choice(range(len(self.players)))

        self.settings = settings

        self.card_deck = list(CardDecks.MODES[self.settings.mode]) #List of cards

        self.round_counter = 0
        self.curr_round = None

    def run(self):
        self.logging.info("Starting Game...")
        while self.round_counter <= len(self.card_deck)//len(self.players):
            self.round_counter += 1

            game_context = {
                "mode": self.settings.mode,
                "players": list(self.players.values()),
                "first_player": self.first_player,
                "card_deck": self.card_deck.copy(),
                "round_counter": self.round_counter
            }

            self.curr_round = Round(game_context)
            self.curr_round.start_round()

            self.first_player = (self.first_player + 1) % len(self.players)

            for p in self.players.values(): p.reset()
