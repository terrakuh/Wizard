package logic

import (
	"errors"
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
	trickCallingCache *TrickCalling
	turner            turner
	inactiveReset     chan struct{}
}

func NewGame(names []string, inactiveReset chan struct{}) (*Game, error) {
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
		players:  make(map[string]*Player),
		order:    names,
		deck:     make([]*card, 0, len(names)),
		turner: turner{
			round: 1,
		},
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
	} else if name != game.playerTurn() {
		return errors.New("not your turn")
	} else if game.trickCallingCache != nil {
		return errors.New("hold on a minute")
	}
	player := game.players[name]
	card, ok := player.hand[id]
	if !ok {
		return errors.New("you don't have that card")
	}
	// check if playable
	if !card.isPlayable(getDeckColor(game.deck), player.hand) {
		return errors.New("card is not playable; look harder")
	}
	if game.inactiveReset != nil {
		game.inactiveReset <- struct{}{}
	}
	// play
	delete(player.hand, id)
	game.deck = append(game.deck, card)
	game.advanceTurn()
	return nil
}

func (game *Game) isGameOver() bool {
	return game.turner.round*len(game.players) > len(game.allCards)
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

func (game *Game) distributeCards() {
	rand.Shuffle(len(game.allCards), func(i, j int) {
		game.allCards[i], game.allCards[j] = game.allCards[j], game.allCards[i]
	})
	var i int
	for _, player := range game.players {
		for _, card := range game.allCards[i*game.turner.round : (i+1)*game.turner.round] {
			player.hand[card.id] = card
		}
		i++
	}
	if len(game.players)*game.turner.round == len(game.allCards) {
		i = rand.Intn(len(game.allCards))
	} else {
		i = len(game.players) * game.turner.round
	}
	game.deck = game.deck[0:0]
	game.trickColor = game.allCards[i].color
}
