from game.game import Game, Settings
from game.player import User
from game.game_interaction import GameInteraction

import logging
import threading
import time

logging.basicConfig(level=logging.DEBUG)

players = [User("1", "Maxi"), User("2", "Flo"), User("3", "Yunus"),]

g = Game(players, Settings(1))

g.start()

time.sleep(2)

g2 = GameInteraction(g)

while True:
    for p in g.players.values():
        print(p)
        if g2.get_action_required(p):
            try:
                g2.complete_action(input(), p)
            except Exception as e:
                print(e)
                print("Lets go on...")
    time.sleep(2)

# threading.Thread(target=g.start_game).start()
# time.sleep(2)
# print("Continuing...")
# while True:
#     for player in g.players:
#         print(player.name + " in test")
#         i = input()
#         print(game.game_interface.call_tricks(int(i), player))