package api

import (
	"errors"

	"github.com/gorilla/sessions"
	gql "github.com/graphql-go/graphql"
	"github.com/terrakuh/wizard/game"
)

var lobbyManager = game.NewManager(game.ManagerOptions{
	LobbyLimit:      5,
	LobbyCodeLength: 5,
})

type lobbyInfo struct {
	ID          string   `json:"id"`
	PlayerNames []string `json:"playerNames"`
	CanStart    bool     `json:"canStart"`
}

var lobbyType = gql.NewObject(gql.ObjectConfig{
	Name: "Lobby",
	Fields: gql.Fields{
		"id": &gql.Field{
			Type: gql.NewNonNull(gql.ID),
		},
		"playerNames": &gql.Field{
			Type: gql.NewNonNull(gql.NewList(gql.NewNonNull(gql.String))),
		},
		"canStart": &gql.Field{
			Type: gql.NewNonNull(gql.Boolean),
		},
	},
})

func resolveLobby(p gql.ResolveParams) (interface{}, error) {
	lobby, isMaster, err := getActiveLobby(p)
	if lobby == nil || err != nil {
		return nil, err
	}
	return lobbyInfo{
		ID:          lobby.ID(),
		CanStart:    isMaster,
		PlayerNames: lobby.PlayerNames(),
	}, nil
}

func resolveCreateLobby(p gql.ResolveParams) (interface{}, error) {
	params := p.Context.Value(keyParams).(params)
	// FIXME race condition
	if isAlreadyInLobby(params) {
		return nil, errors.New("already in lobby")
	}
	lobby, err := lobbyManager.CreateLobby()
	if err != nil {
		return nil, err
	}
	if err := addPlayerToLobby(lobby, p.Args["playerName"].(string), params); err != nil {
		return nil, err
	}
	return resolveLobby(p)
}

func resolveJoinLobby(p gql.ResolveParams) (interface{}, error) {
	params := p.Context.Value(keyParams).(params)
	// FIXME race condition
	if isAlreadyInLobby(params) {
		return nil, errors.New("already in lobby")
	}
	lobby := lobbyManager.GetLobby(p.Args["id"].(string))
	if lobby == nil {
		return nil, errors.New("lobby not found")
	}
	if err := addPlayerToLobby(lobby, p.Args["playerName"].(string), params); err != nil {
		return nil, err
	}
	return resolveLobby(p)
}

func getActiveLobby(p gql.ResolveParams) (lobby *game.Lobby, isMaster bool, err error) {
	params := p.Context.Value(keyParams).(params)
	var session *sessions.Session
	session, err = store.Get(params.request, "game")
	if session == nil {
		return
	}
	code, ok := session.Values["lobby"]
	if !ok {
		return
	}
	key, ok := session.Values["key"]
	if !ok {
		return
	}
	lobby = lobbyManager.GetLobby(code.(string))
	if lobby == nil {
		return
	}
	isMaster = lobby.IsLobbyMaster(key.(string))
	return
}

func addPlayerToLobby(lobby *game.Lobby, name string, params params) error {
	session, err := store.Get(params.request, "game")
	if session == nil {
		return err
	}
	key, err := lobby.AddPlayer(name)
	if err != nil {
		return err
	}
	// FIXME race condition
	if len(lobby.PlayerNames()) == 1 {
		lobby.SetLobbyMaster(key)
	}
	session.Values["key"] = key
	session.Values["lobby"] = lobby.ID()
	session.Save(params.request, params.response)
	return nil
}

func isAlreadyInLobby(params params) bool {
	session, _ := store.Get(params.request, "game")
	if session == nil {
		return false
	}
	code, ok := session.Values["lobby"]
	if !ok {
		return false
	}
	return lobbyManager.GetLobby(code.(string)) != nil
}
