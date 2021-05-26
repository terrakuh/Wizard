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
    def __init__(self, mode: str, round_number: int=12):
        self.mode = mode
        self.round_number = round_number


class Game(threading.Thread):

    def __init__(self, users: List[User], settings: Settings):
        super().__init__()

        print("Creating...")

        self.history = GameHistory(settings)

        random.shuffle(users)
        print([str(u) for u in users])
        self.players = {user.user_id: Player(self.history, user, index) for index, user in enumerate(users)}
        self.history.set_players(self.players)

        print("Creating2...")

        self.first_player = random.choice(range(len(self.players)))

        self.settings = settings

        self.round_counter = 1
        print("Creating3...")
        self.curr_round = Round(history=self.history, first_player=self.first_player, round_counter=self.round_counter)
        
        self.history.update_round(self.curr_round)

        print("Game created")

    def run(self):
        logging.info("Starting Game...")

        limit = 11 # min(len(self.card_deck)//len(self.players), 11)

        self.history.set_start(datetime.now())

        ########

        self.__do_round()

        ########

        while self.round_counter <= limit-1:

            self.curr_round = Round(history=self.history, first_player=self.first_player, round_counter=self.round_counter)
            self.history.update_round(self.curr_round)

            self.__do_round()

        self.history.set_end(datetime.now())

    def __do_round(self):
        self.curr_round.start_round()

        self.first_player = (self.first_player + 1) % len(self.players)
        self.round_counter += 1
        
        self.history.save_round()
        for p in self.players.values(): p.reset()

    def complete_action(self, user: User, option: str) -> None:
        self.players[user.user_id].complete_task(option)
