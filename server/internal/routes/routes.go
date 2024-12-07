package routes

import (
	"github.com/Brondont/E-Com-shop/internal/auth"
	"github.com/Brondont/E-Com-shop/internal/handlers"
	"github.com/gorilla/mux"
)

func SetupRoutes(router *mux.Router) {
	userHandler := handlers.NewUserHandler()

	// User routes
	router.HandleFunc("/getUser", auth.IsAuth(userHandler.GetUser)).Methods("GET")
	router.HandleFunc("/postAddress", auth.IsAuth(userHandler.PostAddress)).Methods("POST")

	// Auth Routes
	router.HandleFunc("/postLogin", userHandler.PostLogin).Methods("POST")
	router.HandleFunc("/postSignup", userHandler.PostSignup).Methods("POST")
}
