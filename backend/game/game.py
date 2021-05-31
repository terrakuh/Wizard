import threading
import random
import logging
from typing import Callable, List, Optional
from datetime import datetime
import asyncio

from .round import Round
from .card import Card
from .player import Player, User
from .card_decks import CardDecks
from .game_history import GameHistory

class Settings:
    def __init__(self, mode: str, round_number: int=12):
        self.mode = mode
        self.round_number = round_number


class Game():

    def __init__(self, users: List[User], settings: Settings, on_game_finish: Callable[[GameHistory], None]):
        super().__init__()

        print("Creating...")

        self.history = GameHistory(settings)
        self.on_game_finish = on_game_finish

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

    async def start(self):
        logging.info("Starting Game...")

        self.history.set_start(datetime.now())

        ########

        await self.__do_round()

        ########

        while self.round_counter <= self.settings.round_number:

            self.curr_round = Round(history=self.history, first_player=self.first_player, round_counter=self.round_counter)
            self.history.update_round(self.curr_round)

            await self.__do_round()

        self.history.set_end(datetime.now())
        self.on_game_finish(self.history)

    async def __do_round(self):
        await self.curr_round.start_round()

        self.first_player = (self.first_player + 1) % len(self.players)
        self.round_counter += 1
        
        self.history.save_round()
        for p in self.players.values(): p.reset()