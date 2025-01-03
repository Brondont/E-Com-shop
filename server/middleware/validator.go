package middleware

import (
	"fmt"
	"log"
	"regexp"

	"github.com/Brondont/E-Com-shop/models"
)

type InputValidationError struct {
	Type  string      `json:"type"`
	Value interface{} `json:"value"`
	Msg   string      `json:"msg"`
	Path  string      `json:"path"`
}

type ErrorResponse struct {
	Error []InputValidationError `json:"error"`
}

// ValidateUserInput: Validates user sign up infromation
func ValidateUserInput(payload models.User) []InputValidationError {
	var errors []InputValidationError

	// Validate email
	if !isValidEmail(payload.Email) {
		errors = append(errors, InputValidationError{
			Type:  "invalid",
			Value: payload.Email,
			Msg:   "is not a valid email address",
			Path:  "email",
		})
	}

	// Validate username length
	if len(payload.Username) < 5 {
		errors = append(errors, InputValidationError{
			Type:  "invalid",
			Value: payload.Username,
			Msg:   "must be at least 5 characters long",
			Path:  "username",
		})
	}

	// Validate password
	if err := validatePassword(payload.Password); err != nil {
		errors = append(errors, InputValidationError{
			Type:  "invalid",
			Value: "[hidden]",
			Msg:   err.Error(),
			Path:  "password",
		})
	}


	// Phone number validation
	re := regexp.MustCompile(`^\+?[1-9]\d{1,14}$`)
	log.Print(payload.PhoneNumber)
	if !re.MatchString(payload.PhoneNumber) {
			errors = append(errors, InputValidationError{
					Type:  "invalid",
					Value: payload.PhoneNumber,
					Msg:   "Invalid phone number submitted.",
					Path:  "phone",
			})
	}

	return errors
}

// ValidateUserAddress: validates wether the payload fields are empty
func ValidateUserAddress(payload models.Address) []InputValidationError {
	var errors []InputValidationError

	// Validate street
	if payload.Street1 == "" {
		errors = append(errors, InputValidationError{
			Type:  "required",
			Value: payload.Street1,
			Msg:   "street address is required",
			Path:  "street",
		})
	}

	// Validate country
	if payload.Country == "" {
		errors = append(errors, InputValidationError{
			Type:  "required",
			Value: payload.Country,
			Msg:   "country is required",
			Path:  "country",
		})
	}

	return errors
}

// Helper functions remain the same
func isValidEmail(email string) bool {
	emailRegex := regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)
	return emailRegex.MatchString(email)
}

func validatePassword(password string) error {
	if len(password) < 8 {
		return fmt.Errorf("password must be at least 8 characters long")
	}

	// TODOMAYBE: add upper case special case kind of password validation
	return nil
}
