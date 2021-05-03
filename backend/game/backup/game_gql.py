class Lobby:

    def __init__(self):
        random_id = "ASD1F"
        self.id = random_id
        self.settings = None #TODO default
        return random_id

class Card:

    def __init__(self, value: int, card_type: str, color=None: str, color_bound=True: bool, variants=[]: list):
        self.value = value # ~1-100
        self.card_type = card_type # 1-13, wizard, fool, dragon, ...

        self.color = color
        self.color_bound = False if not color else color_bound # tells if following cards have to admit color / color is relevant for admission
        
        self.id = card_type if not color else "_".join((color, str(card_type))) 

        self.variants = variants

    def is_playable(self, lead_color: str):
        return not self.color_bound or self.color == lead_color

    def __str__(self):
        return self.id

    def __repr__(self):
        return self.id

class Player:

    def __init__(self, user):
        self.user_id = user.id
        self.name = user.name

        self.score = 0
        self.tricks_called = 0
        self.tricks_made = 0
        self.cards = None

        self.current_task = None

    def call_tricks(self, called_tricks: int, max_tricks: int) -> str:
        valid_values = list(range(max_tricks + 1))
        left_tricks = max_tricks - called_tricks

        if left_tricks >= 0:
            valid_values.remove(left_tricks)

        self.current_task = self.UserTask("call_tricks", self, valid_values)

        return self.current_task.do_task()

    def play_card(self, lead_color: str) -> str:
        valid_values = self.get_playable_cards(lead_color)

        def payload(user_input):
            card_variants = self.cards.get(user_input).variants
            if card_variants:
                variant_selected = self.select_input(card_variants)
                logging.info(self.name + " has selected " + str(variant_selected))
                return variant_selected
            return user_input
        
        self.current_task = self.UserTask("play_card", self, valid_values)
        
        return self.current_task.do_task(payload)

    def select_input(self, options: list):
        self.current_task = self.UserTask("choose_" + str(options), self, options)
        return self.current_task.do_task()

    def reset(self):
        self.tricks_called = 0
        self.tricks_made = 0
        self.cards = None

    def get_playable_cards(self, lead_color):
        if not lead_color:
            return self.cards.keys()
        playable_cards = [key for key, card in self.cards.items() if not card.color_bound or card.color == lead_color]
        return list(map(lambda card: card.id, playable_cards))

    def __str__(self):
        return self.name

    def __repr__(self):
        return self.name

    class UserTask:

        import threading

        def __init__(self, task_type, player, options):
            self.task_type = task_type
            self.player = player

            self.options = options
            self.selected = None

            self.wait_for_input = threading.Event()

        def do_task(process_input=None):
            logging.info(self.name + " is waiting for input on " + self.task_type)

            self.wait_for_input.wait()

            self.player.current_task = None
            user_input = self.selected

            logging.info(self.name + "'s input for " + self.task_type + ": " + str(user_input))

            if process_input:
                user_input = process_input(user_input)

            return user_input

        def get_input(user_input):
            if user_input not in self.options:
                #TODO throw error
                pass

            self.selection = user_input

            self.wait_for_input.set()


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
        self.curr_player = None
        self.card_stack_by_player = {}
        self.card_stack_by_card = {}

    def do_trick(self):
        player_count = len(self.players)

        logging.info("Trump color is " + str(self.trump_color))

        for i in range(player_count):
            player = self.players[(i + self.first_player) % player_count]

            self.curr_player = player

            card_played_id = player.play_card(self.lead_color)
            card_played = Game.CARDS[card_played_id]

            self.card_stack_by_player[player.name] = card_played
            self.card_stack_by_card[card_played_id] = player

            logging.info("New stack: " + str(self.card_stack_by_player))

            if not self.lead_color and card_played.color_bound:
                self.lead_color = card_played.color
                logging.info("New lead color: " + self.lead_color)

    def get_current_winner(self) -> Player:
        curr_winner = None
        curr_max_value = -1

        for player, card in self.card_stack_by_player.items():
            is_trump_color = (card.color == self.trump_color)

            if card.color == self.lead_color or is_trump_color or not card.color_bound:
                if is_trump_color:
                    card.value += 13
                if card.card_type == "fairy" and "dragon" in self.card_stack_by_card.keys():
                    card.value = 52
                if card.value > curr_max_value:
                    curr_max_value = card.value
                    curr_winner = player
                
            logging.info("Curr card: " + card + ", curr max: " + str(curr_max_value) + ", curr Winner: " + str(curr_winner))

        logging.info("Trick: " + str(self.card_stack) + "; trump: " + self.trump_color)
        logging.info("Trick was won by " + curr_winner)
        winning_card = self.card_stack_by_player[curr_winner]
        return self.card_stack_by_card[winning_card.id]

    def get_after_effect(self):
        after_effect = None

        if self.game_mode > 0:
            for card in self.card_stack.values():
                if card.card_type == "bomb" or card.card_type == "juggler":
                    after_effect = card.card_type
                elif card.card_type == "cloud":
                    after_effect = None if "bomb" in self.card_stack_by_card.keys() else "cloud"

        return after_effect 



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
        self.tricks_called = 0
        self.card_deck = game_context.get("card_deck")
        self.players = game_context.get("players")
        self.first_player = game_context.get("first_player")

        self.curr_trick = None

    def start_round(self):
        logging.info("Starting round " + str(self.round_number))

        card_giver = self.players[(self.first_player - 1 + len(self.players)) % len(self.players)]

        unhanded_cards = self.__handout_cards()

        self.trump_card = self.random.choice(unhanded_cards)
        logging.info("Trump card is " + self.trump_card.id)

        self.trump_color = None if trump_card.card_type in Game.NO_TRUMP_CARDS else (card_giver.select_trump_color() if trump_card.card_type in Game.TRUMP_SELECTION_CARDS else trump_card.color)

        logging.info("Trump is " + str(self.trump_card) + " -> " + str(self.trump_color))

        # Werewolf
        if self.game_mode > 0:
            for player in self.players:
                if "werewolf" in player.cards:
                    player.cards[self.trump_card.id] = self.trump_card
                    self.trump_card = player.cards["werewolf"]
                    del player.cards["werewolf"]
                    
                    self.trump_color = player.select_input(Game.CARD_COLORS)

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

            self.curr_trick = Trick(round_context)
            self.curr_trick.do_trick()
            winner = self.curr_trick.get_current_winner()
            after_effect = self.curr_trick.get_after_effect

            logging.info("Trick winner is " + str(winner))

            if after_effect:
                logging.info("Got after effect " + after_effect)
                if after_effect == "cloud":
                    trick_modification = winner.select_input([-1, 1])
                    winner.tricks_called += trick_modification
                if after_effect == "juggler" and i < self.round_number - 1:
                    passed_cards = [player.select_input(player.cards.keys()) for player in self.players]
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

            player.cards = {card.id: card for card in self.card_deck[index:player_count*self.round_number:player_count]}
            logging.info("Player " + player.name + " got cards: " + str(player.cards))

        return self.card_deck[player_count*self.round_number:]

    def __get_estimations(self):
        player_count = len(self.players)

        for i in range(player_count):
            player = self.players[(i + self.first_player) % player_count]
            self.tricks_called += player.call_tricks(self.tricks_called, self.round_number)
    
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
    __MODES = {
        0: __STANDARD_CARDS,
        1: __STANDARD_CARDS +  __SPECIAL_CARDS_1,
        2: __STANDARD_CARDS + __SPECIAL_CARDS_1 + __SPECIAL_CARDS_2,
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
        self.curr_round = None

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

            self.curr_round = Round(game_context)
            self.curr_round.start_round()

            self.first_player = (self.first_player + 1) % len(self.players)

            for p in self.players: p.reset()

    def get_round_state() {

    }

import logging

logging.basicConfig(level=logging.DEBUG)

players = [Player("Maxi"), Player("Yunus"), Player("Flo")]

g = Game(players, {"mode":2})

g.start_game()


        