from .types import PlayableCard, User, PlayerState

def cards_to_playable_cards(cards: list):
    """
    "id": card.id,
    "playable": card.is_playable(lead_color),
    "variants": [get_card_info(card_v) for card_v in card.variants]
    """
    playable_cards = []
    for card in cards:
        variants = cards_to_playable_cards(card.variants) if card.variants else None
        playable_cards.append(PlayableCard(id=card["id"], playable=card["playable"], variants=variants))
    return playable_cards

def players_to_player_states(players: list):
    """
    "user": player.user_id,
    "score": player.score,
    "tricks_called": player.tricks_called,
    "tricks_made": player.tricks_made
    """
    player_states = []
    for player in players:
        user = User(id=player["id"], name=player["name"])
        player_state = PlayerState(player=user, score=player["score"], tricks_called=player["tricks_called"], tricks_made=player["tricks_made"])
        player_states.append(player_state)
    return player_states