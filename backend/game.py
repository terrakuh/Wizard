class Lobby:

    def __init__(self):
        random_id = "ASD1F"
        self.id = random_id
        return random_id

class Card:

    def __init__(self, value, card_type, color=None, variants=[]):
        self.value = value # ~1-100
        self.card_type = card_type # 1-13, wizard, fool, dragon, ...
        self.color = color
        
        self.id = card_type if color is None else "_".join((color, str(card_type))) 

        self.variants = variants

    def __str__(self):
        return self.id

    def __repr__(self):
        return self.id

class HandCard():

    def __init__(self, card, player):
        self.card = card
        self.player = player

class PlayedCard(Card):

    def __init__(self, card, player):
        self.card = card
        self.player = player

class Player:

    def __init__(self, name):
        self.name = name
        self.score = 0
        self.tricks_called = 0
        self.tricks_made = 0
        self.cards = None

    def call_tricks(self):
        self.tricks_called = 1

    def play_card(lead_color) -> Card:
        return None


class Trick:

    from collections import deque

    def __init__(self, first_player, players):
        self.lead_color = None
        self.players = deque(players).rotate(first_player *(-1))

        self.card_stack = None

    def do_trick(self):
        for player in self.players:
            player.play_card(self.lead_color)
        
        return self.__get_winner()

    def __get_winner():
        return 0



class Round:

    import random

    def __init__(self, players, card_deck, trick_count):
        self.trump_color = self.random.choice(card_deck) #TODO
        self.trick_count = trick_count
        self.players = players

    def start_round(self):
        self.__handout_cards()
        self.__get_estimations()
        for _ in range(self.trick_count):
            winner = Trick(0, self.players).do_trick()
            self.players[winner].tricks_made += 1
        
        self.__calculate_points()

    def __handout_cards(self):
        for player in self.players:
            player.cards = [] #TODO random

    def __get_estimations(self):
        for player in self.players:
            player.call_tricks()
    
    def __calculate_points(self):
        for player in self.players:
            player.score = 0 #TODO



class Game:

    import itertools

    CARD_COLORS = ["red", "green", "yellow", "blue"]
    CARD_VALUES = range(1, 14)
    #(self, value, card_type, color=None, variants=[]):
    STANDARD_CARDS = list(itertools.chain([Card(card_x[0], card_x[0], card_x[1]) for card_x in itertools.product(CARD_VALUES, CARD_COLORS)], # Standard 1-13
                            itertools.chain.from_iterable([(Card(50, "wizard", color), Card(0, "fool", color)) for color in CARD_COLORS]))) # Wizards/Fools
    SPECIAL_CARDS_1 = [
        Card(0, "fairy"), 
        Card(51, "dragon"), 
        Card(52, "bomb"), 
        Card(9.5, "cloud", variants=[Card(9.5, "cloud", color) for color in CARD_COLORS]), 
        Card(7.5, "juggler", variants=[Card(7.5, "juggler", color) for color in CARD_COLORS]), 
        Card(0, "werewolf")
    ]
    SPECIAL_CARDS_2 = [Card(0, "foozard", variants=[Card(50, "wizard", "foozard"), Card(0, "fool", "foozard")])]

    def __init__(self, players, settings):
        self.settings = settings
        self.card_deck = Game.STANDARD_CARDS #List of cards
        self.round_counter = 0

    def start_game(self):
        while self.round_counter <= self.card_deck//len(players):
            self.round_counter += 1
            Round(players, self.card_deck, self.round_counter).start_round()

g = Game(None, None)


        