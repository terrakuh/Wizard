from .game_history import GameHistory
from .card_decks import CardDecks
from .trick import Trick
from .player import Player
from .card import Card

import random
import logging
import time
import concurrent
from contextlib import ExitStack


class Round:
    """
    Round for one amount of cards (1, 2, 3, ...)
    """

    def __init__(self, history: GameHistory, first_player: int, round_counter: int):
        """
        """

        self.history = history

        self.round_number = round_counter
        self.first_player = first_player

        self.tricks_called = 0

        player_count = history.get_player_count()
        self.card_giver = (first_player - 1 + player_count) % player_count

        unhanded_cards = self.__handout_cards(CardDecks.MODES[history.settings.mode])
        self.trump_card = random.choice(unhanded_cards)
        self.trump_color = None if not self.trump_card.color_bound else self.trump_card.color
        self.trump_chooser = None

        history.add_round(self)

    def __handout_cards(self, card_deck: list[Card]) -> list[Card]:
        random.shuffle(card_deck)

        player_count = self.history.get_player_count()

        for i in range(player_count):
            index = (i + self.first_player) % player_count
            player = self.history.get_players()[index]

            player.set_cards(card_deck[index:player_count*self.round_number:player_count])
            
            logging.info("Player " + player.name + " got cards: " + str(player.cards))

        return card_deck[player_count*self.round_number:]

    def __init_trump(self) -> None:
        if not self.trump_card.color_bound:
            if self.trump_card.card_type in CardDecks.TRUMP_SELECTION_CARDS:
                self.__change_trump(self.history.get_player(self.card_giver).select_trump_color(), self.trump_card, self.card_giver)

        # Werewolf
        if self.history.is_special_mode():
            for index, player in enumerate(self.history.get_players()):
                if "werewolf" in player.cards:
                    self.__change_trump(player.select_trump_color(), player.replace_card("werewolf", self.trump_card), index)

        logging.info("Trump is " + str(self.trump_card) + " -> " + str(self.trump_color))

    def __change_trump(self, color: str, card: Card, player: int) -> None:
        self.trump_color = color
        self.trump_card = card
        self.trump_chooser = player
        self.history.update_round(self)

    def start_round(self):
        logging.info("Starting round " + str(self.round_number))

        self.__init_trump()
        self.__get_estimations()
        
        for i in range(1, self.round_number + 1):

            self.curr_trick = Trick(history=self.history, first_player=self.first_player, trump_color=self.trump_color, trick_number=i)
            winning_player, after_effect = self.curr_trick.do_trick()
            time.sleep(2)

            self.first_player  = winning_player.pos

            logging.info("Trick winner is " + str(self.first_player) + " - " + str(winning_player))

            self.__handle_after_effect(after_effect, winning_player, i)
        
        self.__calculate_points()

    def __handle_after_effect(self, after_effect: str, winning_player: Player, trick_number: int) -> None:
        players = self.history.get_players()

        if after_effect == "cloud":
            trick_modification = 1 if winning_player.select_input("cloud_effect", ["cloud_add", "cloud_sub"]) == "cloud_add" else -1
            winning_player.add_tricks_called(trick_modification)

        if after_effect != "bomb": winning_player.inc_tricks_made()

        if after_effect == "juggler" and trick_number < self.round_number:

            with concurrent.futures.ThreadPoolExecutor() as executor:
                futures = [executor.submit(player.select_input, "juggler_effect", player.cards.keys()) for player in players]
                passed_cards = [future.result() for future in futures]

            with ExitStack() as stack:
                [stack.enter_context(player.card_lock) for player in players]
                    
                for index, card in enumerate(passed_cards):
                    next_index = (index + 1) % len(players)

                    remove_from = players[index]
                    give_to = players[next_index]

                    given_card = remove_from.cards.pop(card)
                    give_to.cards[given_card.id] = given_card

    def __get_estimations(self):
        player_count = self.history.get_player_count()

        for i in range(player_count):
            player = self.history.get_players()[(i + self.first_player) % player_count]
            self.tricks_called += player.call_tricks(self.tricks_called, self.round_number, i==player_count-1)
    
    def __calculate_points(self):
        for player in self.history.get_players():
            if player.tricks_called == player.tricks_made:
                player.add_score(10 + 20 * player.tricks_called)
            else:
                player.add_score(-20 * abs(player.tricks_called - player.tricks_made))

            logging.info("New score of " + player.name + " is " + str(player.score))