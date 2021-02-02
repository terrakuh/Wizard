package logic

import "sort"

type Trick struct {
	Actual int `json:"actual"`
	Called int `json:"called"`
}

type Player struct {
	hand   map[int]*card
	Points int    `json:"points"`
	Name   string `json:"name"`
	Trick  *Trick `json:"trick,omitempty"`
}

func (game *Game) PlayerHand(name string) []CardInfo {
	game.lock.Lock()
	defer game.lock.Unlock()
	player, ok := game.players[name]
	if !ok {
		return nil
	}
	hand := make([]CardInfo, 0, len(player.hand))
	trickColor := getDeckColor(game.deck)
	for _, card := range player.hand {
		hand = append(hand, CardInfo{
			ID:       card.id,
			Location: card.location,
			Playable: card.isPlayable(trickColor, player.hand),
		})
	}
	sort.Slice(hand, func(i, j int) bool {
		return hand[i].ID < hand[j].ID
	})
	return hand
}

func (game *Game) PlayerInfos() []Player {
	game.lock.Lock()
	defer game.lock.Unlock()
	players := make([]Player, 0, len(game.players))
	for _, key := range game.order {
		players = append(players, *game.players[key])
	}
	return players
}
