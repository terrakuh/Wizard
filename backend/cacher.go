package main

import "net/http"

func cacher(handler http.Handler) http.HandlerFunc {
	return func(response http.ResponseWriter, request *http.Request) {
		response.Header().Set("Cache-Control", "public, max-age=3600")
		handler.ServeHTTP(response, request)
	}
}
