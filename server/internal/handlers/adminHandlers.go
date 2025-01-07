package handlers

import (
	"errors"
	"fmt"
	"net/http"
	"strconv"

	"github.com/Brondont/E-Com-shop/db"
	"github.com/Brondont/E-Com-shop/models"
	"github.com/Brondont/E-Com-shop/utils"
	"github.com/gorilla/mux"
)

const (
	maxFileSize     = 10 << 20 // 10MB
	uploadDirectory = "/public/images"
)

type AdminHandler struct {
	*Handler
}

func NewAdminHandler() *AdminHandler {
	return &AdminHandler{
		Handler: NewHandler(),
	}
}

func (h *AdminHandler) PostCategory(w http.ResponseWriter, r *http.Request) {
	// Get user ID from context
	_, ok := r.Context().Value("userID").(int)
	if !ok {
		utils.WriteError(w, http.StatusUnauthorized, errors.New("unauthorized access"))
		return
	}

	// Parse multipart form
	formData, err := utils.ParseMultipartForm(r, maxFileSize)
	if err != nil {
		utils.WriteError(w, http.StatusBadRequest, fmt.Errorf("invalid form data: %w", err))
		return
	}

	// Start transaction
	tx := db.DB.DB.Begin()
	if tx.Error != nil {
		utils.WriteError(w, http.StatusInternalServerError, tx.Error)
		return
	}
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// handle category creation
	var categoryPayload models.Category
	categoryPayload.Name = formData.Fields["name"][0]
	categoryPayload.Description = formData.Fields["description"][0]

	if categoryPayload.Name == "" || categoryPayload.Description == "" {
		err := errors.New("form fields unprovided")
		utils.WriteError(w, http.StatusConflict, err)
		return
	}

	result := tx.Create(&categoryPayload)
	if result.Error != nil {
		utils.WriteError(w, http.StatusInternalServerError, result.Error)
		return
	}

	// handle image creation
	var imagePayload models.Image
	imagePayload.ImagePath, err = utils.SaveUploadedFile(formData.File, uploadDirectory)
	if err != nil {
		tx.Rollback()
		utils.WriteError(w, http.StatusInternalServerError, err)
		return
	}
	imagePayload.CategoryID = &categoryPayload.ID

	result = tx.Create(&imagePayload)
	if result.Error != nil {
		tx.Rollback()
		utils.WriteError(w, http.StatusInternalServerError, result.Error)
		return
	}

	// Commit transaction
	result = tx.Commit()
	if result.Error != nil {
		utils.WriteError(w, http.StatusInternalServerError, result.Error)
		return
	}

	utils.WriteJson(w, http.StatusCreated, map[string]interface{}{
		"message":  "Category created succesfully",
		"category": categoryPayload,
	})

}

func (h *AdminHandler) PostManufacturer(w http.ResponseWriter, r *http.Request) {
	// Get user ID from context
	_, ok := r.Context().Value("userID").(int)
	if !ok {
		utils.WriteError(w, http.StatusUnauthorized, errors.New("unauthorized access"))
		return
	}

	// Parse multipart form
	formData, err := utils.ParseMultipartForm(r, maxFileSize)
	if err != nil {
		utils.WriteError(w, http.StatusBadRequest, fmt.Errorf("invalid form data: %w", err))
		return
	}

	tx := db.DB.DB.Begin()
	if tx.Error != nil {
		utils.WriteError(w, http.StatusInternalServerError, tx.Error)
		return
	}
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// handle category creation
	var manufacturerPayload models.Manufacturer
	manufacturerPayload.Name = formData.Fields["name"][0]
	manufacturerPayload.Description = formData.Fields["description"][0]

	if manufacturerPayload.Name == "" || manufacturerPayload.Description == "" {
		tx.Rollback()
		err := errors.New("form fields unprovided")
		utils.WriteError(w, http.StatusConflict, err)
		return
	}

	result := tx.Create(&manufacturerPayload)
	if result.Error != nil {
		tx.Rollback()
		utils.WriteError(w, http.StatusInternalServerError, result.Error)
		return
	}

	// handle image creation
	var imagePayload models.Image
	imagePayload.ImagePath, err = utils.SaveUploadedFile(formData.File, uploadDirectory)
	if err != nil {
		tx.Rollback()
		utils.WriteError(w, http.StatusInternalServerError, err)
		return
	}
	imagePayload.ManufacturerID = &manufacturerPayload.ID

	result = tx.Create(&imagePayload)
	if result.Error != nil {
		tx.Rollback()
		utils.WriteError(w, http.StatusInternalServerError, result.Error)
		return
	}

	// Commit transaction
	result = tx.Commit()
	if result.Error != nil {
		utils.WriteError(w, http.StatusInternalServerError, result.Error)
		return
	}

	utils.WriteJson(w, http.StatusCreated, map[string]interface{}{
		"message":      "Category created succesfully",
		"manufacturer": manufacturerPayload,
	})
}

