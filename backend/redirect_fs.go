package main

import (
	"net/http"
)

type redirectFS struct {
	http.FileSystem
}

func newRedirectFS(dir string) redirectFS {
	return redirectFS{http.Dir(dir)}
}

func (fs redirectFS) Open(name string) (http.File, error) {
	if file, err := fs.FileSystem.Open(name); err == nil {
		return file, nil
	}
	return fs.FileSystem.Open("/index.html")
}
