from .game_history import GameHistory
from .player import Player
from .card import Card

import logging

class Trick:

    def __init__(self, history: GameHistory, first_player: int, trick_number: int):
        """
        """
        
        self.history = history

        self.trick_number = trick_number
        self.first_player = first_player
        
        self.lead_color: str = None
        self.lead_card: Card = None

        self.curr_player: int = self.first_player
        self.curr_winner = None
        self.card_stack_by_player: dict[str, Card] = {}
        self.card_stack_by_card: dict[str, Player] = {}

        history.add_trick(self)

    def do_trick(self) -> tuple[Player, str]:
        for _ in self.history.get_players():
            self.__play_card()
            self.history.update_trick(self)

        return (self.get_current_winner(), self.__get_after_effect())

    def get_player(self, card_id: str) -> Player:
        return self.card_stack_by_card[card_id]

    def get_cards(self) -> list[Card]:
        return list(self.card_stack_by_player.values())

    def __play_card(self):
        player_count = self.history.get_player_count()

        player = self.history.get_player(self.curr_player)

        card_played = player.play_card(self.lead_color)

        self.card_stack_by_player[player.name] = card_played
        self.card_stack_by_card[card_played.id] = player

        self.curr_winner = self.get_current_winner()

        logging.info("New stack: " + str(self.card_stack_by_player))

        if self.lead_color is None:
            self.lead_card = card_played
            if card_played.color_bound:
                self.lead_color = card_played.color
                logging.info("New lead color: " + self.lead_color)

        self.curr_player = (self.curr_player + 1) % player_count


    def get_current_winner(self) -> Player:
        curr_winning_card = None
        curr_max_value = -10
        trump_color = self.history.get_trump_color()

        for card in self.card_stack_by_player.values():
            is_trump_color = False if (trump_color is None or card.color is None or not card.color_bound) else (card.color == trump_color)

            if card.color == self.lead_color or is_trump_color or not card.color_bound:
                cmp_value = card.value
                if is_trump_color:
                    cmp_value += 13
                if card.card_type == "fairy" and "dragon" in self.card_stack_by_card.keys():
                    cmp_value = 52
                if cmp_value > curr_max_value:
                    curr_max_value = cmp_value
                    curr_winning_card = card.id
                
        logging.info("Trick was won by " + str(self.card_stack_by_card[curr_winning_card]))

        return self.card_stack_by_card[curr_winning_card]

    def __get_after_effect(self):
        after_effect = None

        if self.history.is_special_mode():
            for card in self.card_stack_by_player.values():
                if card.card_type == "bomb" or card.card_type == "juggler":
                    after_effect = card.card_type
                elif card.card_type == "cloud":
                    after_effect = None if "bomb" in self.card_stack_by_card.keys() else "cloud"

        return after_effect