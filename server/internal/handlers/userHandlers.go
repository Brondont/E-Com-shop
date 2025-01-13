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
	"github.com/gorilla/mux"
)

type Handler struct{}

func NewHandler() *Handler {
	return &Handler{}
}

type UserHandler struct {
	*Handler
}

func NewUserHandler() *UserHandler {
	return &UserHandler{
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
		utils.WriteError(w, http.StatusInternalServerError, errors.New("something went wrong with getting the user, try again"))
		return
	}

	// Respond with user data
	utils.WriteJson(w, http.StatusOK, map[string]interface{}{
		"user": user,
	})
}

func (h *UserHandler) PutUser(w http.ResponseWriter, r *http.Request) {
	// Extract user ID from the context
	userID, ok := r.Context().Value("userID").(int)
	if !ok {
		utils.WriteError(w, http.StatusUnauthorized, errors.New("user id is missing in the token"))
		return
	}

	// Extract isAdmin flag from the context
	isAdmin, ok := r.Context().Value("isAdmin").(bool)
	if !ok {
		utils.WriteError(w, http.StatusUnauthorized, errors.New("admin status is missing in the token"))
		return
	}

	// Parse the incoming JSON payload
	var payload models.User
	err := utils.ParseJson(r, &payload)
	if err != nil {
		utils.WriteError(w, http.StatusBadRequest, err)
		return
	}

	// Fetch the existing user from the database
	var existingUser models.User
	result := db.DB.DB.Where("email = ? OR phone_number = ?", payload.Email, payload.PhoneNumber).First(&existingUser)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			utils.WriteError(w, http.StatusNotFound, errors.New("user not found"))
			return
		}
		utils.WriteError(w, http.StatusInternalServerError, errors.New("something went wrong with fetching the user, try again"))
		return
	}

	// If the user is not an admin, ensure they can only edit their own account
	if !isAdmin && existingUser.ID != uint(userID) {
		utils.WriteError(w, http.StatusForbidden, errors.New("you do not have permission to edit this user"))
		return
	}

	// Update the user's information
	existingUser.Email = payload.Email
	existingUser.Username = payload.Username
	existingUser.PhoneNumber = payload.PhoneNumber
	// Add other fields you want to update

	// Save the updated user information
	updateResult := db.DB.DB.Save(&existingUser)
	if updateResult.Error != nil {
		utils.WriteError(w, http.StatusInternalServerError, errors.New("something went wrong with updating the user, try again"))
		return
	}

	// Respond with the updated user information
	utils.WriteJson(w, http.StatusOK, map[string]interface{}{
		"message": "User updated successfully",
		"user":    existingUser,
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
		utils.WriteError(w, http.StatusInternalServerError, errors.New("something went wrong with getting the user, try again"))
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
		utils.WriteError(w, http.StatusInternalServerError, errors.New("something went wrong with creating the address, try again"))
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
	result := db.DB.DB.Where("id = ? AND user_id = ?", payload.ID, userID).First(&existingAddress)
	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			err := errors.New("address not found")
			utils.WriteError(w, http.StatusNotFound, err)
			return
		}
		utils.WriteError(w, http.StatusInternalServerError, errors.New("something went wrong with updating the address, try again"))
		return
	}

	// Update the existing address with the new data from payload
	existingAddress = payload

	// Save the updated address to the database
	updateResult := db.DB.DB.Save(&existingAddress)
	if updateResult.Error != nil {
		utils.WriteError(w, http.StatusInternalServerError, errors.New("something went wrong with updating the address, try again"))
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
		utils.WriteError(w, http.StatusInternalServerError, err)
		return
	}
	payload.Password = hashedPassword

	// Create the user
	result = db.DB.DB.Create(&payload)
	if result.Error != nil {
		utils.WriteError(w, http.StatusInternalServerError, errors.New("something went wrong with creating your user, please try again"))
		return
	}

	utils.WriteJson(w, http.StatusCreated, map[string]interface{}{
		"message": "User created successfully",
		"user":    payload,
	})
}

func (h *UserHandler) GetCart(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value("userID").(int)
	if !ok {
		err := errors.New("no user ID found")
		utils.WriteError(w, http.StatusUnauthorized, err)
		return
	}

	var cartItems []models.CartItem
	result := db.DB.DB.Preload("Variant").Preload("Variant.Images").Preload("Variant.Inventory").Where("user_id = ?", userID).Find(&cartItems)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			utils.WriteError(w, http.StatusNotFound, errors.New("user has no cart items"))
			return
		}
		utils.WriteError(w, http.StatusInternalServerError, errors.New("something went wrong"))
		return
	}

	utils.WriteJson(w, http.StatusOK, map[string]interface{}{
		"message":   "Fetched cart items successfully",
		"cartItems": cartItems,
	})
}

