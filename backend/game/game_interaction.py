from .game import Game
from .round import Round, RoundState
from .trick import Trick, TrickState
from .player import Player, PlayerState, TaskState, HandCard

from typing import List

class GameInteraction:
    def __init__(self, game):
        self.game = game

    def get_player_state(self, player: Player) -> PlayerState:
        return player.get_state()

    def get_round_state(self) -> RoundState:
        round_o = self.__get_round()
        return round_o.get_state()

    def get_trick_state(self) -> TrickState:
        trick = self.__get_trick()
        return trick.get_state()

    def get_hand_cards(self, player: Player) -> List[HandCard]:
        lead_color = self.__get_leand_color()
        return player.get_hand_cards(lead_color)

    def get_action_required(self, player: Player) -> TaskState:
        return player.get_task()

    def complete_action(self, argument: str, player: Player) -> List[HandCard]:
        return player.complete_task(argument)


    def __get_round(self) -> Round:
        return self.game.curr_round

    def __get_trick(self) -> Trick:
        return self.__get_round().curr_trick

    def __get_leand_color(self) -> str:
        return self.__get_trick().lead_color