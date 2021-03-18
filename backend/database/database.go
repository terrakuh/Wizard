package database

import (
	"database/sql"

	_ "github.com/mattn/go-sqlite3"
)

func CreateDB(path string) (db *sql.DB, err error) {
	if db, err = sql.Open("sqlite3", path); err != nil {
		return
	}
	if err = checkUpgrade(db); err != nil {
		db.Close()
		db = nil
		return
	}
	return
}
