import logging
import threading

from .card import Card

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

    def call_tricks(self, called_tricks: int, max_tricks: int) -> str:
        logging.debug("Calling call_tricks for " + self.name)

        valid_values = list(range(max_tricks + 1))
        left_tricks = max_tricks - called_tricks

        if left_tricks >= 0:
            valid_values.remove(left_tricks)

        self.current_task = UserTask("call_tricks", self, valid_values)

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
        
        self.current_task = UserTask("play_card", self, valid_values)
        
        return self.current_task.do_task(payload)

    def select_input(self, options: list):
        self.current_task = UserTask("choose_" + str(options), self, options)
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

    def __init__(self, task_type, player, options):
        self.task_type = task_type
        self.__player = player

        self.__options = options
        self.__selected = None

        self.__input_event = threading.Event()
        self.__input_lock = threading.Lock()

        print("Task created")

    def do_task(self, process_input=None):
        logging.info(self.__player.name + " is waiting for input on " + self.task_type)

        self.__input_event.wait()

        user_input = self.__selected

        logging.info(self.__player.name + "'s input for " + self.task_type + ": " + str(user_input))

        if process_input:
            user_input = process_input(user_input)

        return user_input

    def get_input(self, user_input):
        with self.__input_lock:
            if user_input not in self.__options:
                raise Exception("Invalid value")

            print("Receiving input: " + str(user_input))
            self.__selected = user_input
            self.__player.current_task = None

            self.__input_event.set()
