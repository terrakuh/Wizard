package logic

import "fmt"

type CardInfo struct {
	ID       int    `json:"id"`
	Location string `json:"location"`
	Playable bool   `json:"playable"`
}

type card struct {
	id       int
	value    int
	color    string
	location string
}

func standardCardSet() []*card {
	var cards []*card
	var idCounter int
	// normal cards
	for _, color := range []string{"red", "green", "blue", "yellow"} {
		for i := 1; i <= 13; i++ {
			cards = append(cards, &card{
				id:       idCounter,
				value:    i,
				color:    color,
				location: fmt.Sprintf("%s_%d", color, i),
			})
			idCounter++
		}
	}
	// wizards and fools
	for i := 0; i < 8; i++ {
		cards = append(cards, &card{
			id:       idCounter,
			value:    50 * (i % 2),
			location: fmt.Sprint([]string{"fool_", "wizard_"}[i%2], i/2),
		})
		idCounter++
	}
	return cards
}

func (c *card) calculateValue(winningColor string) int {
	if c.color != "" && c.color == winningColor {
		return c.value + 13
	}
	return c.value
}

func getDeckColor(deck []*card) string {
	for _, card := range deck {
		if card.color != "" {
			return card.color
		}
	}
	return ""
}

func (c *card) isPlayable(deckColor string, hand map[int]*card) bool {
	if c.color == "" || c.color == deckColor {
		return true
	}
	// check if player has other deck color
	if deckColor != "" {
		for _, card := range hand {
			if card.id != c.id && card.color == deckColor {
				return false
			}
		}
	}
	return true
}
