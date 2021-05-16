from .game import Game
from .round import Round, RoundState
from .trick import Trick, TrickState
from .player import PlayerState, TaskState, HandCard, User

from typing import List, Optional

class GameInteraction:
    def __init__(self, game: Game):
        self.game = game

    def get_player_state(self, user: User) -> PlayerState:
        return self.game.players[user.user_id].get_state()

    def get_round_state(self) -> RoundState:
        round_o = self.__get_round()
        return round_o.get_state()

    def get_trick_state(self) -> TrickState:
        try:
            trick = self.__get_trick()
            return trick.get_state()
        except:
            return TrickState([player.get_state() for player in self.game.players.values()])

    def get_hand_cards(self, user: User) -> List[HandCard]:
        lead_color = self.__get_leand_color()
        return self.game.players[user.user_id].get_hand_cards(lead_color)

    def get_action_required(self, user: User) -> Optional[TaskState]:
        return self.game.players[user.user_id].get_task()

    def complete_action(self, argument: str, user: User) -> None:
        self.game.players[user.user_id].complete_task(argument)


    def __get_round(self) -> Round:
        return self.game.curr_round

    def __get_trick(self) -> Trick:
        return self.__get_round().curr_trick

    def __get_leand_color(self) -> Optional[str]:
        try: return self.__get_trick().lead_color
        except: return None
