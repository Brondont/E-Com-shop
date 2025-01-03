package handlers

import (
	"errors"
	"fmt"
	"log"
	"net/http"

	"gorm.io/gorm"

	"github.com/Brondont/E-Com-shop/db"
	"github.com/Brondont/E-Com-shop/internal/auth"
	"github.com/Brondont/E-Com-shop/middleware"
	"github.com/Brondont/E-Com-shop/models"
	"github.com/Brondont/E-Com-shop/utils"
)

type Handler struct{}

func NewHandler() *Handler {
	return &Handler{}
}
 
type UserHandler struct{
	*Handler
}


func NewUserHandler() *UserHandler {
	return &UserHandler {
		Handler: NewHandler(),
	}
}

// GetUser retrieves user information from db
func (h *UserHandler) GetUser(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value("userID").(int)
	if !ok {
		err := errors.New("no user id found")
		utils.WriteError(w, http.StatusUnauthorized, err)
		return
	}

	// Fetch user from database, excluding sensitive information
	var user models.User
	result := db.DB.DB.Select(
		"id", "email", "username", "created_at", "phone_number", "is_admin",
		// Add other non-sensitive fields you want to return
	).Where("id = ?", userID).First(&user)

	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			err := errors.New("user not found")
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

// GetAddresses: Gets all addresses for certain user id
func (h *UserHandler) GetAddresses(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value("userID").(int)

	if !ok {
		err := errors.New("no user Id found")
		utils.WriteError(w, http.StatusUnauthorized, err)
		return
	}

	var addresses []models.Address
	result := db.DB.DB.Where("user_id = ?", userID).Find(&addresses)

	if result.Error != nil {
		utils.WriteError(w, http.StatusInternalServerError, result.Error)
		return
	}

	utils.WriteJson(w, 200, map[string]interface{}{
		"addresses": addresses,
	})
}

// PostAddress: Creates new address for a user
func (h *UserHandler) PostAddress(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value("userID").(int)

	if !ok {
		err := errors.New("no user Id found")
		utils.WriteError(w, http.StatusUnauthorized, err)
		return
	}

	var payload models.Address
	if err := utils.ParseJson(r, &payload); err != nil {
		utils.WriteError(w, http.StatusBadRequest, err)
		return
	}

	// validate input
	if errs := middleware.ValidateUserAddress(payload); len(errs) != 0 {
		for _, err := range errs {
			fmt.Println(err.Path)
		}
		utils.WriteInputValidationError(w, http.StatusConflict, errs)
		return
	}

	// Set the user ID in the address object
	payload.UserID = uint(userID)

	// Save the address in the database
	result := db.DB.DB.Create(&payload)
	if result.Error != nil {
		utils.WriteError(w, http.StatusInternalServerError, result.Error)
		return
	}

	// Respond with the newly created address
	utils.WriteJson(w, http.StatusCreated, map[string]interface{}{
		"message": "Address created successfully",
		"address": payload,
	})
}

func (h *UserHandler) PutAddress(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value("userID").(int)

	if !ok {
		err := errors.New("no user Id found")
		utils.WriteError(w, http.StatusUnauthorized, err)
		return
	}

	var payload models.Address
	if err := utils.ParseJson(r, &payload); err != nil {
		utils.WriteError(w, http.StatusBadRequest, err)
		return
	}

	log.Print(payload.ID)
	 // Ensure the address ID is provided in the payload
	 if payload.ID == 0 {
		err := errors.New("address ID is required")
		utils.WriteError(w, http.StatusBadRequest, err)
		return
}

	// validate input
	if errs := middleware.ValidateUserAddress(payload); len(errs) != 0 {
		for _, err := range errs {
			fmt.Println(err.Path)
		}
		utils.WriteInputValidationError(w, http.StatusConflict, errs)
		return
	}

	// Set the user ID in the address object
	payload.UserID = uint(userID)

	 // Find the existing address by ID
	 var existingAddress models.Address
	 result := db.DB.DB.Where("id = ?", payload.ID).First(&existingAddress)
	 if result.Error != nil {
			 if result.Error == gorm.ErrRecordNotFound {
					 err := errors.New("address not found")
					 utils.WriteError(w, http.StatusNotFound, err)
					 return
			 }
			 utils.WriteError(w, http.StatusInternalServerError, result.Error)
			 return
	 }

	 // Ensure the address belongs to the current user
	 if existingAddress.UserID != uint(userID) {
			 err := errors.New("address does not belong to the user")
			 utils.WriteError(w, http.StatusForbidden, err)
			 return
	 }

	 // Update the existing address with the new data from payload
	 existingAddress = payload

	 // Save the updated address to the database
	 updateResult := db.DB.DB.Save(&existingAddress)
	 if updateResult.Error != nil {
			 utils.WriteError(w, http.StatusInternalServerError, updateResult.Error)
			 return
	 }

	// Respond with the newly created address
	utils.WriteJson(w, http.StatusCreated, map[string]interface{}{
		"message": "Address created successfully",
		"address": payload,
	})
}

// PostLogin handles users login
func (h *UserHandler) PostLogin(w http.ResponseWriter, r *http.Request) {
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
			Type:  "Invalid",
			Value: "[hidden]",
			Msg:   "Incorrect user credentials.",
			Path:  "password",
		}
		utils.WriteInputValidationError(w, http.StatusUnauthorized, err)
		return
	}
	// password is correct create JWT and return proper response
	token, err := auth.CreateJWT(user.ID, user.IsAdmin)
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
func (h *UserHandler) PostSignup(w http.ResponseWriter, r *http.Request) {
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
	hashedPassword, err := utils.HashPassword(payload.Password)
	if err != nil {
		utils.WriteError(w, http.StatusInternalServerError, result.Error)
		return
	}
	payload.Password = hashedPassword

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

