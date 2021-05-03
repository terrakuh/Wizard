from .game import Game
from .player import Player
from .card import Card
from .round import Round
from .trick import Trick

def get_card_info(card: Card, lead_color: str):
    return {
        "id": card.id,
        "playable": card.is_playable(lead_color),
        "variants": [get_card_info(card_v) for card_v in card.variants]
    }

def get_player_state(player: Player):
    return {
        "user": player.user_id,
        "name": player.name,
        "score": player.score,
        "tricks_called": player.tricks_called,
        "tricks_made": player.tricks_made
    }

def get_round_state(round: Round):
    return {
        "number": round.round_number,
        "trump_color": round.trump_color
    }

def get_trick_state(trick: Trick):
    return {
        "players": [get_player_state(player) for player in trick.players],
        "lead_color": trick.lead_color,
        "trick_number": trick.trick_number,
        "turn": {
            "id": trick.curr_player.user_id,
            "name": trick.curr_player.name
        },
        "cards": [get_card_info(card, trick.lead_color) for card in trick.card_stack_by_player.values()]
    }

def get_hand_cards(player: Player, lead_color: str=None):
    return [get_card_info(card, lead_color) for card in player.cards.values()]

def get_action_required(player: Player):
    return player.current_task.task_type if player.current_task else None

def play_card(card_id: str, player: Player, lead_color: str=None) -> list:
    player_task = player.current_task
    if player_task and player_task.task_type == "play_card":
        player_task.get_input(card_id)
    
    return get_hand_cards(player, lead_color)

def complete_action(argument: str, player: Player):
    player_task = player.current_task
    if player_task and player_task.task_type.startswith("choose_"):
        player_task.get_input(argument)
    
    return True

def call_tricks(amount: int, player: Player):
    print(player.name + " is calling in interface: " + str(amount))
    player_task = player.current_task
    if player_task and player_task.task_type == "call_tricks":
        print("Passing to game")
        player_task.get_input(amount)
        return True
    
    return False
