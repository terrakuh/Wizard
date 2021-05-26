from datetime import datetime, timedelta
import logging
import threading
import copy
from typing import Optional, Union

from .game_history import GameHistory
from .card import Card
from .card_decks import CardDecks


class User:
    def __init__(self, user_id: str, name: str):
        self.user_id = user_id
        self.name = name

    def __str__(self) -> str:
        return f"[id={self.user_id},name={self.name}]"

class TaskInfo:

    def __init__(self, task_type: str, player: "Player", options: list[str], selected: str=None, duration: timedelta=None) -> None:
        self.task_type = task_type
        self.player = player # Player
        self.options = options
        self.selected = selected
        self.duration = duration

class Player:
    def __init__(self, history: GameHistory,  user: User, pos: int):
        self.history = history

        self.user = user
        self.name = user.name
        self.pos = pos

        self.score = 0
        self.tricks_called: int = None
        self.tricks_made: int = None
        self.cards: dict[str, Card] = None

        self.current_task: Optional[Union[PlayerTask, TaskInfo]] = None
        self.is_active = False


    def add_score(self, points: int):
        self.score += points
        self.__update_history()

    def add_tricks_called(self, amount: int):
        self.tricks_called += amount
        self.__update_history()

    def inc_tricks_made(self):
        self.tricks_made += 1
        self.__update_history()

    def set_cards(self, cards: list[Card]):
        logging.info(self.name + " got cards: " + str(cards))
        self.cards = {card.id: card for card in sorted(cards, key=lambda c: c.sort_value)}
        self.__update_history()

    def replace_card(self, card_to_replace_id: str, new_card: Card) -> Card:
        self.cards[new_card.id] = new_card
        removed_card = self.cards.pop(card_to_replace_id)
        self.__update_history()
        return removed_card

    def toggle_is_active(self):
        self.is_active = not self.is_active
        self.__update_history()


    def call_tricks(self, called_tricks: int, max_tricks: int, is_last: bool) -> int:
        logging.debug("Calling call_tricks for " + self.name)

        valid_values = [str(i) for i in range(max_tricks + 1)]
        left_tricks = max_tricks - called_tricks

        if is_last and left_tricks >= 0:
            valid_values.remove(str(left_tricks))

        self.current_task = PlayerTask("call_tricks", self, valid_values)
        self.__update_history()

        self.tricks_called = int(self.current_task.do_task())
        self.tricks_made = 0
        self.__update_history()

        return self.tricks_called

    def select_input(self, select_type: str, options: list[str]) -> str:
        self.current_task = PlayerTask("choose_" + select_type, self, options)
        self.__update_history()
        selected_option = self.current_task.do_task()

        self.__update_history()

        return selected_option

    def select_trump_color(self):
        color = self.select_input("trump_color", CardDecks.CARD_COLORS + ["none"])
        return None if color == "none" else color

    def play_card(self, lead_color: str) -> Card:
        valid_values = self.get_playable_cards(lead_color)

        def payload(user_input):
            card_variants = [card.id for card in self.cards[user_input].variants]
            if card_variants:
                variant_selected = self.select_input("card_variant", card_variants)
                self.replace_card(user_input, CardDecks.CARDS[variant_selected])

                logging.info(self.name + " has selected " + str(variant_selected))

                return variant_selected
            return user_input
        
        self.current_task = PlayerTask("play_card", self, valid_values)
        self.__update_history()

        card_selected = self.current_task.do_task(payload)
        card_removed = self.cards.pop(card_selected)

        self.__update_history()

        return card_removed

    def get_playable_cards(self, lead_color) -> list[str]:
        if self.cards is None:
            return None
        if not lead_color:
            return list(self.cards.keys())

        lead_cards = [card.id for card in self.cards.values() if card.color_bound and card.color == lead_color]
        playable_cards = [key for key, card in self.cards.items() if not lead_cards or not card.color_bound or card.color == lead_color]
        return playable_cards

    def reset(self):
        self.cards = None
        self.tricks_called = None
        self.tricks_made = None

        self.__update_history()


    def complete_task(self, arg: str):
        print("Completing...")
        self.current_task.get_input(arg)

    def __update_history(self):
        self.history.update_player(self.user.user_id)
    

    def __str__(self):
        return self.name

    def __repr__(self):
        return self.name

    def __deepcopy__(self, memo):
        cls = self.__class__
        result = cls.__new__(cls)
        memo[id(self)] = result
        for k, v in self.__dict__.items():
            if k == "history":
                continue
            if k == "current_task" and self.current_task is not None:
                setattr(result, k, copy.deepcopy(v.task_info, memo))
                continue
            setattr(result, k, copy.deepcopy(v, memo))
        return result

class PlayerTask:

    def __init__(self, task_type: str, player: Player, options: list[str]):
        self.task_info = TaskInfo(task_type, player, options)
        player.toggle_is_active()

        self.selected = None
        self.__started = datetime.now()

    def do_task(self, process_input=None) -> str:
        logging.info(self.task_info.player.name + " is waiting for input on " + self.task_info.task_type + ": " + str(self.task_info.options))

        self.input_event = threading.Event()
        self.input_lock = threading.Lock()

        self.input_event.wait()

        with self.input_lock:
            user_input = self.selected

        # Clean up for history/deepcopy
        delattr(self, "input_event")
        delattr(self, "input_lock")

        player: Player = self.task_info.player
        player.current_task = None
        player.toggle_is_active()
        self.task_info.duration = datetime.now() - self.__started
        self.task_info.selected = user_input
        player.history.add_action(self.task_info)

        logging.info(self.task_info.player.name + "'s input for " + self.task_info.task_type + ": " + str(user_input))

        if process_input:
            user_input = process_input(user_input)

        return user_input

    def get_input(self, user_input: str):
        with self.input_lock:
            print(self.task_info.options)
            if user_input not in self.task_info.options:
                raise Exception("Invalid value")

            logging.info("Receiving input: " + str(user_input))

            self.selected = user_input
            self.input_event.set()
