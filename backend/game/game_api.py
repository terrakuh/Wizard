from .game import Game
from .player import User, Player
from .card import Card
from .round import Round
from .trick import Trick

def get_hand_card_state(card: Card, lead_color: str=None):
    card_id = card.id
    playable = card.is_playable(lead_color)
    variants = [get_hand_card_state(v_card, lead_color) for v_card in card.variants]
    return PlayableCard(card_id, playable, variants)

def get_trick_card_state(card: Card, trick: Trick):
    card_id = card.id
    player = trick.card_stack_by_card[card].user
    is_winning = (player == trick.get_current_winner().user)
    return PlayedCard(card_id, player, is_winning)

def get_player_state(player: Player):
    return PlayerState(player.user, player.score, player.tricks_called, player.tricks_made)

def get_round_state(round_o: Round):
    return RoundState(round_o.trump_card.id, round_o.trump_color, round_o.round_number)

def get_trick_state(trick: Trick):
    players =  [PlayerState(player.user, player.score, player.tricks_called, player.tricks_made) for player in trick.players]
    lead_color = trick.lead_color
    trick_number = trick.trick_number
    turn = trick.curr_player.user
    cards = [get_trick_card_state(card, trick) for card in trick.card_stack_by_player.values()]
    return TrickState(players, lead_color, trick_number, turn, cards)

def get_hand_cards(player: Player, lead_color: str=None):
    return [get_hand_card_state(card, lead_color) for card in player.cards.values()]

def get_action_required(player: Player):
    task = player.current_task
    if task:
        return RequiredAction(task.task_type, task.options)
    return None

def complete_action(argument: str, player: Player):
    task = player.current_task
    if player_task:
        player_task.get_input(argument)
        return True


class PlayerState:
    def __init__(self, player: User, score: int, tricks_called: int, tricks_made: int):
        self.player = player
        self.score = score
        self.tricks_called = tricks_called
        self.tricks_made = tricks_made

class RoundState:
    def __init__(self, trump_card: str, trump_color: str, round_number: int):
        self.trump_card = trump_card
        self.trump_color = trump_color
        self.round_number = round_number

class PlayableCard:
    def __init__(self, card_id: str, playable: bool, variants: list[PlayableCard]):
        self.card_id = card_id
        self.playable = playable
        self.variants = variants

class PlayedCard:
    def __init__(self, card_id: str, player: User, is_winning: bool):
        self.card_id = card_id
        self.player = player
        self.is_winning = is_winning

class TrickState:
    def __init__(self, player_states: list[PlayerState], lead_color: str, trick_number: int, turn: User, cards: list[PlayedCard]):
        self.players_states = player_states
        self.lead_color = lead_color
        self.trick_number = trick_number
        self.turn = turn
        self.cards = cards

class RequiredAction:
    def __init__(self, action_type: str, options: list[str]):
        self.trump_color = trump_color
        self.round_number = round_number