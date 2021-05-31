import copy
from functools import reduce
from .game_history import GameHistory
from .card_decks import CardDecks
from .trick import Trick
from .player import Player
from .card import Card

import random
import logging
import time
import asyncio


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

        if history is not None:
            unhanded_cards = self.__handout_cards(CardDecks.MODES[history.settings.mode])
            self.trump_card = random.choice(unhanded_cards)
            self.trump_color = None if not self.trump_card.color_bound else self.trump_card.color
            self.trump_chooser = None
        
        print("Created " + str(round_counter))

    def __handout_cards(self, card_deck: list[Card]) -> list[Card]:
        print("Handing")
        random.shuffle(card_deck)
        card_deck[0] = CardDecks.CARDS["juggler"]

        player_count = self.history.get_player_count_sync()

        for i in range(player_count):
            index = (i + self.first_player) % player_count
            player: Player = self.history.get_player(index)

            player.set_cards(card_deck[index:player_count*self.round_number:player_count])
            
            logging.info("Player " + player.name + " got cards: " + str(player.cards))

        print("CreatingRound...")

        return card_deck[player_count*self.round_number:]

    async def __init_trump(self) -> None:
        player_count = self.history.get_player_count_sync()
        self.card_giver = (self.first_player - 1 + player_count) % player_count

        if not self.trump_card.color_bound:
            if self.trump_card.card_type in CardDecks.TRUMP_SELECTION_CARDS:
                player: Player = self.history.get_player(self.card_giver)
                self.__change_trump(await player.select_trump_color(), self.trump_card, self.card_giver)

        # Werewolf
        if self.history.is_special_mode():
            for index, player in enumerate(self.history.get_players()):
                if "werewolf" in player.cards:
                    self.__change_trump(await player.select_trump_color(), player.replace_card("werewolf", self.trump_card), index)

        logging.info("Trump is " + str(self.trump_card) + " -> " + str(self.trump_color))

    def __change_trump(self, color: str, card: Card, player: int) -> None:
        self.trump_color = color
        self.trump_card = card
        self.trump_chooser = player
        self.history.update_round(self)

    async def start_round(self):
        logging.info("Starting round " + str(self.round_number))

        await self.__init_trump()
        await self.__get_estimations()
        
        for i in range(1, self.round_number + 1):

            self.curr_trick = Trick(history=self.history, first_player=self.first_player, trick_number=i, trump_color=self.trump_color)
            self.history.add_trick(self.curr_trick)

            winning_player, after_effects = await self.curr_trick.do_trick()
            await asyncio.sleep(2)

            self.first_player  = winning_player.pos

            logging.info("Trick winner is " + str(self.first_player) + " - " + str(winning_player))

            await self.__handle_after_effects(after_effects, winning_player, i)
        
        self.__calculate_points()

    async def __handle_after_effects(self, after_effects: list[str], winning_player: Player, trick_number: int) -> None:
        print(after_effects)
        players: list[Player] = self.history.get_players()

        if "cloud" in after_effects:
            chosen_effect = await winning_player.select_input("cloud_effect", ["cloud_add", "cloud_sub"])
            trick_modification = 1 if chosen_effect == "cloud_add" else -1
            winning_player.add_tricks_called(trick_modification)

        if "bomb" not in after_effects:
            winning_player.inc_tricks_made()

        if "juggler" in after_effects and trick_number < self.round_number:
            passed_cards = await asyncio.gather(*[player.select_input("juggler_effect", list(player.cards.keys())) for player in players])     

            reduce(self.__switch_cards , zip(passed_cards, players), CardDecks.CARDS[passed_cards[-1]])

    def __switch_cards(self, get: Card, rcv: tuple[str, Player]) -> str:
        return rcv[1].replace_card(rcv[0], get)

    async def __get_estimations(self):
        player_count = self.history.get_player_count_sync()

        for i in range(player_count):
            player: Player = self.history.get_player((i + self.first_player) % player_count)
            print("___Calling for " + str(player))
            self.tricks_called += await player.call_tricks(self.tricks_called, self.round_number, i==player_count-1)
            print(player, " has called his tricks, time for next")
    
    def __calculate_points(self):
        players: list[Player] = self.history.get_players()
        for player in players:
            if player.tricks_called == player.tricks_made:
                player.add_score(10 + 20 * player.tricks_called)
            else:
                player.add_score(-20 * abs(player.tricks_called - player.tricks_made))

            logging.info("New score of " + player.name + " is " + str(player.score))

    def __deepcopy__(self, memo):
        cls = self.__class__
        result = cls.__new__(cls)
        memo[id(self)] = result
        for k, v in self.__dict__.items():
            if k == "history" or k == "__handle_after_effects":
                continue
            setattr(result, k, copy.deepcopy(v, memo))
        return result
