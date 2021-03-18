package api

import (
	"compress/gzip"
	"context"
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gorilla/mux"
	"github.com/gorilla/sessions"
	gql "github.com/graphql-go/graphql"
)

type request struct {
	Query         string                 `json:"query"`
	OperationName string                 `json:"operationName"`
	Variables     map[string]interface{} `json:"variables"`
}

type params struct {
	api      *API
	response http.ResponseWriter
	request  *http.Request
}

type API struct {
	schema gql.Schema
	db     *sql.DB
}

type key int

const keyParams key = iota

var store = sessions.NewCookieStore([]byte(os.Getenv("SESSION_KEY")))

func NewAPI(db *sql.DB) (*API, error) {
	var api API
	var err error
	api.schema, err = gql.NewSchema(gql.SchemaConfig{
		Query:    queryType,
		Mutation: mutationType,
	})
	if err != nil {
		return nil, err
	}
	api.db = db
	return &api, nil
}

func (api *API) AdvertiseCalls(router *mux.Router) {
	wrapper := func(function func(params) (code int, err error)) http.HandlerFunc {
		return func(resp http.ResponseWriter, req *http.Request) {
			start := time.Now()
			code, err := function(params{
				response: resp,
				request:  req,
				api:      api,
			})
			if err != nil {
				resp.Header().Set("Error-Msg", err.Error())
				resp.WriteHeader(code)
				log.Printf("%s %s FAIL %e %v\n", req.Method, req.URL, err, time.Now().Sub(start))
			} else {
				// log.Printf("%s %s OK %v\n", req.Method, req.URL, time.Now().Sub(start))
			}
		}
	}

	router.Handle("/api/graphql", wrapper(serveGQL)).Methods("POST").Headers("Content-Type", "application/json")
}

func serveGQL(params params) (int, error) {
	var req request
	if err := json.NewDecoder(params.request.Body).Decode(&req); err != nil {
		return http.StatusBadRequest, err
	}

	results := gql.Do(gql.Params{
		Schema:         params.api.schema,
		RequestString:  req.Query,
		Context:        context.WithValue(context.Background(), keyParams, params),
		VariableValues: req.Variables,
		OperationName:  req.OperationName,
	})

	params.response.Header().Set("Content-Type", "application/json")
	params.response.Header().Set("Content-Encoding", "gzip")
	w := gzip.NewWriter(params.response)
	json.NewEncoder(w).Encode(results)
	w.Flush()
	return 0, nil
}
