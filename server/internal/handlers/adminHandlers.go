package handlers

import (
	"errors"
	"fmt"
	"net/http"
	"strconv"

	"github.com/Brondont/E-Com-shop/db"
	"github.com/Brondont/E-Com-shop/models"
	"github.com/Brondont/E-Com-shop/utils"
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
	categoryPayload.Name = formData.Fields["name"]
	categoryPayload.Description = formData.Fields["description"]

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
	manufacturerPayload.Name = formData.Fields["name"]
	manufacturerPayload.Description = formData.Fields["description"]

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
	imagePayload.CategoryID = &manufacturerPayload.ID

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

func (h *AdminHandler) PostBaseProduct(w http.ResponseWriter, r *http.Request) {
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
	productPayload.Name = formData.Fields["name"]
	productPayload.Description = formData.Fields["description"]
	categoryIDInt, err := strconv.Atoi(formData.Fields["categoryID"])
	if err != nil {
		tx.Rollback()
		utils.WriteError(w, http.StatusInternalServerError, err)
		return
	}
	productPayload.CategoryID = uint(categoryIDInt)
	manufacturerID, err := strconv.Atoi(formData.Fields["manufacturerID"])
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
	imagePayload.CategoryID = &productPayload.ID

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
	variantPayload.Name = formData.Fields["name"]
	variantPayload.Description = formData.Fields["description"]
	priceFloat64, err := strconv.ParseFloat(formData.Fields["price"], 64)
	if err != nil {
		tx.Rollback()
		utils.WriteError(w, http.StatusInternalServerError, err)
		return
	}
	variantPayload.Price = priceFloat64
	productIDInt, err := strconv.Atoi(formData.Fields["productID"])
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
		imagePayload.CategoryID = &variantPayload.ID

		result = tx.Create(&imagePayload)
		if result.Error != nil {
			tx.Rollback()
			utils.WriteError(w, http.StatusInternalServerError, result.Error)
			return
		}

	}

	// handle inventory creation
	quantity, err := strconv.Atoi(formData.Fields["quantity"])
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

	utils.WriteJson(w, http.StatusCreated, map[string]interface{}{
		"message": "Product created succesfully",
		"variant": variantPayload,
	})
}
