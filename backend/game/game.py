from .round import Round
from .card import Card
from .player import Player

from .card_decks import CardDecks

class Game:

    import itertools
    import random
    import logging

    def __init__(self, players, settings):
        self.players = players
        self.random.shuffle(self.players)
        self.first_player = self.random.choice(range(len(self.players)))

        self.settings = settings

        self.card_deck = list(CardDecks.MODES[self.settings.get("mode")]) #List of cards

        self.round_counter = 0
        self.curr_round = None

    def start_game(self):
        self.logging.info("Starting Game...")
        while self.round_counter <= len(self.card_deck)//len(self.players):
            self.round_counter += 1

            game_context = {
                "mode": self.settings.get("mode"),
                "players": self.players,
                "first_player": self.first_player,
                "card_deck": self.card_deck.copy(),
                "round_counter": self.round_counter
            }

            self.curr_round = Round(game_context)
            self.curr_round.start_round()

            self.first_player = (self.first_player + 1) % len(self.players)

            for p in self.players: p.reset()




        