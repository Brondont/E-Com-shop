package utils

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/Brondont/E-Com-shop/middleware"
	"golang.org/x/crypto/bcrypt"
)

type ErrorResponse struct {
	Error string `json:"error"`
}

func ParseJson(r *http.Request, payload any) error {
	if r.Body == nil {
		return fmt.Errorf("Missing request body")
	}
	return json.NewDecoder(r.Body).Decode(payload)
}

func WriteJson(w http.ResponseWriter, status int, v any) error {
	w.Header().Add("Content-Type", "application/json")
	w.WriteHeader(status)
	return json.NewEncoder(w).Encode(v)
}

func WriteError(w http.ResponseWriter, status int, err error) {
	response := ErrorResponse{
		Error: err.Error(),
	}
	WriteJson(w, status, response)
}

func WriteInputValidationError(w http.ResponseWriter, status int, err interface{}) {
	response := middleware.ErrorResponse{}

	// Convert the error based on its type
	switch e := err.(type) {
	case middleware.InputValidationError:
		// Single error - convert to array with one item
		response.Error = []middleware.InputValidationError{e}
	case []middleware.InputValidationError:
		// Array of errors - use directly
		response.Error = e
	}

	WriteJson(w, status, response)
}

func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 14)
	return string(bytes), err
}

// VerifyPassword verifies if the given password matches the stored hash.
func VerifyPassword(password string, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}
