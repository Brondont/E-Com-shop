package api

import (
	"database/sql"
	"log"
	"net/http"

	"github.com/Brondont/E-Com-shop/internal/routes"
	"github.com/gorilla/mux"
)

type APIServer struct {
	addr string
	db   *sql.DB
}

func NewAPIServer(addr string, db *sql.DB) *APIServer {
	return &APIServer{
		addr: addr,
		db:   db,
	}
}

func (s *APIServer) Run() error {
	router := mux.NewRouter()
	subrouter := router.PathPrefix("/api/v1").Subrouter()

	// set up routes
	routes.SetupRoutes(subrouter)

	log.Println("Server is on !", s.addr)

	return http.ListenAndServe(s.addr, router)
}
