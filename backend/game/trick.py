from .player import Player
from .card import Card
from .card_decks import CardDecks
from .game_api import get_trick_state

import logging
import threading

class Trick:

    def __init__(self, mode: int, players: list[Player], first_player: int, trump_color: str, trick_number: int):
        """
        """
        
        self.game_mode = mode
        self.first_player = first_player
        self.trump_color = trump_color
        self.trick_number = trick_number
        self.players = players

        self.lead_color = None
        self.curr_player = self.players[self.first_player]
        self.card_stack_by_player = {}
        self.card_stack_by_card = {}

        self.state_lock = threading.Lock()
        self.__update_state()

    def do_trick(self):
        player_count = len(self.players)

        self.logging.info("Trump color is " + str(self.trump_color))

        for i in range(player_count):
            player = self.players[(i + self.first_player) % player_count]

            self.curr_player = player

            card_played = player.play_card(self.lead_color)

            self.card_stack_by_player[player.name] = card_played
            self.card_stack_by_card[card_played.id] = player

            self.logging.info("New stack: " + str(self.card_stack_by_player))

            if not self.lead_color and card_played.color_bound:
                self.lead_color = card_played.color
                self.logging.info("New lead color: " + self.lead_color)

            self.__update_state()

        return self.get_current_winner()


    def get_current_winner(self) -> Player:
        curr_winning_card = None
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
                    curr_winning_card = card.id
                
            self.logging.info(f"Curr card: {card}, curr max: {curr_max_value}, curr Winner: {curr_winner}")

        self.logging.info("Trick: " + str(self.card_stack_by_player) + "; trump: " + str(self.trump_color))
        self.logging.info("Trick was won by " + curr_winner)

        return self.card_stack_by_card[winning_card]

    def get_after_effect(self):
        after_effect = None

        if self.game_mode > 0:
            for card in self.card_stack.values():
                if card.card_type == "bomb" or card.card_type == "juggler":
                    after_effect = card.card_type
                elif card.card_type == "cloud":
                    after_effect = None if "bomb" in self.card_stack_by_card.keys() else "cloud"

        return after_effect

    def get_state(self):
        with self.state_lock:
            return self.state

    def __update_state(self):
        with self.state_lock:
            players =  [player.get_state() for player in trick.players]
            lead_color = self.lead_color
            trick_number = self.trick_number
            turn = self.curr_player.user
            cards = self.__get_card_states()
            self.state = TrickState(players, lead_color, trick_number, turn, cards)

    def __get_card_states(self):
        return [TrickCard(card.id, player.user, (player == self.get_current_winner())) for card, player in zip(self.card_stack_by_player.values(), self.card_stack_by_card.values())]

class TrickState:
    def __init__(self, player_states: list[PlayerState], lead_color: str, trick_number: int, turn: User, cards: list[PlayedCard]):
        self.players_states = player_states
        self.lead_color = lead_color
        self.trick_number = trick_number
        self.turn = turn
        self.cards = cards

class TrickCard:
    def __init__(self, card_id: str, player: User, is_winning: bool):
        self.card_id = card_id
        self.player = player
        self.is_winning = is_winning
