package api

import gql "github.com/graphql-go/graphql"

var trickType = gql.NewObject(gql.ObjectConfig{
	Name: "Trick",
	Fields: gql.Fields{
		"actual": &gql.Field{
			Type: gql.NewNonNull(gql.Int),
		},
		"called": &gql.Field{
			Type: gql.NewNonNull(gql.Int),
		},
	},
})

var trickCallingType = gql.NewObject(gql.ObjectConfig{
	Name: "TrickCalling",
	Fields: gql.Fields{
		"playersLeft": &gql.Field{
			Type: gql.NewNonNull(gql.Int),
		},
		"called": &gql.Field{
			Type: gql.NewNonNull(gql.Int),
		},
		"round": &gql.Field{
			Type: gql.NewNonNull(gql.Int),
		},
		"yourTurn": &gql.Field{
			Type: gql.NewNonNull(gql.Boolean),
		},
	},
})

func resolveTrickCallRequired(p gql.ResolveParams) (interface{}, error) {
	game, name, _ := getActiveGame(p)
	if game == nil {
		return nil, nil
	}
	return game.TrickCallRequired(name), nil
}

func resolveCallTricks(p gql.ResolveParams) (interface{}, error) {
	game, name, _ := getActiveGame(p)
	if game == nil {
		return nil, nil
	}
	err := game.CallTricks(name, p.Args["count"].(int))
	return game.TrickCallRequired(name), err
}
