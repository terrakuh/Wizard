package api

import (
	gql "github.com/graphql-go/graphql"
)

var scoreType = gql.NewObject(gql.ObjectConfig{
	Name: "Score",
	Fields: gql.Fields{
		"name": &gql.Field{
			Type: gql.NewNonNull(gql.String),
		},
		"points": &gql.Field{
			Type: gql.NewNonNull(gql.Int),
		},
		"trick": &gql.Field{
			Type: trickType,
		},
	},
})

func resolveScores(p gql.ResolveParams) (interface{}, error) {
	game, _, _ := getActiveGame(p)
	if game == nil {
		return nil, nil
	}
	return game.PlayerInfos(), nil
}
