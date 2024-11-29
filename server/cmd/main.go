package main

import (
	"log"

	"github.com/Brondont/E-Com-shop/cmd/api"
	"github.com/Brondont/E-Com-shop/db"
)

func main() {
	db.ConnectDB()

	server := api.NewAPIServer(":3080", nil)
	if err := server.Run(); err != nil {
		log.Fatal(err)
	}
}
