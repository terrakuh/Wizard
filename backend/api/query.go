package api

import (
	gql "github.com/graphql-go/graphql"
)

var queryType = gql.NewObject(gql.ObjectConfig{
	Name: "Query",
	Fields: gql.Fields{
		"lobby": &gql.Field{
			Type:    lobbyType,
			Resolve: resolveLobby,
		},
		"hand": &gql.Field{
			Type:    gql.NewList(gql.NewNonNull(cardType)),
			Resolve: resolveHand,
		},
		"scores": &gql.Field{
			Type:    gql.NewList(gql.NewNonNull(scoreType)),
			Resolve: resolveScores,
		},
		"trickColor": &gql.Field{
			Type:    gql.String,
			Resolve: resolveTrickColor,
		},
		"deck": &gql.Field{
			Type:    gql.NewList(gql.NewNonNull(gql.String)),
			Resolve: resolveDeck,
		},
		"deckColor": &gql.Field{
			Type:    gql.String,
			Resolve: resolveDeckColor,
		},
		"gameInProgress": &gql.Field{
			Type:    gql.NewNonNull(gql.Boolean),
			Resolve: resolveGameInProgress,
		},
		"playerTurn": &gql.Field{
			Type:    gql.String,
			Resolve: resolvePlayerTurn,
		},
		"trickCallRequired": &gql.Field{
			Type:    trickCallingType,
			Resolve: resolveTrickCallRequired,
		},
	},
})
