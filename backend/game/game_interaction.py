from .game import Game
from .card_decks import CardDecks
import game.game_api

class GameInteraction:
    def __init__(self, game):
        self.game = game

    def get_hand_card_state(self, card_id: str):
        lead_color = self.__get_leand_color()
        card = self.__get_card(card_id)
        return game.game_api.get_hand_card_state(card, lead_color)

    def get_trick_card_state(card_id: str):
        card = self.__get_card(card_id)
        trick = self.__get_trick()
        return game.game_api.get_trick_card_state(card, trick)

    def get_player_state(player: Player):
        return game.game_api.get_player_state(player)

    def get_round_state():
        round_o = self.__get_round()
        return game.game_api().get_round_state(round_o)

    def get_trick_state():
        trick = self.__get_trick()
        return game.game_api.get_trick_state(trick)

    def get_hand_cards(player: Player):
        lead_color = self.__get_leand_color()
        return game.game_api.get_hand_cards(player, lead_color)

    def get_action_required(player: Player):
        return game.game_api.get_action_required(player)

    def complete_action(argument: str, player: Player):
        return game.game_api.complete_action(argument, player)


    def __get_card(card_id: str):
        return CardDecks.CARDS[card_id]

    def __get_round(self):
        return self.game.curr_round

    def __get_trick(self):
        return self.__get_round().curr_trick

    def __get_leand_color(self):
        return self.__get_trick().lead_color