class Lobby:

    def __init__(self):
        random_id = "ASD1F"
        self.id = random_id
        self.settings = None #TODO default
        return random_id

class Card:

    def __init__(self, value, card_type, color=None, color_bound=True, variants=[]):
        self.value = value # ~1-100
        self.card_type = card_type # 1-13, wizard, fool, dragon, ...

        self.color = color
        self.color_bound = False if not color else color_bound # tells if following cards have to admit color / color is relevant for admission
        
        self.id = card_type if not color else "_".join((color, str(card_type))) 

        self.variants = variants

    def __str__(self):
        return self.id

    def __repr__(self):
        return self.id

class Player:

    def __init__(self, name):
        self.name = name
        self.score = 0
        self.tricks_called = 0
        self.tricks_made = 0
        self.cards = None

    def select_trump_color(self) -> str:
        logging.info(self.name + " is selecting trump color...")
        return input()

    def call_tricks(self):
        logging.info(self.name + " is calling tricks")
        self.tricks_called = int(input())
        logging.info(self.name + " called " + str(self.tricks_called) +  " trick(s)")

    def play_card(self, lead_color) -> str:
        logging.info(self.name + ", play card! Your cards are: " + str(self.cards))
        card_selected = int(input())
        while not self.__is_playable(self.cards[card_selected], lead_color):
            print("Look harder!")
            card_selected = int(input())
        card_played = self.cards.pop(card_selected)
        logging.info(self.name + " has played " + str(card_played))
        card_variants = Game.CARDS.get(card_played).variants
        if card_variants:
            variant_selected = self.select_input(card_variants)
            logging.info(self.name + " has selected " + str(variant_selected))
            card_played = variant_selected.id
        return card_played

    def select_input(self, options):
        logging.info(self.name + " selecting from " + str(options) + " (enter 0-n)")
        selection = input()
        return options[int(selection)]

    def reset(self):
        self.tricks_called = 0
        self.tricks_made = 0
        self.cards = []

    def __is_playable(self, card, lead_color):
        card_o = Game.CARDS.get(card)
        if (not card_o.color_bound or not lead_color):
            print("color does not matter")
            return True
        else:
            playable_cards = list(filter(lambda card: card_o.color_bound and card_o.color == lead_color, self.cards))
            print("Playable: " + str(list(playable_cards)))
            return (not playable_cards) or (card in playable_cards)

    def __str__(self):
        return self.name

    def __repr__(self):
        return self.name

class Trick:

    def __init__(self, round_context):
        """
        round_context: {
                "mode": int,
                "players": list,
                "first_player": int,
                "trump_color": str
            }
        """
        self.game_mode = round_context.get("mode")
        self.players = round_context.get("players")
        self.first_player = round_context.get("first_player")
        self.trump_color = round_context.get("trump_color")

        self.lead_color = None
        self.card_stack = []

    def do_trick(self):
        player_count = len(self.players)

        logging.info("Trump color is " + str(self.trump_color))
        for i in range(player_count):
            card_played = self.players[(i + self.first_player) % player_count].play_card(self.lead_color)
            self.card_stack.append(card_played)
            logging.info("New stack: " + str(self.card_stack))
            card_played_o = Game.CARDS.get(card_played)
            if not self.lead_color and card_played_o.color_bound:
                self.lead_color = card_played_o.color
                logging.info("New lead color: " + self.lead_color)

        return self.__get_winner()

    def __get_winner(self):
        player_count = len(self.players)

        after_effect = None

        curr_winner = 0
        curr_max_value = -1
        for index, card in enumerate(self.card_stack):
            card_o = Game.CARDS.get(card)

            is_trump_color = card_o.color == self.trump_color

            if card_o.color == self.lead_color or is_trump_color:
                if is_trump_color:
                    card_o.value += 13

            elif self.game_mode > 0:
                if card_o.card_type == "fairy" and "dragon" in self.card_stack:
                    card_o.value = 52
                elif card_o.card_type == "bomb" or card_o.card_type == "juggler":
                    after_effect = card_o.card_type
                elif card_o.card_type == "cloud":
                    after_effect = None if "bomb" in self.card_stack else "cloud"

            if card_o.value > curr_max_value:
                curr_max_value = card_o.value
                curr_winner = (index + self.first_player) % player_count
                
            logging.info("Curr card: " + card + ", curr max: " + str(curr_max_value) + ", curr Winner: " + str(self.players[curr_winner]))

        logging.info("Trick: " + str(self.card_stack) + "; trump: " + self.trump_color)
        logging.info("Trick was won by " + self.players[curr_winner].name)
        return (curr_winner, after_effect)



