package api

import (
	"errors"
	"strconv"
	"time"

	"git.ayar.eu/yunus/Wizard/game/logic"
	gql "github.com/graphql-go/graphql"
)

func resolveHand(p gql.ResolveParams) (interface{}, error) {
	game, name, _ := getActiveGame(p)
	if game == nil {
		return nil, nil
	}
	return game.PlayerHand(name), nil
}

func resolveTrickColor(p gql.ResolveParams) (interface{}, error) {
	game, _, _ := getActiveGame(p)
	if game == nil {
		return nil, nil
	}
	return game.TrickColor(), nil
}

func resolveDeck(p gql.ResolveParams) (interface{}, error) {
	game, _, _ := getActiveGame(p)
	if game == nil {
		return nil, nil
	}
	return game.Deck(), nil
}

func resolveDeckColor(p gql.ResolveParams) (interface{}, error) {
	game, _, _ := getActiveGame(p)
	if game == nil {
		return nil, nil
	}
	return game.DeckColor(), nil
}

func resolveGameInProgress(p gql.ResolveParams) (interface{}, error) {
	game, _, _ := getActiveGame(p)
	return game != nil, nil
}

func resolvePlayerTurn(p gql.ResolveParams) (interface{}, error) {
	game, _, _ := getActiveGame(p)
	if game == nil {
		return nil, nil
	}
	turn := game.PlayerTurn()
	return &turn, nil
}

func resolvePlayCard(p gql.ResolveParams) (interface{}, error) {
	game, name, _ := getActiveGame(p)
	if game == nil {
		return nil, nil
	}
	id, err := strconv.Atoi(p.Args["cardID"].(string))
	if err != nil {
		return nil, err
	}
	if err := game.PlayCard(name, id); err != nil {
		return nil, err
	}
	return game.PlayerHand(name), nil
}

func resolveStartGame(p gql.ResolveParams) (interface{}, error) {
	lobby, _, err := getActiveLobby(p)
	if lobby == nil || err != nil {
		return nil, errors.New("no active lobby")
	}
	session, err := store.Get(p.Context.Value(keyParams).(params).request, "game")
	if session == nil {
		return nil, err
	}
	key, ok := session.Values["key"]
	if !ok {
		return nil, errors.New("no key available")
	}
	return time.Now(), lobby.StartGame(key.(string))
}

func getActiveGame(p gql.ResolveParams) (game *logic.Game, name, key string) {
	lobby, _, err := getActiveLobby(p)
	if lobby == nil || err != nil {
		return
	}
	session, _ := store.Get(p.Context.Value(keyParams).(params).request, "game")
	if session == nil {
		return
	}
	if value, ok := session.Values["key"]; ok {
		key = value.(string)
	} else {
		return
	}
	name, err = lobby.GetPlayerName(key)
	if err != nil {
		return
	}
	game = lobby.Game()
	return
}
