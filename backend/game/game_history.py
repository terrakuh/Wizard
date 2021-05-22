from datetime import datetime
import threading
import copy

# from .game import Settings
from .card_decks import CardDecks
# from .trick import Trick
# from .player import User, Player, PlayerTask
# from .round import Round

class RoundInfo:

    def __init__(self, round, tricks: list, players: list) -> None:
        self.round = round # Round
        self.tricks = tricks # list[Trick]
        self.players = players # list[Player]

class GameHistory:

    def __init__(self, settings):
        self.settings = settings

        self.start_time: datetime = None
        self.end_time: datetime = None

        self.players_dict = None # dict[str, Player]
        self.players = None # list[Player]

        self.curr_round = None # Round
        self.curr_tricks = [] # list[Trick]

        self.rounds: list[RoundInfo] = []

        self.lock = threading.Lock()


    # Time management
    def set_start(self, time: datetime) -> None:
        self.start_time = time
    
    def set_end(self, time: datetime) -> None:
        self.end_time = time


    # Player management
    def set_players(self, players) -> None:
        self.players_dict = players # dict[str, Player]
        self.players = list(players.values())

    def update_player(self, player) -> None:
        self.players_dict[player.user.user_id] = copy.deepcopy(player)
        self.players = list(self.players_dict.values())

    def remove_player(self, user_id: str) -> None:
        del self.players_dict[user_id]
        self.players = list(self.players_dict.values())

    def get_players(self): # -> list[Player]
        return self.players

    def get_player(self, index: int): # -> Player
        return self.players[index]

    def get_player_count(self):
        return len(self.players)

    def get_hand_cards(self, user): # -> list[Card]
        return list(self.players_dict[user.user_id].cards.values())
    
    def get_playable_cards(self, user) -> list[str]:
        return self.players_dict[user.user_id].get_playable_cards(self.get_lead_color())

    def get_player_task(self, user): # -> PlayerTask
        return self.players_dict[user.user_id].current_task


    # Mode
    def is_special_mode(self):
        return self.settings.mode != CardDecks.MODES.keys()[0]


    # Round management
    def update_round(self, curr_round) -> None:
        self.curr_round = copy.deepcopy(curr_round)

    def save_round(self) -> None:
        self.rounds.append(RoundInfo(self.curr_round, self.curr_tricks, self.players))

        self.curr_round = None
        self.curr_tricks = None

    def get_curr_round(self): # -> Round
        return self.curr_round

    def get_trump_color(self) -> str:
        return self.curr_round.trump_color


    # Trick management
    def add_trick(self, trick):
        with self.lock:
            self.curr_tricks.append(copy.deepcopy(trick))

    def update_trick(self, trick) -> None:
        with self.lock:
            self.curr_tricks[-1] = copy.deepcopy(trick)

    def get_lead_color(self) -> str:
        trick = self.get_curr_trick()
        return None if trick is None else trick.lead_color

    def get_curr_trick(self): # -> Trick
        if len(self.curr_tricks) > 0:
            return self.curr_tricks[-1]

    def get_last_trick(self): # -> Trick
        if len(self.curr_tricks) > 1:
            return self.curr_tricks[-2]
