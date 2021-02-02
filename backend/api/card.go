package api

import gql "github.com/graphql-go/graphql"

var cardType = gql.NewObject(gql.ObjectConfig{
	Name: "Card",
	Fields: gql.Fields{
		"id": &gql.Field{
			Type: gql.NewNonNull(gql.ID),
		},
		"location": &gql.Field{
			Type: gql.NewNonNull(gql.String),
		},
		"playable": &gql.Field{
			Type: gql.NewNonNull(gql.Boolean),
		},
	},
})
