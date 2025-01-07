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
	router.HandleFunc("/manufacturers", generalHandler.GetManufacturers).Methods("GET")
	router.HandleFunc("/products", generalHandler.GetProducts).Methods("GET")
	router.HandleFunc("/product/{productID}", generalHandler.GetProduct).Methods("GET")
	router.HandleFunc("/variants/{productID}", generalHandler.GetVariants).Methods("GET")

	// User routes
	router.HandleFunc("/getUser", auth.IsAuth(userHandler.GetUser)).Methods("GET")
	router.HandleFunc("/getAddresses", auth.IsAuth(userHandler.GetAddresses)).Methods("GET")
	router.HandleFunc("/postAddress", auth.IsAuth(userHandler.PostAddress)).Methods("POST")
	router.HandleFunc("/putAddress", auth.IsAuth(userHandler.PutAddress)).Methods("PUT")

	// Admin Routes
	router.HandleFunc("/category", auth.IsAdmin(adminHandler.PostCategory)).Methods("POST")
	router.HandleFunc("/manufacturer", auth.IsAdmin(adminHandler.PostManufacturer)).Methods("POST")
	router.HandleFunc("/product", auth.IsAdmin(adminHandler.PostProduct)).Methods("POST")

	router.HandleFunc("/variant", auth.IsAdmin(adminHandler.PostVariant)).Methods("POST")
	router.HandleFunc("/variant/{variantID}", auth.IsAdmin(adminHandler.DeleteVariant)).Methods("DELETE")
	router.HandleFunc("/variant", auth.IsAdmin((adminHandler.PutVariant))).Methods("PUT")

	// Auth Routes
	router.HandleFunc("/postLogin", userHandler.PostLogin).Methods("POST")
	router.HandleFunc("/postSignup", userHandler.PostSignup).Methods("POST")

}

func SetupStaticRoutes(router *mux.Router) {

	router.PathPrefix("/public/").Handler(
		http.StripPrefix("/public/", http.FileServer(http.Dir("./public/"))),
	)

	log.Println("Static file server running on /public")
}
