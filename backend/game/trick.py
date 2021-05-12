from .player import User, Player, PlayerState, HandCard
from .card import Card
from .card_decks import CardDecks
from typing import List, Optional

import logging
import threading

class Trick:

    def __init__(self, mode: int, players: List[Player], first_player: int, trump_color: str, trick_number: int):
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

        logging.info("first player is: " + str(self.first_player) + ": " + str(self.players))

    def do_trick(self):
        player_count = len(self.players)

        logging.info("Trump color is " + str(self.trump_color))

        for i in range(player_count):
            player = self.players[(i + self.first_player) % player_count]

            self.curr_player = player

            card_played = player.play_card(self.lead_color)

            self.card_stack_by_player[player.name] = card_played
            self.card_stack_by_card[card_played.id] = player

            logging.info("New stack: " + str(self.card_stack_by_player))

            if not self.lead_color and card_played.color_bound:
                self.lead_color = card_played.color
                logging.info("New lead color: " + self.lead_color)

            self.__update_state()

        print("Returning curr winner: " + str(self.get_current_winner()))
        return self.get_current_winner()


    def get_current_winner(self) -> Player:
        curr_winning_card = None
        curr_max_value = -10

        for player, card in self.card_stack_by_player.items():
            is_trump_color = (card.color == self.trump_color)

            if card.color == self.lead_color or is_trump_color or not card.color_bound:
                if is_trump_color:
                    card.round_value = card.value + 13
                if card.card_type == "fairy" and "dragon" in self.card_stack_by_card.keys():
                    card.round_value = 52
                if card.round_value > curr_max_value:
                    curr_max_value = card.round_value
                    curr_winning_card = card.id
                
            logging.info(f"Curr card: {card}, curr max: {curr_max_value}, curr Winner: {curr_winning_card}")

        logging.info("Trick: " + str(self.card_stack_by_player) + "; trump: " + str(self.trump_color))
        logging.info("Trick was won by " + str(self.card_stack_by_card[curr_winning_card]))

        return self.players.index(self.card_stack_by_card[curr_winning_card])

    def get_after_effect(self):
        after_effect = None

        if self.game_mode > 0:
            for card in self.card_stack_by_player.values():
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
            players =  [player.get_state() for player in self.players]
            lead_color = self.lead_color
            trick_number = self.trick_number
            turn = self.curr_player.user
            cards = self.__get_card_states()
            self.state = TrickState(players, lead_color, trick_number, turn, cards)

    def __get_card_states(self):
        return [TrickCard(card.id, player.user, (player == self.get_current_winner())) for card, player in zip(self.card_stack_by_player.values(), self.card_stack_by_card.values())]

class TrickState:
    def __init__(self, player_states: List[PlayerState], lead_color: Optional[str] = None, trick_number: Optional[int] = None, turn: Optional[User] = None, cards: Optional[List[HandCard]] = None):
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
