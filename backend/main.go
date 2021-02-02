package main

import (
	"flag"
	"log"
	"math/rand"
	"net/http"
	"time"

	"git.ayar.eu/yunus/Wizard/api"
	"github.com/gorilla/mux"
)

func main() {
	rand.Seed(time.Now().Unix())

	host := flag.String("host", "localhost:8080", "the host address and port")
	flag.Parse()

	router := mux.NewRouter()
	http.Handle("/api/", router)
	http.Handle("/", cacher(http.FileServer(newRedirectFS("./static"))))
	myAPI, err := api.NewAPI()
	if err != nil {
		panic(err)
	}
	myAPI.AdvertiseCalls(router)

	log.Print("hosting on ", *host)
	http.ListenAndServe(*host, nil)
}
