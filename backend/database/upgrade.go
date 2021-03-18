package database

import (
	"database/sql"
	"fmt"
)

var versions = []func(db *sql.DB) error{v1}

func checkUpgrade(db *sql.DB) error {
	row := db.QueryRow("PRAGMA user_version")
	var currentVersion int
	if err := row.Scan(&currentVersion); err != nil {
		return err
	}
	if currentVersion < 0 || currentVersion > len(versions) {
		return fmt.Errorf("invalid version %d", currentVersion)
	}
	// upgrade
	for id, upgrade := range versions {
		if currentVersion == id {
			if err := upgrade(db); err != nil {
				return err
			}
			currentVersion++
			db.Exec(fmt.Sprint("PRAGMA user_version=", currentVersion))
		}
	}
	return nil
}
