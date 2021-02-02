package logic

import (
	"errors"
	"log"
	"math/rand"
	"sync"
)

type Game struct {
	lock              sync.Mutex
	allCards          []*card
	deck              []*card
	trickColor        string
	players           map[string]*Player
	order             []string
	starterTrun       int
	distributorTurn   int
	trickCallingCache *TrickCalling
	turn              int
	round             int
}

func NewGame(names []string) (*Game, error) {
	if len(names) < 3 {
		return nil, errors.New("not enough players in the lobby")
	} else if len(names) > 6 {
		return nil, errors.New("player limit exceeded")
	}
	rand.Shuffle(len(names), func(i, j int) {
		names[i], names[j] = names[j], names[i]
	})
	game := &Game{
		allCards: standardCardSet(),
		round:    1,
		players:  make(map[string]*Player),
		order:    names,
		deck:     make([]*card, 0, len(names)),
	}
	for _, name := range names {
		game.players[name] = &Player{
			hand: make(map[int]*card),
			Name: name,
		}
	}
	game.prepareRound()
	return game, nil
}

func (game *Game) PlayCard(name string, id int) error {
	game.lock.Lock()
	defer game.lock.Unlock()
	if game.isGameOver() {
		return errors.New("game is over")
	} else if name != game.order[game.turn] {
		return errors.New("not your turn")
	} else if game.trickCallingCache != nil {
		return errors.New("hold on a minute")
	}
	player := game.players[game.order[game.turn]]
	card, ok := player.hand[id]
	if !ok {
		return errors.New("you don't have that card")
	}
	// check if playable
	if !card.isPlayable(getDeckColor(game.deck), player.hand) {
		return errors.New("card is not playable; look harder")
	}
	// play
	delete(player.hand, id)
	game.deck = append(game.deck, card)
	game.turn = (game.turn + 1) % len(game.players)
	// trick is finished
	if game.starterTrun == game.turn {
		game.finishTrick()
		// round is over
		if len(player.hand) <= 0 {
			game.finishRound()
			if !game.isGameOver() {
				game.prepareRound()
			} else {
				for _, player := range game.players {
					log.Printf("player=%s has %d points", player.Name, player.Points)
				}
			}
		}
	}
	return nil
}

func (game *Game) finishTrick() {
	trickColor := getTrickColor(game.trickColor, game.deck)
	deckColor := getDeckColor(game.deck)
	log.Printf("game trick=%s round trick=%s", game.trickColor, trickColor)
	best := game.deck[0]
	bestIndex := 0
	for i, card := range game.deck[1:] {
		if card.calculateValue(trickColor, deckColor) > best.calculateValue(trickColor, deckColor) {
			best = card
			bestIndex = i + 1
		}
	}
	bestIndex = (bestIndex + game.starterTrun) % len(game.players)
	log.Printf("best was player at %d with %s value of %d", bestIndex, best.location, best.calculateValue(trickColor, deckColor))
	player := game.players[game.order[bestIndex]]
	player.Trick.Actual++
	game.starterTrun = bestIndex
	game.turn = bestIndex
	game.deck = game.deck[0:0]
}

func (game *Game) finishRound() {
	game.distributorTurn = (game.distributorTurn + 1) % len(game.players)
	game.round++
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
	game.starterTrun = (game.distributorTurn + 1) % len(game.players)
	game.turn = game.starterTrun
	game.trickCallingCache = &TrickCalling{
		PlayersLeft: len(game.players),
		Round:       game.round,
	}
}

func (game *Game) isGameOver() bool {
	return game.round*len(game.players) > len(game.allCards)
}

func (game *Game) Deck() []string {
	game.lock.Lock()
	defer game.lock.Unlock()
	deck := make([]string, 0, len(game.deck))
	for _, card := range game.deck {
		deck = append(deck, card.location)
	}
	return deck
}

func (game *Game) DeckColor() *string {
	game.lock.Lock()
	defer game.lock.Unlock()
	if color := getDeckColor(game.deck); color != "" {
		return &color
	}
	return nil
}

func (lobby *Game) PlayerTurn() string {
	lobby.lock.Lock()
	defer lobby.lock.Unlock()
	return lobby.order[lobby.turn]
}

func (game *Game) distributeCards() {
	rand.Shuffle(len(game.allCards), func(i, j int) {
		game.allCards[i], game.allCards[j] = game.allCards[j], game.allCards[i]
	})
	var i int
	for _, player := range game.players {
		for _, card := range game.allCards[i*game.round : (i+1)*game.round] {
			player.hand[card.id] = card
		}
		i++
	}
	if len(game.players)*game.round == len(game.allCards) {
		i = rand.Intn(len(game.allCards))
	} else {
		i = len(game.players) * game.round
	}
	game.deck = game.deck[0:0]
	game.trickColor = game.allCards[i].color
}
