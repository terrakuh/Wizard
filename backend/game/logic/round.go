package logic

import "log"

func (game *Game) finishTrick() {
	winningColor := game.trickColor
	if winningColor == "" {
		winningColor = getDeckColor(game.deck)
	}
	// get best player
	best := game.deck[0]
	bestIndex := 0
	for i, card := range game.deck[1:] {
		if card.calculateValue(winningColor) > best.calculateValue(winningColor) {
			best = card
			bestIndex = i + 1
		}
	}
	bestIndex = (bestIndex + game.turner.starter) % len(game.players)
	log.Printf("best was player at %d with %s value of %d", bestIndex, best.location, best.calculateValue(winningColor))
	player := game.players[game.order[bestIndex]]
	player.Trick.Actual++
	game.turner.starter = bestIndex
	game.turner.turn = bestIndex
	game.deck = game.deck[0:0]
}

func (game *Game) finishRound() {
	game.turner.distributor = (game.turner.distributor + 1) % len(game.players)
	game.turner.round++
	// calculate points
	for _, player := range game.players {
		if player.Trick.Actual == player.Trick.Called {
			player.Points += 10 + 20*player.Trick.Called
		} else {
			diff := player.Trick.Called - player.Trick.Actual
			if diff < 0 {
				diff *= -1
			}
			player.Points -= 10 + 20*diff
		}
	}
}

func (game *Game) prepareRound() {
	for _, player := range game.players {
		player.Trick = nil
	}
	game.distributeCards()
	game.turner.starter = (game.turner.distributor + 1) % len(game.players)
	game.turner.turn = game.turner.starter
	game.trickCallingCache = &TrickCalling{
		PlayersLeft: len(game.players),
		Round:       game.turner.round,
	}
}
