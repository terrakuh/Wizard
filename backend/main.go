package main

import (
	sec_rand "crypto/rand"
	"encoding/binary"
	"flag"
	"log"
	"math/rand"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/terrakuh/wizard/api"
	"github.com/terrakuh/wizard/database"
)

func main() {
	setupRandom()

	dbFile := flag.String("db", "wizard.db", "the database file")
	host := flag.String("host", "0.0.0.0:8080", "the host address and port")
	flag.Parse()

	db, err := database.CreateDB(*dbFile)
	if err != nil {
		panic(err)
	}
	defer db.Close()

	router := mux.NewRouter()
	http.Handle("/api/", router)
	http.Handle("/", cacher(http.FileServer(newRedirectFS("./static"))))
	myAPI, err := api.NewAPI(db)
	if err != nil {
		panic(err)
	}
	myAPI.AdvertiseCalls(router)

	log.Print("hosting on ", *host)
	http.ListenAndServe(*host, nil)
}

func setupRandom() {
	var seed [8]byte
	sec_rand.Reader.Read(seed[:])
	rand.Seed(int64(binary.BigEndian.Uint64(seed[:])))
}