func (h *AdminHandler) PostProduct(w http.ResponseWriter, r *http.Request) {
	// Get user ID from context
	_, ok := r.Context().Value("userID").(int)
	if !ok {
		utils.WriteError(w, http.StatusUnauthorized, errors.New("unauthorized access"))
		return
	}

	// Parse multipart form
	formData, err := utils.ParseMultipartForm(r, maxFileSize)
	if err != nil {
		utils.WriteError(w, http.StatusBadRequest, fmt.Errorf("invalid form data: %w", err))
		return
	}

	tx := db.DB.DB.Begin()
	if tx.Error != nil {
		utils.WriteError(w, http.StatusInternalServerError, tx.Error)
		return
	}
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// handle category creation
	var productPayload models.Product
	productPayload.Name = formData.Fields["name"][0]
	productPayload.Description = formData.Fields["description"][0]
	categoryIDInt, err := strconv.Atoi(formData.Fields["categoryID"][0])
	if err != nil {
		tx.Rollback()
		utils.WriteError(w, http.StatusInternalServerError, err)
		return
	}
	productPayload.CategoryID = uint(categoryIDInt)
	manufacturerID, err := strconv.Atoi(formData.Fields["manufacturerID"][0])
	if err != nil {
		tx.Rollback()
		utils.WriteError(w, http.StatusInternalServerError, err)
		return
	}
	productPayload.ManufacturerID = uint(manufacturerID)

	result := tx.Create(&productPayload)
	if result.Error != nil {
		tx.Rollback()
		utils.WriteError(w, http.StatusInternalServerError, result.Error)
		return
	}

	// handle image creation
	var imagePayload models.Image
	imagePayload.ImagePath, err = utils.SaveUploadedFile(formData.File, uploadDirectory)
	if err != nil {
		tx.Rollback()
		utils.WriteError(w, http.StatusInternalServerError, err)
		return
	}
	imagePayload.ProductID = &productPayload.ID

	result = tx.Create(&imagePayload)
	if result.Error != nil {
		tx.Rollback()
		utils.WriteError(w, http.StatusInternalServerError, result.Error)
		return
	}

	// Commit transaction
	result = tx.Commit()
	if result.Error != nil {
		utils.WriteError(w, http.StatusInternalServerError, result.Error)
		return
	}

	utils.WriteJson(w, http.StatusCreated, map[string]interface{}{
		"message": "Product created succesfully",
		"product": productPayload,
	})
}

