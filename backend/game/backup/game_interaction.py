from .game_history import GameHistory
from .round import Round
from .trick import Trick
from .player import Player

class TrickCard:
    def __init__(self, card_id: str, player: Player, is_winning: bool) -> None:
        pass

class TrickState:
    def __init__(self, lead_color: str, lead_card: TrickCard, trick_number: int, card_stack: list[TrickCard]) -> None:
        pass

class RoundState:
    def __init__(self, trump_color: str, trump_card: str, round_numer: int, past_trick: TrickState) -> None:
        self.trump_color

class PlayerState:
    def __init__(self, player: Player) -> None:
        self.user = player.user
        self.score = player.score
        self.tricks_called = player.tricks_called
        self.tricks_made = player.tricks_made
        self.is_active = player.is_active


class GameInteraction:
    def __init__(self, history: GameHistory):
        self.history = history

    def get_player_state(self, user: User) -> PlayerState:
        return self.game.players[user.user_id].get_state()

    def get_round_state(self) -> RoundState:
        round_o = self.__get_round()
        return round_o.get_state()

    def get_trick_state(self) -> TrickState:
        try:
            trick = self.__get_trick()
            return trick.get_state()
        except Exception:
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
