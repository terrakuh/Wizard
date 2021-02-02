package game

import (
	"errors"
	"strings"
	"sync"
)

type Manager struct {
	options ManagerOptions
	lock    sync.Mutex
	lobbies map[string]*Lobby
}

type ManagerOptions struct {
	LobbyLimit      int
	LobbyCodeLength int
}

func NewManager(options ManagerOptions) *Manager {
	if options.LobbyCodeLength <= 0 {
		options.LobbyCodeLength = 5
	}
	return &Manager{
		options: options,
		lobbies: make(map[string]*Lobby),
	}
}

func (manager *Manager) CreateLobby() (*Lobby, error) {
	manager.lock.Lock()
	defer manager.lock.Unlock()
	if manager.options.LobbyLimit != 0 && len(manager.lobbies) >= manager.options.LobbyLimit {
		return nil, errors.New("lobby limit reached")
	}
	var id string
	for i := 0; true; i++ {
		id = strings.ToUpper(randomString(manager.options.LobbyCodeLength))
		if _, exists := manager.lobbies[id]; !exists {
			break
		} else if i >= 10 {
			return nil, errors.New("failed to generate lobby id")
		}
	}
	lobby := &Lobby{
		id:      id,
		players: make(map[string]*player),
	}
	manager.lobbies[id] = lobby
	return lobby, nil
}

func (manager *Manager) GetLobby(id string) *Lobby {
	manager.lock.Lock()
	defer manager.lock.Unlock()
	if lobby, ok := manager.lobbies[id]; ok {
		return lobby
	}
	return nil
}