func (h *AdminHandler) PostVariant(w http.ResponseWriter, r *http.Request) {
	// Get user ID from context
	_, ok := r.Context().Value("userID").(int)
	if !ok {
		utils.WriteError(w, http.StatusUnauthorized, errors.New("unauthorized access"))
		return
	}

	// Parse multipart form
	formData, err := utils.ParseMultipartForm(r, maxFileSize)
	if err != nil {
		utils.WriteError(w, http.StatusBadRequest, fmt.Errorf("invalid form data: %w", err))
		return
	}

	tx := db.DB.DB.Begin()
	if tx.Error != nil {
		utils.WriteError(w, http.StatusInternalServerError, tx.Error)
		return
	}
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// handle category creation
	var variantPayload models.Variant
	variantPayload.Name = formData.Fields["name"][0]
	variantPayload.Description = formData.Fields["description"][0]
	priceFloat64, err := strconv.ParseFloat(formData.Fields["price"][0], 64)
	if err != nil {
		tx.Rollback()
		utils.WriteError(w, http.StatusInternalServerError, err)
		return
	}
	variantPayload.Price = priceFloat64
	productIDInt, err := strconv.Atoi(formData.Fields["productID"][0])
	if err != nil {
		tx.Rollback()
		utils.WriteError(w, http.StatusInternalServerError, err)
		return
	}
	variantPayload.ProductID = uint(productIDInt)

	result := tx.Create(&variantPayload)
	if result.Error != nil {
		tx.Rollback()
		utils.WriteError(w, http.StatusInternalServerError, result.Error)
		return
	}

	// handle images creation
	for _, fileHeader := range formData.Files {
		var imagePayload models.Image
		imagePayload.ImagePath, err = utils.SaveUploadedFile(fileHeader, uploadDirectory)
		if err != nil {
			tx.Rollback()
			utils.WriteError(w, http.StatusInternalServerError, err)
			return
		}
		imagePayload.VariantID = &variantPayload.ID

		result = tx.Create(&imagePayload)
		if result.Error != nil {
			tx.Rollback()
			utils.WriteError(w, http.StatusInternalServerError, result.Error)
			return
		}
	}

	// handle inventory creation
	quantity, err := strconv.Atoi(formData.Fields["quantity"][0])
	if err != nil {
		tx.Rollback()
		utils.WriteError(w, http.StatusInternalServerError, err)
		return
	}
	var inventoryPayload models.Inventory
	inventoryPayload.Quantity = uint(quantity)
	inventoryPayload.VariantID = variantPayload.ID

	result = tx.Create(&inventoryPayload)
	if result.Error != nil {
		tx.Rollback()
		utils.WriteError(w, http.StatusInternalServerError, result.Error)
		return
	}

	// Commit transaction
	result = tx.Commit()
	if result.Error != nil {
		utils.WriteError(w, http.StatusInternalServerError, result.Error)
		return
	}

	var completeVariant models.Variant
	result = db.DB.DB.
		Preload("Images").
		Preload("Inventory").
		First(&completeVariant, variantPayload.ID)

	if result.Error != nil {
		utils.WriteError(w, http.StatusInternalServerError, result.Error)
		return
	}

	utils.WriteJson(w, http.StatusCreated, map[string]interface{}{
		"message": "Product created succesfully",
		"variant": completeVariant,
	})
}

func (h *AdminHandler) DeleteVariant(w http.ResponseWriter, r *http.Request) {
	_, ok := r.Context().Value("userID").(int)
	if !ok {
		utils.WriteError(w, http.StatusUnauthorized, errors.New("unauthorized access"))
		return
	}

	vars := mux.Vars(r)
	variantID := vars["variantID"]

	// Attempt to delete the variant from the database
	result := db.DB.DB.Delete(&models.Variant{}, "id = ?", variantID)

	// Check for errors in the delete operation
	if result.Error != nil {
		utils.WriteError(w, http.StatusInternalServerError, result.Error)
		return
	}

	utils.WriteJson(w, http.StatusOK, map[string]interface{}{
		"message": "Product created succesfully",
	})

}