func (h *UserHandler) PostCart(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value("userID").(int)
	if !ok {
		err := errors.New("no user ID found")
		utils.WriteError(w, http.StatusUnauthorized, err)
		return
	}

	var payload struct {
		VariantID uint `json:"variantID"`
		Quantity  uint `json:"quantity"`
	}

	if err := utils.ParseJson(r, &payload); err != nil {
		utils.WriteError(w, http.StatusBadRequest, err)
		return
	}

	// Check if the product exists
	var variant models.Variant

	result := db.DB.DB.Preload("Inventory").Where("ID = ?", payload.VariantID).First(&variant)

	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			utils.WriteError(w, http.StatusNotFound, errors.New("product not found"))
			return
		}
		utils.WriteError(w, http.StatusInternalServerError, errors.New("something went wrong with adding variant to cart, try again"))
		return
	}

	// Validate the requested quantity
	if payload.Quantity > variant.Inventory.Quantity {
		utils.WriteError(w, http.StatusBadRequest, errors.New("requested quantity exceeds available stock"))
		return
	}

	// Check if the item already exists in the user's cart
	var existingCartItem models.CartItem
	result = db.DB.DB.Where("user_id = ? AND variant_id = ?", userID, variant.ID).First(&existingCartItem)
	if result.Error == nil {
		// Update the quantity if the item already exists
		newQuantity := existingCartItem.Quantity + payload.Quantity

		// Validate the new quantity against available stock
		if newQuantity > variant.Inventory.Quantity {
			utils.WriteError(w, http.StatusBadRequest, errors.New("requested quantity exceeds available stock"))
			return
		}

		existingCartItem.Quantity = newQuantity
		result = db.DB.DB.Save(&existingCartItem)
		if result.Error != nil {
			utils.WriteError(w, http.StatusInternalServerError, errors.New("something went wrong with adding variant to cart, try again"))
			return
		}

		utils.WriteJson(w, http.StatusOK, map[string]interface{}{
			"message":  "Cart item updated",
			"cartItem": existingCartItem,
		})
		return
	}

	// Create a new cart item
	cartItem := models.CartItem{
		UserID:    uint(userID),
		VariantID: variant.ID,
		Quantity:  payload.Quantity,
	}

	result = db.DB.DB.Create(&cartItem)

	if result.Error != nil {
		utils.WriteError(w, http.StatusInternalServerError, errors.New("something went wrong with creating cart item, try again"))
		return
	}

	utils.WriteJson(w, http.StatusCreated, map[string]interface{}{
		"message":  "Item added to cart",
		"cartItem": cartItem,
	})
}

func (h *UserHandler) DeleteCart(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value("userID").(int)
	if !ok {
		utils.WriteError(w, http.StatusUnauthorized, errors.New("token doesn't contain user id"))
		return
	}

	vars := mux.Vars(r)
	cartItemID := vars["cartItemID"]

	result := db.DB.DB.Where("user_id = ? AND id = ?", userID, cartItemID).Delete(&models.CartItem{})
	if result.Error != nil {
		utils.WriteError(w, http.StatusInternalServerError, errors.New("something went wrong with deleting the cart item, try again"))
		return
	}

	utils.WriteJson(w, http.StatusOK, map[string]interface{}{
		"message": "Cart item was successfully deleted",
	})
}

func (h *UserHandler) UpdateCart(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value("userID").(int)
	if !ok {
		utils.WriteError(w, http.StatusUnauthorized, errors.New("token doesn't contain user id"))
	}

	var payload struct {
		CartItemID  uint `json:"cartItemID"`
		NewQuantity uint `json:"newQuantity"`
	}

	err := utils.ParseJson(r, &payload)
	if err != nil {
		utils.WriteError(w, http.StatusInternalServerError, err)
		return
	}

	var cartItem models.CartItem
	result := db.DB.DB.Preload("Variant").Preload("Variant.Images").Preload("Variant.Inventory").Where("user_id = ? AND id = ?", userID, payload.CartItemID).Find(&cartItem)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			utils.WriteError(w, http.StatusNotFound, errors.New("this cart items doesn't exist"))
		}
		utils.WriteError(w, http.StatusInternalServerError, errors.New("something went wrong with updating the quantity, try again"))
		return
	}

	// check the quantity restriction
	if payload.NewQuantity > cartItem.Variant.Inventory.Quantity {
		utils.WriteError(w, http.StatusBadRequest, errors.New("quantity exceeds available stock"))
		return
	}

	cartItem.Quantity = payload.NewQuantity

	updateResult := db.DB.DB.Save(&cartItem)
	if updateResult.Error != nil {
		utils.WriteError(w, http.StatusInternalServerError, errors.New("something went wrong with updating the quantity, try again"))
	}

	utils.WriteJson(w, http.StatusOK, map[string]interface{}{
		"message":  "Updated quantity.",
		"cartItem": cartItem,
	})
}
