from copy import deepcopy
from .game_history import GameHistory
from .player import Player
from .card import Card

import logging

class Trick:

    def __init__(self, history: GameHistory, first_player: int, trick_number: int, trump_color: str):
        """
        """
        
        self.history = history

        self.trick_number = trick_number
        self.first_player = first_player
        self.trump_color = trump_color
        
        self.lead_color: str = None
        self.lead_card: Card = None

        self.curr_player: int = self.first_player
        self.curr_winner = None
        self.card_stack_by_player: dict[str, Card] = {}
        self.card_stack_by_card: dict[str, Player] = {}

    async def do_trick(self) -> tuple[Player, list[str]]:
        players: list[Player] = self.history.get_players()
        for _ in players:
            await self.__play_card()
            self.history.update_trick(self)

        return (self.get_current_winner(), self.__get_after_effects())

    def get_player(self, card_id: str) -> Player:
        return self.card_stack_by_card[card_id]

    def get_cards(self) -> list[Card]:
        return list(self.card_stack_by_player.values())

    async def __play_card(self):
        player_count = self.history.get_player_count_sync()

        player: Player = self.history.get_player(self.curr_player)

        card_played = await player.play_card(self.lead_color)

        self.card_stack_by_player[player.name] = card_played
        self.card_stack_by_card[card_played.id] = player

        logging.info("New stack: " + str(self.card_stack_by_player))

        if self.lead_color is None:
            self.lead_card = card_played
            if card_played.color_bound:
                self.lead_color = card_played.color
                print("New lead color: " + self.lead_color)
                logging.info("New lead color: " + self.lead_color)

        self.curr_winner = self.get_current_winner()
        self.curr_player = (self.curr_player + 1) % player_count


    def get_current_winner(self) -> Player:
        print(self.card_stack_by_player)
        print(self.lead_color)
        curr_winning_card = None
        curr_max_value = -10
        trump_color = self.trump_color

        for card in self.card_stack_by_player.values():
            print(card)
            is_trump_color = False if (trump_color is None or card.color is None or not card.color_bound) else (card.color == trump_color)

            if card.color == self.lead_color or is_trump_color or not card.color_bound:
                print("is valid")
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

    def __get_after_effects(self) -> list[str]:
        after_effects = []

        if self.history.is_special_mode():
            for card in self.card_stack_by_player.values():
                if card.card_type == "bomb":
                    after_effects.append("bomb")
                elif card.card_type == "juggler":
                    after_effects.append("juggler")
                elif card.card_type == "cloud" and not "bomb" in self.card_stack_by_card.keys():
                    after_effects.append("cloud")

        return after_effects

    def __deepcopy__(self, memo):
        cls = self.__class__
        result = cls.__new__(cls)
        memo[id(self)] = result
        for k, v in self.__dict__.items():
            if k == "history":
                continue
            setattr(result, k, deepcopy(v, memo))
        return result
