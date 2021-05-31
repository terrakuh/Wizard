from game.game import Game, Settings
from game.player import User
from game.game_history import GameHistory

import logging
import threading
import time
import asyncio
import sys

logging.basicConfig(level=logging.DEBUG)

async def go(game: Game):
    g2 = game.history
    while True:
        for p in game.players.values():
            print(p)
            if g2.get_player_task_sync(p.user.user_id):
                try:
                    user_i = input("Cmooooon\n")
                    print("Input ", user_i)
                    #await asyncio.sleep(3)
                    await g2.complete_task_sync(p.user.user_id, user_i)
                    await asyncio.sleep(1)
                    print("Completed")
                except Exception as e:
                    print(e)
                    print("Lets go on...")
        time.sleep(2)


async def do_game():
    players = [User("1", "Maxi"), User("2", "Flo"), User("3", "Yunus"),]

    game = Game(players, Settings("Standard"), lambda a: None) 

    try:
        t1 = asyncio.create_task(game.start())
    except Exception as e:
        print("Error:\n" + str(e))

    try:
        t2 = asyncio.create_task(go(game))
    except Exception as e:
        print("Error:\n" + str(e))

    await t1
    await t2

    

asyncio.run(do_game())