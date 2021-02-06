package logic

import (
	"log"
	"time"
)

type turner struct {
	// who distributed the cards
	distributor int
	// who can play
	turn int
	// who played the first card
	starter int
	round   int
}

func (game *Game) playerTurn() string {
	if game.turner.turn < 0 {
		return ""
	}
	return game.order[game.turner.turn]
}

func (game *Game) PlayerTurn() string {
	game.lock.Lock()
	defer game.lock.Unlock()
	return game.playerTurn()
}

func (game *Game) trickCallingPlayer() string {
	return game.order[(len(game.players)-game.trickCallingCache.PlayersLeft+game.turner.starter)%len(game.players)]
}

func (game *Game) advanceTurn() {
	game.turner.turn = (game.turner.turn + 1) % len(game.players)
	// trick is finished
	if game.turner.starter == game.turner.turn {
		game.turner.turn = -1
		go func() {
			time.Sleep(3 * time.Second)
			game.lock.Lock()
			defer game.lock.Unlock()
			game.finishTrick()
			// round is over
			if len(game.players[game.order[0]].hand) <= 0 {
				game.finishRound()
				if !game.isGameOver() {
					game.prepareRound()
				} else {
					for _, player := range game.players {
						log.Printf("player=%s has %d points", player.Name, player.Points)
					}
				}
			}
		}()
	}
}
