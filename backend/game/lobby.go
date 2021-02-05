package game

import (
	"errors"
	"math/rand"
	"sync"

	"github.com/terrakuh/wizard/game/logic"
)

type Lobby struct {
	id        string
	lock      sync.Mutex
	masterKey string
	players   map[string]*player
	game      *logic.Game
}

func (lobby *Lobby) ID() string {
	return lobby.id
}

func (lobby *Lobby) StartGame(key string) error {
	lobby.lock.Lock()
	defer lobby.lock.Unlock()
	if key != lobby.masterKey {
		return errors.New("only lobby master can start the game")
	} else if lobby.game != nil {
		return errors.New("game already in progress")
	}
	names := make([]string, 0, len(lobby.players))
	for _, player := range lobby.players {
		names = append(names, player.name)
	}
	game, err := logic.NewGame(names)
	if err != nil {
		return err
	}
	lobby.game = game
	return nil
}

func (lobby *Lobby) Game() *logic.Game {
	lobby.lock.Lock()
	defer lobby.lock.Unlock()
	return lobby.game
}

func (lobby *Lobby) SetLobbyMaster(key string) {
	lobby.lock.Lock()
	defer lobby.lock.Unlock()
	lobby.masterKey = key
}

func (lobby *Lobby) IsLobbyMaster(key string) bool {
	lobby.lock.Lock()
	defer lobby.lock.Unlock()
	return lobby.masterKey == key
}

func randomString(n int) string {
	const letterBytes = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	b := make([]byte, n)
	for i := range b {
		b[i] = letterBytes[rand.Intn(len(letterBytes))]
	}
	return string(b)
}
