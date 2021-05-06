import logging
import threading

from .card import Card
from .card_decks import CardDecks

class User:
    def __init__(self, user_id: str, name: str):
        self.user_id = user_id
        self.name = name

class Player:
    def __init__(self, user: User):
        self.user = user
        self.name = user.name

        self.score = 0
        self.tricks_called = 0
        self.tricks_made = 0
        self.cards = None

        self.current_task = None

        self.card_lock = threading.Lock()
        self.task_lock = threading.Lock()
        self.state_lock = threading.Lock()
        self.__update_state()

    def add_score(self, points: int):
        self.score += points
        self.__update_state()

    def set_tricks_called(self, amount: int):
        self.tricks_called = amount
        self.__update_state()

    def add_tricks_called(self, amount: int):
        self.tricks_called += amount
        self.__update_state()

    def inc_tricks_made(self):
        self.tricks_made += 1
        self.__update_state()

    def set_cards(self, cards: list[Card]):
        with self.card_lock:
            self.cards = {card.id: card for card in cards}

    def replace_card(self, card_to_replace_id: str, new_card: Card):
        with self.card_lock:
            del self.cards[card_to_replace_id]
            self.cards[new_card.id] = new_card


    def call_tricks(self, called_tricks: int, max_tricks: int) -> int:
        logging.debug("Calling call_tricks for " + self.name)

        valid_values = [str(i) for i in range(max_tricks + 1)]
        left_tricks = max_tricks - called_tricks

        if left_tricks >= 0:
            valid_values.remove(str(left_tricks))

        with self.task_lock:
            self.current_task = PlayerTask("call_tricks", self, valid_values)

        self.tricks_called = int(self.current_task.do_task())
        self.__update_state()

        return self.tricks_called

    def play_card(self, lead_color: str) -> str:
        valid_values = self.__get_playable_cards(lead_color)

        def payload(user_input):
            card_variants = self.cards.get(user_input).variants
            if card_variants:
                variant_selected = self.select_input("card_variant", card_variants)
                logging.info(self.name + " has selected " + str(variant_selected))

                with self.card_lock:
                    self.replace_card(user_input, CardDecks.CARDS[variant_selected])

                return variant_selected
            return user_input
        
        with self.task_lock:
            self.current_task = PlayerTask("play_card", self, valid_values)
        
        with self.card_lock:
            return self.cards.pop(self.current_task.do_task(payload))

    def select_input(self, select_type: str, options: list[str]):
        with self.task_lock:
            self.current_task = PlayerTask("choose_" + select_type6, self, options)
        return self.current_task.do_task()

    def reset(self):
        with self.state_lock, self.card_lock:
            self.tricks_called = 0
            self.tricks_made = 0
            self.cards = None

    def __get_playable_cards(self, lead_color):
        if not lead_color:
            return self.cards.keys()
        playable_cards = [key for key, card in self.cards.items() if not card.color_bound or card.color == lead_color]
        return [card.id for card in playable_cards]


    def get_state(self):
        with self.state_lock:
            return self.state

    def get_hand_cards(self, lead_color: str):
        with self.card_lock:
            return [self.__get_hand_card(card, lead_color) for card in self.cards]

    def get_task(self):
        with self.task_lock:
            return TaskState(self.current_task.task_type, self.current_task.options)

    def complete_task(self, arg: str):
        with self.task_lock:
            self.current_task.get_input(arg)

    def __update_state(self):
        with self.state_lock:
            self.state = PlayerState(self.user, self.score, self.tricks_called, self.tricks_made)

    def __get_hand_card(self, card: Card, lead_color: str=None):
        card_id = card.id
        playable = card.is_playable(lead_color)
        variants = [self.get_hand_card(v_card, lead_color) for v_card in card.variants]
        return HandCard(card_id, playable, variants)

    def __str__(self):
        return self.name

    def __repr__(self):
        return self.name

class PlayerTask:

    def __init__(self, task_type, player, options):
        self.task_type = task_type
        self.player = player

        self.options = options
        self.selected = None

        self.input_event = threading.Event()
        self.input_lock = threading.Lock()

    def do_task(self, process_input=None) -> str:
        logging.info(self.player.name + " is waiting for input on " + self.task_type)

        self.input_event.wait()

        with self.input_lock:
            user_input = self.selected

        logging.info(self.player.name + "'s input for " + self.task_type + ": " + str(user_input))

        if process_input:
            user_input = process_input(user_input)

        return user_input

    def get_input(self, user_input: str):
        with self.input_lock:
            if user_input not in self.options:
                raise Exception("Invalid value")

            print("Receiving input: " + str(user_input))
            self.selected = user_input
            self.player.current_task = None

            self.input_event.set()

class PlayerState:
    def __init__(self, player: User, score: int, tricks_called: int, tricks_made: int):
        self.player = player
        self.score = score
        self.tricks_called = tricks_called
        self.tricks_made = tricks_made
    
class HandCard:
    def __init__(self, card_id: str, playable: bool, variants: list[PlayableCard]):
        self.card_id = card_id
        self.playable = playable
        self.variants = variants

class TaskState:
    def __init__(self, task_type: str, options: list[str]):
        self.task_type = task_type
        self.options = options


