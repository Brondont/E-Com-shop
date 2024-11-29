package handlers

import (
	"errors"
	"net/http"

	"gorm.io/gorm"

	"github.com/Brondont/E-Com-shop/db"
	"github.com/Brondont/E-Com-shop/internal/auth"
	"github.com/Brondont/E-Com-shop/middleware"
	"github.com/Brondont/E-Com-shop/models"
	"github.com/Brondont/E-Com-shop/utils"
)

type Handler struct{}

func NewUserHandler() *Handler {
	return &Handler{}
}

// GetUser retrieves user information from db
func (h *Handler) GetUser(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value("userID").(int)
	if !ok {
		err := errors.New("No user id found")
		utils.WriteError(w, http.StatusUnauthorized, err)
		return
	}

	// Fetch user from database, excluding sensitive information
	var user models.User
	result := db.DB.DB.Select(
		"id", "email", "username", "created_at",
		// Add other non-sensitive fields you want to return
	).Where("id = ?", userID).First(&user)

	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			err := errors.New("User not found")
			utils.WriteError(w, http.StatusNotFound, err)
			return
		}

		// Handle other potential database errors
		utils.WriteError(w, http.StatusInternalServerError, result.Error)
		return
	}

	// Respond with user data
	utils.WriteJson(w, http.StatusOK, map[string]interface{}{
		"user": user,
	})
}

// PostLogin handles users login
func (h *Handler) PostLogin(w http.ResponseWriter, r *http.Request) {
	var payload models.User
	if err := utils.ParseJson(r, &payload); err != nil {
		utils.WriteError(w, http.StatusBadRequest, err)
		return
	}

	// get user object
	var user models.User
	result := db.DB.DB.Where("email = ?", payload.Email).First(&user)
	if result.Error != nil {
		// User does not exist
		err := middleware.InputValidationError{
			Type:  "invalid",
			Value: payload.Email,
			Msg:   "No user found with this email",
			Path:  "email",
		}

		utils.WriteInputValidationError(w, http.StatusConflict, err)
		return
	}

	// found user -> validate password
	if !utils.VerifyPassword(payload.Password, user.Password) {
		// incorrect password
		err := middleware.InputValidationError{
			Type:  "invalid",
			Value: "[hidden]",
			Msg:   "Invalid credentials",
			Path:  "password",
		}

		utils.WriteInputValidationError(w, http.StatusUnauthorized, err)
		return
	}
	// password is correct create JWT and return proper response
	token, err := auth.CreateJWT(user.ID)
	if err != nil {
		utils.WriteError(w, http.StatusInternalServerError, err)
		return
	}

	utils.WriteJson(w, http.StatusCreated, map[string]interface{}{
		"message": "User validated",
		"token":   token,
	})
}

// PostSignup handles user sign up
func (h *Handler) PostSignup(w http.ResponseWriter, r *http.Request) {
	// parse the json body
	var payload models.User
	if err := utils.ParseJson(r, &payload); err != nil {
		utils.WriteError(w, http.StatusBadRequest, err)
		return
	}

	// validate input
	if errs := middleware.ValidateUserInput(payload); len(errs) != 0 {
		utils.WriteInputValidationError(w, http.StatusConflict, errs)
		return
	}

	var existingUser models.User
	// check if the user exists
	result := db.DB.DB.Where("email = ?", payload.Email).First(&existingUser)

	if result.Error == nil {
		// User does exist
		if existingUser.Email == payload.Email {
			err := middleware.InputValidationError{
				Type:  "invalid",
				Value: payload.Email,
				Msg:   "An account with this E-mail already exists",
				Path:  "email",
			}

			utils.WriteInputValidationError(w, http.StatusConflict, err)
			return
		}
	}

	// User doesn't exist
	// Hash the users password
	hashedPassowrd, err := utils.HashPassword(payload.Password)
	if err != nil {
		utils.WriteError(w, http.StatusInternalServerError, result.Error)
		return
	}
	payload.Password = hashedPassowrd

	// Create the user
	result = db.DB.DB.Create(&payload)
	if result.Error != nil {
		utils.WriteError(w, http.StatusInternalServerError, result.Error)
		return
	}

	utils.WriteJson(w, http.StatusCreated, map[string]interface{}{
		"message": "User created successfully",
		"user":    payload,
	})
}
