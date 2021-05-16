from .card_decks import CardDecks
from .trick import Trick
from .player import Player
from .card import Card
from typing import List

import random
import logging
import threading
from contextlib import ExitStack

class Round:
    """
    Round for one amount of cards (1, 2, 3, ...)
    """

    def __init__(self, mode: int, players: List[Player], first_player: int, card_deck: List[Card], round_counter: int):
        """
        """

        self.game_mode = mode
        self.round_number = round_counter
        self.card_deck = card_deck
        self.players = players
        self.first_player = first_player

        self.tricks_called = 0
        self.curr_trick = None

        unhanded_cards = self.__handout_cards()
        self.trump_card = random.choice(unhanded_cards)
        self.trump_color = None if not self.trump_card.color_bound else self.trump_card.color

        print("Trump is: " + str(self.trump_card) + " - " + str(self.trump_color))
        logging.info("Trump is: " + str(self.trump_card) + " - " + str(self.trump_color))

        self.state_lock = threading.Lock()
        self.__update_state()

    def __init_trump(self):
        logging.info("Initializing round " + str(self.round_number))

        card_giver = self.players[(self.first_player - 1 + len(self.players)) % len(self.players)]

        logging.info("Trump is for selection: " + str(self.trump_card.card_type in CardDecks.TRUMP_SELECTION_CARDS))
        
        self.trump_color = None if self.trump_card.card_type in CardDecks.NO_TRUMP_CARDS else (card_giver.select_trump_color() if self.trump_card.card_type in CardDecks.TRUMP_SELECTION_CARDS else self.trump_card.color)

        logging.info("Trump is " + str(self.trump_card) + " -> " + str(self.trump_color))

        # Werewolf
        if self.game_mode > 0:
            for player in self.players:
                if "werewolf" in player.cards:
                    self.trump_color = player.select_trump_color()
                    self.trump_card = player.replace_card("werewolf", self.trump_card)

        self.__update_state()

    def start_round(self):
        logging.info("Starting round " + str(self.round_number))
        self.__init_trump()

        print("Curr first player is: " + str(self.first_player) + " from: " + str(self.players))
        self.__get_estimations()
        
        for i in range(self.round_number):
            print("Curr first player is: " + str(self.first_player) + " from: " + str(self.players))
            self.curr_trick = Trick(mode=self.game_mode, players=self.players, first_player=self.first_player, trump_color=self.trump_color, trick_number=i)
            
            winning_player = self.curr_trick.do_trick()
            self.first_player  = self.players.index(winning_player)

            after_effect = self.curr_trick.get_after_effect()

            logging.info("Trick winner is " + str(self.first_player) + " - " + str(winning_player))

            # After effects
            if after_effect == "cloud":
                trick_modification = 1 if winning_player.select_input("cloud_effect", ["cloud_add", "cloud_sub"]) == "cloud_add" else -1
                winning_player.add_tricks_called(trick_modification)

            if after_effect != "bomb": winning_player.inc_tricks_made()

            if after_effect == "juggler" and i < self.round_number - 1:
                    passed_cards = [player.select_input("juggler_effect", player.cards.keys()) for player in self.players]
                    with ExitStack() as stack:
                        [stack.enter_context(player.card_lock) for player in self.players]
                            
                        for index, card in enumerate(passed_cards):
                            next_index = (index + 1) % len(self.players)

                            remove_from = self.players[index]
                            give_to = self.players[next_index]

                            given_card = remove_from.cards.pop(card)
                            give_to.cards[given_card.id] = given_card

            logging.info("Trick completed")
        
        self.__calculate_points()

    def __handout_cards(self):
        """
        Returns: left cards
        """
        random.shuffle(self.card_deck)

        player_count = len(self.players)

        for i in range(player_count):
            index = (i + self.first_player) % player_count
            player = self.players[index]
            player.set_cards(self.card_deck[index:player_count*self.round_number:player_count])
            
            logging.info("Player " + player.name + " got cards: " + str(player.cards))

        return self.card_deck[player_count*self.round_number:]

    def __get_estimations(self):
        player_count = len(self.players)

        for i in range(player_count):
            player = self.players[(i + self.first_player) % player_count]
            logging.info(player.name + " is calling tricks")
            self.tricks_called += player.call_tricks(self.tricks_called, self.round_number, i==player_count-1)
    
    def __calculate_points(self):
        for player in self.players:
            if player.tricks_called == player.tricks_made:
                player.add_score(10 + 20 * player.tricks_called)
            else:
                player.add_score(-20 * abs(player.tricks_called - player.tricks_made))

            logging.info("New score of " + player.name + " is " + str(player.score))

    def get_state(self):
        with self.state_lock:
            return self.state

    def __update_state(self):
        with self.state_lock:
            self.state = RoundState(self.trump_card.id, self.trump_color, self.round_number)


class RoundState:
    def __init__(self, trump_card: str, trump_color: str, round_number: int):
        self.trump_card = trump_card
        self.trump_color = trump_color
        self.round_number = round_number
