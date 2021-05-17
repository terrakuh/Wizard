from .types import User as UserType, PlayerState as PlayerStateType, RoundState as RoundStateType, TrickState as TrickStateType, PlayedCard, PlayableCard, RequiredAction
from game.player import PlayerState, PlayerTask, HandCard, User
from game.trick import TrickState, TrickCard
from game.round import RoundState
from game.card_decks import CardDecks

from typing import List

def parse_lobby():
    pass
def parse_graphene_lobby():
    pass

def parse_login_information():
    pass
def parse_graphene_login_information():
    pass

def parse_user(user: User) -> UserType:
    return UserType(id=user.user_id, name=user.name)
def parse_graphene_user(user: UserType) -> User:
    return User(user.id, user.name)

def parse_player_state(ps: PlayerState) -> PlayerStateType:
    return PlayerStateType(player=parse_user(ps.player), score=ps.score, tricks_called=ps.tricks_called, tricks_made=ps.tricks_made)
def parse_graphene_player_state(ps: PlayerStateType) -> PlayerState:
    return PlayerState(parse_graphene_user(ps.player), ps.score, ps.tricks_called, ps.tricks_made)

def __parse_trick_card(tc: TrickCard) -> PlayedCard:
    return PlayedCard(id=tc.card_id, player=parse_user(tc.player), is_winning=tc.is_winning)
def __parse_played_card(pc: PlayedCard) -> TrickCard:
    return TrickCard(pc.id, parse_graphene_user(pc.player), pc.is_winning)

def parse_trick_cards(tcs: List[TrickCard]) -> List[PlayedCard]:
    return [__parse_trick_card(card) for card in tcs]
def parse_played_cards(pcs: List[PlayedCard]) -> List[TrickCard]:
    return [__parse_played_card(card) for card in pcs]

def __parse_hand_card(hc: HandCard) -> PlayableCard:
    return PlayableCard(id=hc.card_id, playable=hc.playable, variants=parse_hand_cards(hc.variants))
def __parse_playable_card(pc: PlayableCard) -> HandCard:
    return HandCard(pc.id, pc.playable, parse_playable_cards(pc.variants))

def parse_hand_cards(hcs: List[HandCard]) -> List[PlayableCard]:
    return [__parse_hand_card(card) for card in hcs]
def parse_playable_cards(pcs: List[PlayableCard]) -> List[HandCard]:
    return [__parse_playable_card(card) for card in pcs]

def parse_trick_state(ts: TrickState) -> TrickStateType:
    player_states = [parse_player_state(player_state) for player_state in ts.players_states]
    if ts.lead_card is not None: lead_card = __parse_trick_card(ts.lead_card)
    else: lead_card = None
    if ts.turn is not None: turn = parse_user(ts.turn)
    else: turn = None
    if ts.cards is not None: deck = parse_trick_cards(ts.cards)
    else: deck = None
    return TrickStateType(player_states=player_states, lead_color=ts.lead_color, lead_card=lead_card, round=ts.trick_number, turn=turn, deck=deck)
def parse_graphene_trick_state(ts: TrickStateType) -> TrickState:
    player_states = [parse_graphene_player_state(player_state) for player_state in ts.player_states]
    lead_card = __parse_played_card(ts.lead_card)
    turn = parse_graphene_user(ts.turn)
    cards = parse_played_cards(ts.deck)
    return TrickState(player_states, ts.lead_color, lead_card, ts.round, turn, cards)

def parse_player_task(pt: PlayerTask) -> RequiredAction:
    return RequiredAction(type=pt.task_type, options=pt.options)
def parse_required_action(ra: RequiredAction) -> PlayerTask:
    return PlayerTask(ra.type, ra.options)

def parse_round_state(rs: RoundState) -> RoundStateType:
    past_tricks = [parse_trick_cards(trick_cards) for trick_cards in rs.past_tricks]
    return RoundStateType(trump_color=rs.trump_color, trump_card=CardDecks.CARDS.get(rs.trump_card), round=rs.round_number, past_tricks=past_tricks)
def parse_graphene_round_state(rs: RoundStateType) -> RoundState:
    past_tricks = [parse_played_cards(played_cards) for played_cards in rs.past_tricks] 
    return RoundState(rs.trump_card, rs.trump_color, rs.round, past_tricks)
