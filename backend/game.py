class Lobby:

    def __init__(self):
        random_id = "ASD1F"
        self.id = random_id
        return random_id

class Card:

    def __init__(self, id, value, variants=[]):
        self.id = id
        self.value = value
        self.variants = variants

class HandCard(Card):

    def __init__(self, id, value, variants, player):
        Card.__init(self, id, value, variants)
        self.player = player
        self.is_playable = True

class PlayedCard(Card):

    def __init__(self, id, value, player):
        Card.__init(self, id, value)
        self.player = player

class Player:

    def __init__(self, name):
        self.name = name
        self.score = 0
        self.tricks_called = 0
        self.tricks_made = 0
        self.cards = None

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

    def __init__(self, players, card_deck, trump_color, trick_count):
        self.trump_color = trump_color
        self.trick_count = trick_count
        self.players = players

    def start_round(self):
        for _ in range(self.trick_count):
            winner = new Trick(0, self.players).do_trick()
            self.players[winner].tricks_made += 1
        
        self.__calculate_points()


    def __hand_cards(self):
        for player in self.players:
            player.cards = [] #random
    
    def __calculate_points(self):
        for player in self.players:
            player.score = 0 #TODO



class Game:

    import itertools

    CARD_COLORS = ["red", "green", "yellow", "blue"]
    CARD_VALUES = itertools.chain(range(1, 14), ["wizard", "fool"])

    STANDARD_CARDS = [newCard("_".join(card_x), card_x[1]) for card_x in itertools.product(CARD_COLORS, CARD_VALUES)]
    SPECIAL_CARDS_1 = ["fairy", "dragon", "bomb", "cloud", "juggler", "werewolf"]
    SPECIAL_CARDS_1 = ["foozard"]

    def __init__(self, players, settings):
        self.settings = settings
        self.card_deck = STANDARD_CARDS #List of cards
        
        self.round_counter = 0

        self.current_round = new Round(players, self.card_deck, "random", self.round_counter)

    def start_game(self):
        while True:
            self.round_counter += 1
            self.current_round = new Round(players, "random", self.round_counter)



        