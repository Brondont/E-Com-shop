package routes

import (
	"log"
	"net/http"

	"github.com/Brondont/E-Com-shop/internal/auth"
	"github.com/Brondont/E-Com-shop/internal/handlers"
	"github.com/gorilla/mux"
)

func SetupRoutes(router *mux.Router) {
	userHandler := handlers.NewUserHandler()
	adminHandler := handlers.NewAdminHandler()
	generalHandler := handlers.NewGeneralHandler()

	// General Routes
	router.HandleFunc("/categories", generalHandler.GetCategories).Methods("GET")
	router.HandleFunc("/brands", generalHandler.GetBrands).Methods("GET") // Updated endpoint
	router.HandleFunc("/products", generalHandler.GetProducts).Methods("GET")
	router.HandleFunc("/product/{productID}", generalHandler.GetProduct).Methods("GET")
	router.HandleFunc("/variants/{productID}", generalHandler.GetVariants).Methods("GET")

	// User routes
	router.HandleFunc("/user", auth.IsAuth(userHandler.GetUser)).Methods("GET")
	router.HandleFunc("/user", auth.IsAuth(userHandler.PutUser)).Methods("PUT")
	router.HandleFunc("/addresses", auth.IsAuth(userHandler.GetAddresses)).Methods("GET")
	router.HandleFunc("/address", auth.IsAuth(userHandler.PostAddress)).Methods("POST")
	router.HandleFunc("/address", auth.IsAuth(userHandler.PutAddress)).Methods("PUT")
	router.HandleFunc("/cart", auth.IsAuth(userHandler.GetCart)).Methods("GET")
	router.HandleFunc("/cart", auth.IsAuth(userHandler.PostCart)).Methods("POST")
	router.HandleFunc("/cart/{cartItemID}", auth.IsAuth(userHandler.DeleteCart)).Methods("DELETE")
	router.HandleFunc("/cart", auth.IsAuth(userHandler.UpdateCart)).Methods("PUT")

	// Admin Routes
	router.HandleFunc("/users", auth.IsAdmin(adminHandler.GetUsers)).Methods("GET")
	router.HandleFunc("/users/{userID}", auth.IsAdmin(adminHandler.DeleteUser)).Methods("DELETE")
	router.HandleFunc("/category", auth.IsAdmin(adminHandler.PostCategory)).Methods("POST")
	router.HandleFunc("/brand", auth.IsAdmin(adminHandler.PostBrand)).Methods("POST") // Updated endpoint
	router.HandleFunc("/product", auth.IsAdmin(adminHandler.PostProduct)).Methods("POST")

	router.HandleFunc("/variant", auth.IsAdmin(adminHandler.PostVariant)).Methods("POST")
	router.HandleFunc("/variant/{variantID}", auth.IsAdmin(adminHandler.DeleteVariant)).Methods("DELETE")
	router.HandleFunc("/variant", auth.IsAdmin((adminHandler.PutVariant))).Methods("PUT")

	// Auth Routes
	router.HandleFunc("/login", userHandler.PostLogin).Methods("POST")
	router.HandleFunc("/signup", userHandler.PostSignup).Methods("POST")
}

func SetupStaticRoutes(router *mux.Router) {
	router.PathPrefix("/public/").Handler(
		http.StripPrefix("/public/", http.FileServer(http.Dir("./public/"))),
	)

	log.Println("Static file server running on /public")
}
