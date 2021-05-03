from .player import Player
from .card import Card
from .card_decks import CardDecks

class Trick:

    import logging

    def __init__(self, round_context):
        """
        round_context: {
                "mode": int,
                "players": list,
                "first_player": int,
                "trump_color": str
            }
        """
        self.game_mode = round_context.get("mode")
        self.players = round_context.get("players")
        self.first_player = round_context.get("first_player")
        self.trump_color = round_context.get("trump_color")
        self.trick_number = round_context.get("trick_number")

        self.lead_color = None
        self.curr_player = None
        self.card_stack_by_player = {}
        self.card_stack_by_card = {}

    def do_trick(self):
        player_count = len(self.players)

        self.logging.info("Trump color is " + str(self.trump_color))

        for i in range(player_count):
            player = self.players[(i + self.first_player) % player_count]

            self.curr_player = player

            card_played_id = player.play_card(self.lead_color)
            card_played = CardDecks.CARDS[card_played_id]

            self.card_stack_by_player[player.name] = card_played
            self.card_stack_by_card[card_played_id] = player

            self.logging.info("New stack: " + str(self.card_stack_by_player))

            if not self.lead_color and card_played.color_bound:
                self.lead_color = card_played.color
                self.logging.info("New lead color: " + self.lead_color)

    def get_current_winner(self) -> Player:
        curr_winner = None
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
                    curr_winner = player
                
            self.logging.info(f"Curr card: {card}, curr max: {curr_max_value}, curr Winner: {curr_winner}")

        self.logging.info("Trick: " + str(self.card_stack_by_player) + "; trump: " + str(self.trump_color))
        self.logging.info("Trick was won by " + curr_winner)
        winning_card = self.card_stack_by_player[curr_winner]
        return self.card_stack_by_card[winning_card.id]

    def get_after_effect(self):
        after_effect = None

        if self.game_mode > 0:
            for card in self.card_stack.values():
                if card.card_type == "bomb" or card.card_type == "juggler":
                    after_effect = card.card_type
                elif card.card_type == "cloud":
                    after_effect = None if "bomb" in self.card_stack_by_card.keys() else "cloud"

        return after_effect 
