from datetime import datetime
import logging
import threading
import copy
from game.card_decks import CardDecks

from typing import TYPE_CHECKING
if TYPE_CHECKING:
    from game.player import TaskInfo
    from game.round import Round
    from game.player import Player
    from game.trick import Trick
    from game.game import Settings
    from game.card import Card


class TrickInfo:
    def __init__(self, trick: "Trick", actions: list["TaskInfo"]) -> None:
        self.trick = trick # Trick
        self.actions = actions # list[TaskInfo]


class RoundInfo:
    def __init__(self, round: "Round", round_actions: list["TaskInfo"], tricks: list[TrickInfo], players: list["Player"]) -> None:
        self.round = round
        self.round_actions = round_actions
        self.tricks = tricks
        self.players = players


class GameHistory:
    def __init__(self, settings: "Settings"):
        self.settings = settings

        self.start_time: datetime = None
        self.end_time: datetime = None

        self.players_dict: dict[str, "Player"] = None
        self.players_dict_sync: dict[str, "Player"] = None
        self.players_sync: list[Player] = None

        self.curr_round: "Round" = None
        self.curr_trick: "Trick" = None

        self.curr_tricks: list[TrickInfo] = []

        self.curr_round_actions: list["TaskInfo"] = []
        self.curr_trick_actions: list["TaskInfo"] = []

        self.rounds: list[RoundInfo] = []

        self.lock = threading.Lock()


    # Time management
    def set_start(self, time: datetime) -> None:
        self.start_time = time
    
    def set_end(self, time: datetime) -> None:
        self.end_time = time


    # Player management
    def set_players(self, players: dict[str, "Player"]) -> None:
        print("Setting...")
        with self.lock:
            print("Setting...")
            self.players_dict = players # dict[str, Player]
            self.players_dict_sync = copy.deepcopy(players)
            self.players_sync = list(self.players_dict_sync.values())
            print("Set...")

    def update_player(self, user_id: str) -> None:
        with self.lock:
            self.players_dict_sync[user_id] = copy.deepcopy(self.players_dict[user_id])
            self.players_sync = list(self.players_dict_sync.values())

    def get_players_sync(self) -> list["Player"]:
        with self.lock:
            return self.players_sync

    def get_players(self) -> list["Player"]:
        with self.lock:
            return list(self.players_dict.values())

    def get_player(self, index: int) -> "Player":
        with self.lock:
            return list(self.players_dict.values())[index]

    def get_player_count_sync(self) -> int:
        with self.lock:
            return len(self.players_sync)

    def get_hand_cards_sync(self, user_id: str) -> list["Card"]:
        with self.lock:
            cards = self.players_dict_sync[user_id].cards
            return [] if (cards is None) else list(cards.values())
    
    def get_playable_sync(self, user_id: str) -> list[str]:
        lead_color = self.__get_lead_color()
        with self.lock:
            return self.players_dict_sync[user_id].get_playable_cards(lead_color)

    def get_player_task_sync(self, user_id: str) -> "TaskInfo":
        with self.lock:
            return self.players_dict_sync[user_id].current_task

    # Player mutations
    def remove_player_sync(self, user_id: str) -> None:
        del self.players_dict[user_id]
        del self.players_dict_sync[user_id]

        self.players_sync = list(self.players_dict_sync.values())

    async def complete_task_sync(self, user_id: str, option: str) -> None:
        await self.players_dict[user_id].complete_task(option)
        self.update_player(user_id)


    # Mode
    def is_special_mode(self) -> bool:
        with self.lock:
            return self.settings.mode != list(CardDecks.MODES.keys())[0]


    # Round management
    def update_round(self, curr_round: "Round") -> None:
        with self.lock:
            self.curr_round = copy.deepcopy(curr_round)

    def save_round(self) -> None:
        with self.lock:
            self.__save_trick()
            self.rounds.append(RoundInfo(self.curr_round, self.curr_round_actions, self.curr_tricks, self.players_sync))

            self.curr_round = None
            self.curr_round_actions = []
            self.curr_tricks = []

    def get_curr_round_sync(self): # -> Round
        with self.lock:
            return self.curr_round

    def get_trump_color_sync(self) -> str:
        with self.lock:
            return self.curr_round.trump_color

    
    # Action management
    def add_action(self, task_info: "TaskInfo") -> None:
        print("Adding taks...")
        print(self.lock.locked)
        with self.lock:
            print("Adding taks with lock...")
            if self.curr_trick is None:
                self.curr_round_actions.append(copy.deepcopy(task_info))
            else:
                self.curr_trick_actions.append(copy.deepcopy(task_info))


    # Trick management
    def add_trick(self, trick: "Trick") -> None:
        with self.lock:
            if self.curr_trick is not None:
                self.__save_trick()
            self.curr_trick = copy.deepcopy(trick)

    def update_trick(self, trick: "Trick") -> None:
        with self.lock:
            self.curr_trick = copy.deepcopy(trick)

    def __save_trick(self) -> None:
        self.curr_tricks.append(TrickInfo(self.curr_trick, self.curr_trick_actions))

        self.curr_trick = None
        self.curr_trick_actions = []

    def __get_lead_color(self) -> str:
        trick = self.curr_trick
        return None if trick is None else trick.lead_color

    def get_curr_trick_sync(self) -> "Trick":
        with self.lock:
            return self.curr_trick

    def get_last_trick_sync(self) -> "Trick":
        with self.lock:
            if len(self.curr_tricks) > 0:
                return self.curr_tricks[-1].trick
