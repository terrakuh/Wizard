package lobby

import (
	"errors"
	"sort"
)

type player struct {
	key  string
	name string
}

func (lobby *Lobby) GetPlayerName(key string) (string, error) {
	lobby.lock.Lock()
	defer lobby.lock.Unlock()
	if player, ok := lobby.players[key]; ok {
		return player.name, nil
	}
	return "", errors.New("unknown player")
}

func (lobby *Lobby) AddPlayer(name string) (string, error) {
	lobby.lock.Lock()
	defer lobby.lock.Unlock()
	if lobby.game != nil {
		return "", errors.New("game already started")
	} else if len(lobby.players) >= lobby.options.PlayerLimit {
		return "", errors.New("lobby player limit reached")
	}
	// check if in lobby
	for _, player := range lobby.players {
		if player.name == name {
			return "", errors.New("player already in lobby")
		}
	}
	// create new player
	key := randomString(16)
	lobby.players[key] = &player{
		key:  key,
		name: name,
	}
	return key, nil
}

func (lobby *Lobby) PlayerNames() []string {
	lobby.lock.Lock()
	defer lobby.lock.Unlock()
	players := make([]string, 0, len(lobby.players))
	for _, player := range lobby.players {
		players = append(players, player.name)
	}
	sort.Strings(players)
	return players
}
