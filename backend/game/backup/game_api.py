from .game import Game
from .player import User, Player
from .card import Card
from .round import Round
from .trick import Trick

def __get_hand_card_state(card: Card, lead_color: str=None):
    card_id = card.id
    playable = card.is_playable(lead_color)
    variants = [get_hand_card_state(v_card, lead_color) for v_card in card.variants]
    return PlayableCard(card_id, playable, variants)

def __get_trick_card_state(card: Card, trick: Trick):
    card_id = card.id
    player = trick.card_stack_by_card[card].user
    is_winning = (player == trick.get_current_winner().user)
    return PlayedCard(card_id, player, is_winning)

def get_player_state(player: Player):
    return PlayerState(player.user, player.score, player.tricks_called, player.tricks_made)

def get_round_state(round_o: Round):
    return RoundState(round_o.trump_card.id, round_o.trump_color, round_o.round_number)

def get_trick_state(trick: Trick):
    if not trick:
        return None
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
        return get_hand_cards(player) #TODO ???

    raise Exception("No action required!")