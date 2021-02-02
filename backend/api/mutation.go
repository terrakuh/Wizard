package api

import gql "github.com/graphql-go/graphql"

var mutationType = gql.NewObject(gql.ObjectConfig{
	Name: "Mutation",
	Fields: gql.Fields{
		"createLobby": &gql.Field{
			Type: lobbyType,
			Args: gql.FieldConfigArgument{
				"playerName": &gql.ArgumentConfig{
					Type: gql.NewNonNull(gql.String),
				},
			},
			Resolve: resolveCreateLobby,
		},
		"joinLobby": &gql.Field{
			Type: lobbyType,
			Args: gql.FieldConfigArgument{
				"id": &gql.ArgumentConfig{
					Type: gql.NewNonNull(gql.ID),
				},
				"playerName": &gql.ArgumentConfig{
					Type: gql.NewNonNull(gql.String),
				},
			},
			Resolve: resolveJoinLobby,
		},
		"playCard": &gql.Field{
			Type: gql.NewList(gql.NewNonNull(cardType)),
			Args: gql.FieldConfigArgument{
				"cardID": &gql.ArgumentConfig{
					Type: gql.NewNonNull(gql.ID),
				},
			},
			Resolve: resolvePlayCard,
		},
		"startGame": &gql.Field{
			Type:    gql.DateTime,
			Resolve: resolveStartGame,
		},
		"callTricks": &gql.Field{
			Type: trickCallingType,
			Args: gql.FieldConfigArgument{
				"count": &gql.ArgumentConfig{
					Type: gql.NewNonNull(gql.Int),
				},
			},
			Resolve: resolveCallTricks,
		},
	},
})
