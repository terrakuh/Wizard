class Lobby:

    def __init__(self):
        random_id = "ASD1F"
        self.id = random_id
        self.settings = None #TODO default
        return random_id

class Card:

    def __init__(self, value, card_type, color_bound=True, color=None, variants=[]):
        self.value = value # ~1-100
        self.card_type = card_type # 1-13, wizard, fool, dragon, ...

        self.color_bound = False if not color else color_bound # tells if following cards have to admit color / color is relevant for admission
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
        self.tricks_made = []
        self.cards = None

    def call_tricks(self):
        #TODO API
        self.tricks_called = 1

    def play_card(lead_color) -> Card:
        card_selected = 0 #TODO API
        while not self.__is_playable(self.cards[card_selected], lead_color):
            #TODO Return API Look harder!
            card_selected = 0 #TODO API
        return self.cards.pop(card_selected)

    def reset_player(self):
        self.tricks_called = 0
        self.tricks_made = []
        self.cards = []

    def __is_playable(self, card, lead_color):
        if (card.is_special or lead_color is None):
            return True
        else:
            playable_cards = filter(lambda card: not card.is_special and card.color == lead_color, self.cards)
            return (not playable_cards) or (card in playable_cards)

class Trick:

    def __init__(self, first_player, players):
        self.lead_color = None
        self.first_player = first_player
        self.players = players

        self.card_stack = []

    def do_trick(self):
        player_count = len(self.players)

        for i in range(player_count):
            card_played = self.players[(i+self.first_player) mod player_count].play_card(self.lead_color)
            self.card_stack.append(card_played)
            if not self.lead_color and card_played.color_bound:
                self.lead_color = card_played.color

        return self.__get_winner()

    def __get_winner():
        max_index, max_card = max(self.card_stack, key=lambda card: card.value)
        return self.players[max_index]



class Round:
    """
    Round for one amount of cards (1, 2, 3, ...)
    """

    import random

    def __init__(self, players, card_deck, trick_count):
        self.trick_count = trick_count
        self.players =  list(players.map(lambda player: player .reset_player()))

    def start_round(self):
        unhanded_cards = self.__handout_cards()
        self.trump_card = self.random.choice(unhanded_cards)
        self.__get_estimations()
        for _ in range(self.trick_count):
            winner = Trick(0, self.players).do_trick()
            self.players[winner].tricks_made += 1
        
        self.__calculate_points()

    def __handout_cards(self):
        """
        Returns: left cards
        """
        cards_shuffeled = random.shuffle(self.card_deck)
        player_count = len(self.players)

        for index, player in enumerate(self.players):
            player.cards = cards_shuffeled[index:player_count*self.trick_count:player_count]

        return cards_shuffeled[player_count*self.trick_count:]

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
                            itertools.chain.from_iterable([(Card(50, "wizard", False, color), Card(0, "fool", False, color)) for color in CARD_COLORS]))) # Wizards/Fools
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
            Round(players, self.card_deck.copy(), self.round_counter).start_round()

g = Game(None, None)


        