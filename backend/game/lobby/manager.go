package lobby

import (
	"errors"
	"log"
	"strings"
	"sync"
	"time"
)

type Manager struct {
	options ManagerOptions
	lock    sync.Mutex
	lobbies map[string]*Lobby
}

type ManagerOptions struct {
	Limit            int
	CodeLength       int
	OverallLifetime  time.Duration
	InactiveLifetime time.Duration
	Lobby            LobbyOptions
}

func NewManager(options ManagerOptions) *Manager {
	if options.CodeLength <= 0 {
		options.CodeLength = 5
	}
	return &Manager{
		options: options,
		lobbies: make(map[string]*Lobby),
	}
}

func (manager *Manager) CreateLobby() (*Lobby, error) {
	manager.lock.Lock()
	defer manager.lock.Unlock()
	if manager.options.Limit != 0 && len(manager.lobbies) >= manager.options.Limit {
		return nil, errors.New("lobby limit reached")
	}
	var id string
	for i := 0; true; i++ {
		id = strings.ToUpper(randomString(manager.options.CodeLength))
		if _, exists := manager.lobbies[id]; !exists {
			break
		} else if i >= 10 {
			return nil, errors.New("failed to generate lobby id")
		}
	}
	lobby := &Lobby{
		id:      id,
		players: make(map[string]*player),
		options: manager.options.Lobby,
	}
	manager.lobbies[id] = lobby
	manager.launchLobbyWatchdogs(lobby)
	return lobby, nil
}

func (manager *Manager) GetLobby(id string) *Lobby {
	manager.lock.Lock()
	defer manager.lock.Unlock()
	if lobby, ok := manager.lobbies[strings.ToUpper(id)]; ok {
		return lobby
	}
	return nil
}

func (manager *Manager) RemoveLobby(id string) bool {
	manager.lock.Lock()
	defer manager.lock.Unlock()
	id = strings.ToUpper(id)
	if lobby, ok := manager.lobbies[id]; ok {
		lobby.close()
		delete(manager.lobbies, id)
		return true
	}
	return false
}

func (manager *Manager) launchLobbyWatchdogs(lobby *Lobby) {
	if manager.options.OverallLifetime > 0 {
		go func() {
			time.Sleep(manager.options.OverallLifetime)
			log.Print("closing lobby due to overall lifetime")
			manager.RemoveLobby(lobby.id)
		}()
	}
	if manager.options.InactiveLifetime > 0 {
		lobby.inactiveReset = make(chan struct{})
		go func() {
			for {
				select {
				case <-time.After(manager.options.InactiveLifetime):
					log.Print("closing lobby due to inactivity")
					manager.RemoveLobby(lobby.id)
					return
				case _, ok := <-lobby.inactiveReset:
					if !ok {
						return
					}
				}
			}
		}()
	}
}
