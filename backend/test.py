from game.game import Game
from game.player import Player
import game.game_interface

import logging
import threading
import time

logging.basicConfig(level=logging.DEBUG)

players = [
    Player({
        "name": "Maxi",
        "id": 1
    }),
    Player({
        "name": "Flo",
        "id": 2
    }),
    Player({
        "name": "Yunus",
        "id": 3
    })
]

g = Game(players, {"mode":2})

threading.Thread(target=g.start_game).start()
time.sleep(2)
print("Continuing...")
while True:
    for player in g.players:
        print(player.name + " in test")
        i = input()
        print(game.game_interface.call_tricks(int(i), player))