class Round:
    """
    Round for one amount of cards (1, 2, 3, ...)
    """

    import random

    def __init__(self, game_context):
        """
        game_context: {
                mode: int,
                players: list,
                first_player: int,
                card_deck: list,
                round_counter: int
            }
        """
        self.game_mode = game_context.get("mode")

        self.round_number = game_context.get("round_counter")
        self.card_deck = game_context.get("card_deck")
        self.players = game_context.get("players")
        self.first_player = game_context.get("first_player")

    def start_round(self):
        logging.info("Starting round " + str(self.round_number))

        card_giver = self.players[(self.first_player - 1 + len(self.players)) % len(self.players)]

        unhanded_cards = self.__handout_cards()

        self.trump_card = self.random.choice(unhanded_cards)
        trump_card_o = Game.CARDS.get(self.trump_card)
        logging.info("Trump card is " + self.trump_card)

        self.trump_color = None if trump_card_o.card_type in Game.NO_TRUMP_CARDS else (card_giver.select_trump_color() if trump_card_o.card_type in Game.TRUMP_SELECTION_CARDS else trump_card_o.color)

        logging.info("Trump is " + str(self.trump_card) + " -> " + str(self.trump_color))

        # Werewolf
        if self.game_mode > 0:
            for player in self.players:
                try:
                    index_werewolf = player.cards.index("werewolf")
                    player.cards[index_werewolf] = self.trump_card
                    self.trump_card = "werewolf"
                    self.trump_color = player.select_trump_color()
                except ValueError:
                    pass

        self.__get_estimations()
        logging.info("Starting trick(s) for round " + str(self.round_number))
        winner = self.first_player
        for i in range(self.round_number):
            round_context = {
                "mode": self.game_mode,
                "players": self.players,
                "first_player": winner,
                "trump_color": self.trump_color
            }

            winner, after_effect = Trick(round_context).do_trick()

            winning_player = self.players[winner]

            logging.info("Trick winner is " + str(winning_player))

            if after_effect:
                logging.info("Got after effect " + after_effect)
                if after_effect == "cloud":
                    trick_modification = winning_player.select_input([-1, 1])
                    winning_player.tricks_called += trick_modification
                if after_effect == "juggler" and i < self.round_number - 1:
                    passed_cards = list(map(lambda player: player.select_input(player.cards), self.players))
                    for index, card in enumerate(passed_cards):
                        self.players[index].cards.pop(card)
                        self.players[(index + 1) % len(self.players)].append(card)

            winning_player.tricks_made += 0 if after_effect == "bomb" else 1
            logging.info("Trick completed")
        
        self.__calculate_points()

    def __handout_cards(self):
        """
        Returns: left cards
        """
        self.random.shuffle(self.card_deck)
        player_count = len(self.players)

        for i in range(player_count):
            index = (i + self.first_player) % player_count
            player = self.players[index]

            player.cards = self.card_deck[index:player_count*self.round_number:player_count]
            logging.info("Player " + player.name + " got cards: " + str(player.cards))

        return self.card_deck[player_count*self.round_number:]

    def __get_estimations(self):
        player_count = len(self.players)

        for i in range(player_count):
            player = self.players[(i + self.first_player) % player_count]
            player.call_tricks()
    
    def __calculate_points(self):
        for player in self.players:
            if player.tricks_called == player.tricks_made:
                player.score += 10 + 20 * player.tricks_called
            else:
                player.score -= 20 * abs(player.tricks_called - player.tricks_made)
            logging.info("New score of " + player.name + " is " + str(player.score))


class Game:

    import itertools
    import random
    import logging

    __CARD_COLORS = ["red", "green", "yellow", "blue"]
    __CARD_VALUES = range(1, 14)
    __STANDARD_CARDS = list(itertools.chain([Card(card_x[0], str(card_x[0]), card_x[1]) for card_x in itertools.product(__CARD_VALUES, __CARD_COLORS)], # Standard 1-13
                            itertools.chain.from_iterable([(Card(50, "wizard", color, False), Card(0, "fool", color, False)) for color in __CARD_COLORS]))) # Wizards/Fools
    __SPECIAL_CARDS_1 = [
        Card(-1, "fairy"), 
        Card(51, "dragon"), 
        Card(-1, "bomb"), 
        Card(9.5, "cloud", variants=[Card(9.5, "cloud", color) for color in __CARD_COLORS]), 
        Card(7.5, "juggler", variants=[Card(7.5, "juggler", color) for color in __CARD_COLORS]), 
        Card(0, "werewolf")
    ]
    __SPECIAL_CARDS_2 = [Card(0, "foozard", variants=[Card(50, "foozard", "wizard", False), Card(0, "foozard", "fool", False)])]
    __VARIANTS = [Card(9.5, "cloud", color) for color in __CARD_COLORS] + [Card(7.5, "juggler", color) for color in __CARD_COLORS] + [Card(50, "foozard", "wizard", False), Card(0, "foozard", "fool", False)]
    __MODES = {
        0: map(lambda card: card.id, __STANDARD_CARDS),
        1: map(lambda card: card.id, (__STANDARD_CARDS +  __SPECIAL_CARDS_1)),
        2: map(lambda card: card.id, (__STANDARD_CARDS + __SPECIAL_CARDS_1 + __SPECIAL_CARDS_2)),
    }


    CARDS = { card.id: card for card in (__STANDARD_CARDS + __SPECIAL_CARDS_1 + __SPECIAL_CARDS_2 + __VARIANTS) }
    TRUMP_SELECTION_CARDS = ["wizard", "dragon", "werewolf", "juggler", "cloud", "foozard"]
    NO_TRUMP_CARDS = ["fool", "fairy", "bomb"]

    def __init__(self, players, settings):
        self.players = players
        self.random.shuffle(self.players)
        self.first_player = self.random.choice(range(len(self.players)))

        self.settings = settings

        self.card_deck = list(Game.__MODES[self.settings.get("mode")]) #List of cards

        self.round_counter = 0

    def start_game(self):
        logging.info("Starting Game...")
        while self.round_counter <= len(self.card_deck)//len(players):
            self.round_counter += 1

            game_context = {
                "mode": self.settings.get("mode"),
                "players": self.players,
                "first_player": self.first_player,
                "card_deck": self.card_deck.copy(),
                "round_counter": self.round_counter
            }

            Round(game_context).start_round()

            self.first_player = (self.first_player + 1) % len(self.players)

            for p in self.players: p.reset()

import logging

logging.basicConfig(level=logging.DEBUG)

players = [Player("Maxi"), Player("Yunus"), Player("Flo")]

g = Game(players, {"mode":2})

g.start_game()


        