func (h *AdminHandler) PutVariant(w http.ResponseWriter, r *http.Request) {
	// Get user ID from context
	_, ok := r.Context().Value("userID").(int)
	if !ok {
		utils.WriteError(w, http.StatusUnauthorized, errors.New("unauthorized access"))
		return
	}

	// Parse multipart form
	formData, err := utils.ParseMultipartForm(r, maxFileSize)
	if err != nil {
		utils.WriteError(w, http.StatusBadRequest, fmt.Errorf("invalid form data: %w", err))
		return
	}

	// Start a database transaction
	tx := db.DB.DB.Begin()
	if tx.Error != nil {
		utils.WriteError(w, http.StatusInternalServerError, tx.Error)
		return
	}
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// Get the variant ID from the form data
	variantID, err := strconv.Atoi(formData.Fields["variantID"][0])
	if err != nil {
		tx.Rollback()
		utils.WriteError(w, http.StatusBadRequest, fmt.Errorf("invalid variant ID: %w", err))
		return
	}

	// Find the old variant
	var oldVariant models.Variant
	result := tx.Preload("Images").Preload("Inventory").First(&oldVariant, variantID)
	if result.Error != nil {
		tx.Rollback()
		utils.WriteError(w, http.StatusNotFound, fmt.Errorf("variant not found: %w", result.Error))
		return
	}

	// Update the variant fields
	oldVariant.Name = formData.Fields["name"][0]
	oldVariant.Description = formData.Fields["description"][0]
	priceFloat64, err := strconv.ParseFloat(formData.Fields["price"][0], 64)
	if err != nil {
		tx.Rollback()
		utils.WriteError(w, http.StatusBadRequest, fmt.Errorf("invalid price: %w", err))
		return
	}
	oldVariant.Price = priceFloat64

	// Update the inventory quantity
	quantity, err := strconv.Atoi(formData.Fields["quantity"][0])
	if err != nil {
		tx.Rollback()
		utils.WriteError(w, http.StatusBadRequest, fmt.Errorf("invalid quantity: %w", err))
		return
	}
	oldVariant.Inventory.Quantity = uint(quantity)

	// Save the updated variant
	result = tx.Save(&oldVariant)
	if result.Error != nil {
		tx.Rollback()
		utils.WriteError(w, http.StatusInternalServerError, result.Error)
		return
	}

	existingImageIDs := make(map[uint]bool)

	// Check if "existingImages" field exists and is not empty
	existingImagesStr := formData.Fields["existingImages"]
	fmt.Println("These are the strings: \n\n\n\\")
	fmt.Print(existingImagesStr)
	// Split the string into individual image IDs

	for _, imageIDStr := range existingImagesStr {
		imageID, err := strconv.Atoi(imageIDStr)
		if err != nil {
			tx.Rollback()
			utils.WriteError(w, http.StatusBadRequest, fmt.Errorf("invalid image ID: %w", err))
			return
		}
		existingImageIDs[uint(imageID)] = true
	}

	// Remove images that are no longer part of the existingImages array
	for _, image := range oldVariant.Images {
		if !existingImageIDs[image.ID] {
			result := tx.Delete(&image)
			if result.Error != nil {
				tx.Rollback()
				utils.WriteError(w, http.StatusInternalServerError, result.Error)
				return
			}
		}
	}

	// Handle new images
	for _, fileHeader := range formData.Files {
		var imagePayload models.Image
		imagePayload.ImagePath, err = utils.SaveUploadedFile(fileHeader, uploadDirectory)
		if err != nil {
			tx.Rollback()
			utils.WriteError(w, http.StatusInternalServerError, err)
			return
		}
		imagePayload.VariantID = &oldVariant.ID

		result = tx.Create(&imagePayload)
		if result.Error != nil {
			tx.Rollback()
			utils.WriteError(w, http.StatusInternalServerError, result.Error)
			return
		}
	}

	// Commit the transaction
	result = tx.Commit()
	if result.Error != nil {
		utils.WriteError(w, http.StatusInternalServerError, result.Error)
		return
	}

	// Fetch the updated variant with its images and inventory
	var updatedVariant models.Variant
	result = db.DB.DB.
		Preload("Images").
		Preload("Inventory").
		First(&updatedVariant, oldVariant.ID)

	if result.Error != nil {
		utils.WriteError(w, http.StatusInternalServerError, result.Error)
		return
	}

	// Return the updated variant
	utils.WriteJson(w, http.StatusOK, map[string]interface{}{
		"message": "Variant updated successfully",
		"variant": updatedVariant,
	})
}
