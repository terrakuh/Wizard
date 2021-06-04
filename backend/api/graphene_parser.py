from .types import User as UserType, PlayerState, RoundState, TrickState, PlayedCard, PlayableCard, RequiredAction

from game.card import Card
from game.game_history import GameHistory
from game.round import Round
from game.trick import Trick
from game.player import Player, TaskInfo, User
from game.card_decks import CardDecks


def get_player_states(history: GameHistory) -> list[PlayerState]:
    return __parse_players(history.get_players())

def get_hand(history: GameHistory, user: User) -> list[PlayableCard]:
    cards = history.get_hand_cards_sync(user.user_id)
    if cards is not None:
        return __parse_hand_cards(cards, history.get_playable_sync(user.user_id))

def get_action(history: GameHistory, user: User) -> RequiredAction:
    task = history.get_player_task_sync(user.user_id)
    if task is not None:
        return __parse_player_task(task)

def get_trick_state(history: GameHistory) -> TrickState:
    trick = history.get_curr_trick_sync()
    if trick is not None:
        print("Parser: ", trick.__dict__)
        return __parse_trick(trick)

def get_round_state(history: GameHistory) -> RoundState:
    curr_round = history.get_curr_round_sync()
    if curr_round is not None:
        return __parse_round(curr_round, history.get_last_trick_sync())


def __parse_round(rd: Round, last_trick: Trick) -> RoundState:
    return RoundState(trump_color=rd.trump_color, trump_card=rd.trump_card.id, round=rd.round_number, past_trick=__parse_trick(last_trick))


def __parse_trick(trick: Trick) -> TrickState:
    if trick is not None:
        return TrickState(lead_color=trick.lead_color, lead_card=__parse_trick_card(trick, trick.lead_card), round=trick.trick_number, deck=__parse_trick_cards(trick))

def __parse_trick_cards(trick: Trick) -> list[PlayedCard]:
    return [__parse_trick_card(trick, card) for card in trick.get_cards()]

def __parse_trick_card(trick: Trick, card: Card):
    if card is not None:
        print("Trick ", trick)
        player = trick.get_player(card.id)
        return PlayedCard(id=card.id, player=parse_user(player.user), is_winning=(trick.get_current_winner()==player))


def __parse_hand_cards(cards: list[Card], playable_cards: list[str]=None) -> list[PlayableCard]:
    if cards is not None:
        return [__parse_hand_card(card, playable_cards) for card in cards]

def __parse_hand_card(card: Card, playable_cards: list[str]) -> PlayableCard:
    playable = True if playable_cards is None else (card.id in playable_cards)
    return PlayableCard(id=card.id, playable=playable)


def __parse_player_task(task: TaskInfo) -> RequiredAction:
    print("Task", task.task_type)
    return RequiredAction(type=task.task_type, options=task.options)

def __parse_players(players: list[Player]) -> list[PlayerState]:
    return [__parse_player(p) for p in players]

def __parse_player(player: Player) -> PlayerState:
    return PlayerState(player=parse_user(player.user), score=player.score, is_active=player.is_active, tricks_called=player.tricks_called, tricks_made=player.tricks_made)


def parse_user(user: User) -> UserType:
    return UserType(id=user.user_id, name=user.name)
