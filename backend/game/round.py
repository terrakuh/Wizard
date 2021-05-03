from .card_decks import CardDecks

from .trick import Trick
from .player import Player
from .card import Card

class Round:
    """
    Round for one amount of cards (1, 2, 3, ...)
    """

    import random
    import logging

    def __init__(self, game_context):
        """
        game_context: {
                mode: int,
                players: list,
                first_player: int,
                card_deck: list,
                round_counter: int
            }
        """
        self.game_mode = game_context.get("mode")

        self.round_number = game_context.get("round_counter")
        self.tricks_called = 0
        self.card_deck = game_context.get("card_deck")
        self.players = game_context.get("players")
        self.first_player = game_context.get("first_player")

        self.curr_trick = None

    def start_round(self):
        self.logging.info("Starting round " + str(self.round_number))

        card_giver = self.players[(self.first_player - 1 + len(self.players)) % len(self.players)]

        unhanded_cards = self.__handout_cards()

        self.trump_card = self.random.choice(unhanded_cards)
        self.logging.info("Trump card is " + self.trump_card.id)

        self.trump_color = None if self.trump_card.card_type in CardDecks.NO_TRUMP_CARDS else (card_giver.select_input(CardDecks.CARD_COLORS) if self.trump_card.card_type in CardDecks.TRUMP_SELECTION_CARDS else self.trump_card.color)

        self.logging.info("Trump is " + str(self.trump_card) + " -> " + str(self.trump_color))

        # Werewolf
        if self.game_mode > 0:
            for player in self.players:
                if "werewolf" in player.cards:
                    player.cards[self.trump_card.id] = self.trump_card
                    self.trump_card = player.cards["werewolf"]
                    del player.cards["werewolf"]
                    
                    self.trump_color = player.select_input(CardDecks.CARD_COLORS)

        self.__get_estimations()
        self.logging.info("Starting trick(s) for round " + str(self.round_number))
        winner = self.first_player
        for i in range(self.round_number):
            round_context = {
                "mode": self.game_mode,
                "players": self.players,
                "first_player": winner,
                "trump_color": self.trump_color,
                "trick_number": i
            }

            self.curr_trick = Trick(round_context)
            self.curr_trick.do_trick()
            winner = self.curr_trick.get_current_winner()
            after_effect = self.curr_trick.get_after_effect

            self.logging.info("Trick winner is " + str(winner))

            if after_effect:
                self.logging.info("Got after effect " + after_effect)
                if after_effect == "cloud":
                    trick_modification = winner.select_input([-1, 1])
                    winner.tricks_called += trick_modification
                if after_effect == "juggler" and i < self.round_number - 1:
                    passed_cards = [player.select_input(player.cards.keys()) for player in self.players]
                    for index, card in enumerate(passed_cards):
                        self.players[index].cards.pop(card)
                        self.players[(index + 1) % len(self.players)].append(card)

            winning_player.tricks_made += 0 if after_effect == "bomb" else 1
            self.logging.info("Trick completed")
        
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

            player.cards = {card.id: card for card in self.card_deck[index:player_count*self.round_number:player_count]}
            self.logging.info("Player " + player.name + " got cards: " + str(player.cards))

        return self.card_deck[player_count*self.round_number:]

    def __get_estimations(self):
        player_count = len(self.players)

        for i in range(player_count):
            player = self.players[(i + self.first_player) % player_count]
            self.logging.info(player.name + " is calling tricks")
            self.tricks_called += player.call_tricks(self.tricks_called, self.round_number)
    
    def __calculate_points(self):
        for player in self.players:
            if player.tricks_called == player.tricks_made:
                player.score += 10 + 20 * player.tricks_called
            else:
                player.score -= 20 * abs(player.tricks_called - player.tricks_made)
            self.logging.info("New score of " + player.name + " is " + str(player.score))