import itertools
from .card import Card

class CardDecks:

    CARD_COLORS = ["red", "green", "yellow", "blue"]
    __CARD_VALUES = range(1, 14)
    __STANDARD_CARDS = list(itertools.chain([Card(card_x[0], str(card_x[0]), card_x[1]) for card_x in itertools.product(__CARD_VALUES, CARD_COLORS)], # Standard 1-13
                            itertools.chain.from_iterable([(Card(50, "wizard", color, False), Card(0, "fool", color, False)) for color in CARD_COLORS]))) # Wizards/Fools
    __SPECIAL_CARDS_1 = [
        Card(-1, "fairy"), 
        Card(51, "dragon"), 
        Card(-1, "bomb"), 
        Card(9.5, "cloud", variants=[Card(9.5, "cloud", color) for color in CARD_COLORS]), 
        Card(7.5, "juggler", variants=[Card(7.5, "juggler", color) for color in CARD_COLORS]), 
        Card(0, "werewolf")
    ]
    __SPECIAL_CARDS_2 = [Card(0, "foozard", variants=[Card(50, "foozard", "wizard", False), Card(0, "foozard", "fool", False)])]
    __VARIANTS = [Card(9.5, "cloud", color) for color in CARD_COLORS] + [Card(7.5, "juggler", color) for color in CARD_COLORS] + [Card(50, "foozard", "wizard", False), Card(0, "foozard", "fool", False)]
    MODES = {
        "Standard": __STANDARD_CARDS,
        "Jubiläum20": __STANDARD_CARDS +  __SPECIAL_CARDS_1,
        "Jubiläum25": __STANDARD_CARDS + __SPECIAL_CARDS_1 + __SPECIAL_CARDS_2,
    }

    CARDS = { card.id: card for card in (__STANDARD_CARDS + __SPECIAL_CARDS_1 + __SPECIAL_CARDS_2 + __VARIANTS) }
    TRUMP_SELECTION_CARDS = ["wizard", "dragon", "werewolf", "juggler", "cloud", "foozard"]
    NO_TRUMP_CARDS = ["fool", "fairy", "bomb"]