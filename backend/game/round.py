from .card_decks import CardDecks
from .trick import Trick
from .player import Player
from .card import Card

import random
import logging
import threading

class Round:
    """
    Round for one amount of cards (1, 2, 3, ...)
    """

    def __init__(self, mode: int=0, players: list[Player], first_player: int=0, card_deck: list[Card], round_counter: int):
        """
        """

        self.game_mode = mode
        self.round_number = round_counter
        self.card_deck = card_deck
        self.players = players
        self.first_player = first_player

        self.tricks_called = 0
        self.curr_trick = None

        self.__init_trump()

        self.state_lock = threading.Lock()
        self.__update_state()

    def __init_trump(self):
        logging.info("Initializing round " + str(self.round_number))

        card_giver = self.players[(self.first_player - 1 + len(self.players)) % len(self.players)]

        unhanded_cards = self.__handout_cards()

        # Set trump
        self.trump_card = self.random.choice(unhanded_cards)
        self.trump_color = None if self.trump_card.card_type in CardDecks.NO_TRUMP_CARDS else (card_giver.select_input(CardDecks.CARD_COLORS) if self.trump_card.card_type in CardDecks.TRUMP_SELECTION_CARDS else self.trump_card.color)

        logging.info("Trump is " + str(self.trump_card) + " -> " + str(self.trump_color))

        # Werewolf
        if self.game_mode > 0:
            for player in self.players:
                if "werewolf" in player.cards:
                    self.trump_card = player.cards["werewolf"]

                    player.replace_card("werewolf", self.trump_card)
                    
                    self.trump_color = player.select_input("trump_color", CardDecks.CARD_COLORS)

    def start_round(self):
        logging.info("Starting round " + str(self.round_number))

        self.__get_estimations()
        
        winner = self.first_player
        for i in range(self.round_number):
            self.curr_trick = Trick(mode=self.game_mode, players=self.players, first_player=winner, trump_color=self.trump_color, trick_number=i)
            
            winner = self.curr_trick.do_trick()

            after_effect = self.curr_trick.get_after_effect()

            logging.info("Trick winner is " + str(winner))

            if after_effect:
                logging.info("Got after effect " + after_effect)
                if after_effect == "cloud":
                    trick_modification = 1 if winner.select_input(["+", "-"]) == "+" else -1
                    winner.add_tricks_called(trick_modification)

                if after_effect == "juggler" and i < self.round_number - 1:
                    passed_cards = [player.select_input(player.cards.keys()) for player in self.players]
                    with [player.card_lock for player in self.players]:
                        for index, card in enumerate(passed_cards):
                            next_index = (index + 1) % len(self.players)

                            remove_from = self.players[index]
                            give_to = self.players[next_index]

                            given_card = remove_from.cards.pop(card)
                            give_to.cards[given_card.id] = given_card

            if after_effect != "bomb" winner.inc_tricks_made()
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
            player.set_cards(self.card_deck[index:player_count*self.round_number:player_count])
            
            logging.info("Player " + player.name + " got cards: " + str(player.cards))

        return self.card_deck[player_count*self.round_number:]

    def __get_estimations(self):
        player_count = len(self.players)

        for i in range(player_count):
            player = self.players[(i + self.first_player) % player_count]
            logging.info(player.name + " is calling tricks")
            self.tricks_called += player.call_tricks(self.tricks_called, self.round_number)
    
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
