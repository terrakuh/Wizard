package logic

import "errors"

type TrickCalling struct {
	PlayersLeft int  `json:"playersLeft"`
	Called      int  `json:"called"`
	Round       int  `json:"round"`
	YourTurn    bool `json:"yourTurn"`
}

func (game *Game) CallTricks(name string, count int) error {
	game.lock.Lock()
	defer game.lock.Unlock()
	if game.trickCallingCache == nil {
		return errors.New("no trick calling required")
	} else if name != game.trickCallingPlayer() {
		return errors.New("not your trick calling turn")
	} else if game.trickCallingCache.PlayersLeft == 1 && game.trickCallingCache.Called+count == game.turner.round {
		return errors.New("your call is not valid")
	}
	if game.inactiveReset != nil {
		game.inactiveReset <- struct{}{}
	}
	// call
	game.players[name].Trick = &Trick{
		Called: count,
	}
	game.trickCallingCache.Called += count
	game.trickCallingCache.PlayersLeft--
	if game.trickCallingCache.PlayersLeft <= 0 {
		game.trickCallingCache = nil
	}
	return nil
}

func (game *Game) TrickCallRequired(name string) *TrickCalling {
	game.lock.Lock()
	defer game.lock.Unlock()
	if game.trickCallingCache == nil {
		return nil
	}
	calling := *game.trickCallingCache
	calling.YourTurn = game.trickCallingPlayer() == name
	return &calling
}

func (game *Game) TrickColor() string {
	game.lock.Lock()
	defer game.lock.Unlock()
	return game.trickColor
}
