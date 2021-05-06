from .game import Game
from .round import Round, RoundState
from .trick import Trick, TrickState
from .player import Player, PlayerState, TaskState, HandCard

class GameInteraction:
    def __init__(self, game):
        self.game = game

    def get_player_state(player: Player) -> PlayerState:
        return player.get_state()

    def get_round_state() -> RoundState:
        round_o = self.__get_round()
        return round_o.get_state()

    def get_trick_state() -> TrickState:
        trick = self.__get_trick()
        return trick.get_state()

    def get_hand_cards(player: Player) -> list(HandCard):
        lead_color = self.__get_leand_color()
        return player.get_hand_cards(lead_color)

    def get_action_required(player: Player) -> TaskState:
        return player.get_task()

    def complete_action(argument: str, player: Player) -> list(HandCard):
        return player.complete_task(argument)


    def __get_round(self) -> Round:
        return self.game.curr_round

    def __get_trick(self) -> Trick:
        return self.__get_round().curr_trick

    def __get_leand_color(self) -> str:
        return self.__get_trick().lead_color