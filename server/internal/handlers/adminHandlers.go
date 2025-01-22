package handlers

import (
	"errors"
	"fmt"
	"math"
	"net/http"
	"strconv"

	"github.com/Brondont/E-Com-shop/db"
	"github.com/Brondont/E-Com-shop/models"
	"github.com/Brondont/E-Com-shop/utils"
	"github.com/gorilla/mux"
)

const (
	maxFileSize          = 10 << 20 // 10MB
	modelUploadDirectory = "/public/models"
	uploadDirectory      = "/public/images"
)

type AdminHandler struct {
	*Handler
}

func NewAdminHandler() *AdminHandler {
	return &AdminHandler{
		Handler: NewHandler(),
	}
}

// ======================
// User Management
// ======================

func (h *AdminHandler) GetUsers(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query()
	page, _ := strconv.Atoi(query.Get("page"))
	limit, _ := strconv.Atoi(query.Get("limit"))
	search := query.Get("search")

	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 10
	}

	offset := (page - 1) * limit

	baseQuery := db.DB.DB.Model(&models.User{}).Select(
		"id", "email", "username", "created_at", "phone_number", "is_admin",
	)

	if search != "" {
		searchPattern := "%" + search + "%"
		baseQuery = baseQuery.Where(
			"username LIKE ? OR email LIKE ? OR phone_number LIKE ?",
			searchPattern, searchPattern, searchPattern,
		)
	}

	var total int64
	if err := baseQuery.Count(&total).Error; err != nil {
		utils.WriteError(w, http.StatusInternalServerError, errors.New("error counting users"))
		return
	}

	var users []models.User
	result := baseQuery.Limit(limit).Offset(offset).Find(&users)
	if result.Error != nil {
		utils.WriteError(w, http.StatusInternalServerError, errors.New("error fetching users"))
		return
	}

	totalPages := int(math.Ceil(float64(total) / float64(limit)))

	response := map[string]interface{}{
		"users": users,
		"pagination": map[string]interface{}{
			"currentPage":  page,
			"totalPages":   totalPages,
			"totalItems":   total,
			"itemsPerPage": limit,
		},
	}

	utils.WriteJson(w, http.StatusOK, response)
}

func (h *AdminHandler) DeleteUser(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	userID := vars["userID"]

	if userID == "" {
		utils.WriteError(w, http.StatusBadRequest, errors.New("user id is missing in the url"))
		return
	}

	result := db.DB.DB.Where("id = ?", userID).Delete(&models.User{})
	if result.Error != nil {
		utils.WriteError(w, http.StatusInternalServerError, result.Error)
		return
	}

	utils.WriteJson(w, http.StatusOK, map[string]interface{}{
		"message": "User was deleted.",
	})
}

// ======================
// Category Management
// ======================

func (h *AdminHandler) PostCategory(w http.ResponseWriter, r *http.Request) {
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

	result = tx.Commit()
	if result.Error != nil {
		utils.WriteError(w, http.StatusInternalServerError, result.Error)
		return
	}

	var updatedCategory models.Category
	result = db.DB.DB.Preload("Image").First(&updatedCategory, categoryPayload.ID)
	if result.Error != nil {
		utils.WriteError(w, http.StatusInternalServerError, result.Error)
		return
	}

	utils.WriteJson(w, http.StatusCreated, map[string]interface{}{
		"message":  "Category created successfully",
		"category": updatedCategory,
	})
}

func (h *AdminHandler) PutCategory(w http.ResponseWriter, r *http.Request) {
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

	categoryID, err := strconv.Atoi(formData.Fields["ID"][0])
	if err != nil {
		tx.Rollback()
		utils.WriteError(w, http.StatusBadRequest, fmt.Errorf("invalid category ID: %w", err))
		return
	}

	var oldCategory models.Category
	result := tx.Preload("Image").First(&oldCategory, categoryID)
	if result.Error != nil {
		tx.Rollback()
		utils.WriteError(w, http.StatusNotFound, fmt.Errorf("category not found: %w", result.Error))
		return
	}

	oldCategory.Name = formData.Fields["name"][0]
	oldCategory.Description = formData.Fields["description"][0]

	result = tx.Save(&oldCategory)
	if result.Error != nil {
		tx.Rollback()
		utils.WriteError(w, http.StatusInternalServerError, result.Error)
		return
	}

	if formData.File != nil {
		var imagePayload models.Image
		imagePayload.ImagePath, err = utils.SaveUploadedFile(formData.File, uploadDirectory)
		if err != nil {
			tx.Rollback()
			utils.WriteError(w, http.StatusInternalServerError, err)
			return
		}
		imagePayload.CategoryID = &oldCategory.ID

		result := tx.Delete(&models.Image{}, "category_id = ?", oldCategory.ID)
		if result.Error != nil {
			tx.Rollback()
			utils.WriteError(w, http.StatusInternalServerError, result.Error)
			return
		}

		result = tx.Create(&imagePayload)
		if result.Error != nil {
			tx.Rollback()
			utils.WriteError(w, http.StatusInternalServerError, result.Error)
			return
		}
	}

	result = tx.Commit()
	if result.Error != nil {
		utils.WriteError(w, http.StatusInternalServerError, result.Error)
		return
	}

	var updatedCategory models.Category
	result = db.DB.DB.Preload("Image").First(&updatedCategory, oldCategory.ID)
	if result.Error != nil {
		utils.WriteError(w, http.StatusInternalServerError, result.Error)
		return
	}

	utils.WriteJson(w, http.StatusOK, map[string]interface{}{
		"message":  "Category updated successfully",
		"category": updatedCategory,
	})
}

func (h *AdminHandler) DeleteCategory(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	categoryID := vars["categoryID"]

	if categoryID == "" {
		utils.WriteError(w, http.StatusBadRequest, errors.New("category id is missing in the url"))
		return
	}

	result := db.DB.DB.Where("id = ?", categoryID).Delete(&models.Category{})
	if result.Error != nil {
		utils.WriteError(w, http.StatusInternalServerError, result.Error)
		return
	}

	utils.WriteJson(w, http.StatusOK, map[string]interface{}{
		"message": "Category was deleted.",
	})
}

// ======================
// Brand Management
// ======================
func (h *AdminHandler) PostBrand(w http.ResponseWriter, r *http.Request) {
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

	var brandPayload models.Brand
	brandPayload.Name = formData.Fields["name"][0]
	brandPayload.Description = formData.Fields["description"][0]

	if brandPayload.Name == "" || brandPayload.Description == "" {
		tx.Rollback()
		err := errors.New("form fields unprovided")
		utils.WriteError(w, http.StatusConflict, err)
		return
	}

	result := tx.Create(&brandPayload)
	if result.Error != nil {
		tx.Rollback()
		utils.WriteError(w, http.StatusInternalServerError, result.Error)
		return
	}

	var imagePayload models.Image
	imagePayload.ImagePath, err = utils.SaveUploadedFile(formData.File, uploadDirectory)
	if err != nil {
		tx.Rollback()
		utils.WriteError(w, http.StatusInternalServerError, err)
		return
	}
	imagePayload.BrandID = &brandPayload.ID

	result = tx.Create(&imagePayload)
	if result.Error != nil {
		tx.Rollback()
		utils.WriteError(w, http.StatusInternalServerError, result.Error)
		return
	}

	result = tx.Commit()
	if result.Error != nil {
		utils.WriteError(w, http.StatusInternalServerError, result.Error)
		return
	}

	var updatedBrand models.Brand
	result = db.DB.DB.Preload("Image").First(&updatedBrand, brandPayload.ID)
	if result.Error != nil {
		utils.WriteError(w, http.StatusInternalServerError, result.Error)
		return
	}

	utils.WriteJson(w, http.StatusCreated, map[string]interface{}{
		"message": "Brand created successfully",
		"brand":   updatedBrand,
	})
}

func (h *AdminHandler) PutBrand(w http.ResponseWriter, r *http.Request) {
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

	brandID, err := strconv.Atoi(formData.Fields["ID"][0])
	if err != nil {
		tx.Rollback()
		utils.WriteError(w, http.StatusBadRequest, fmt.Errorf("invalid brand ID: %w", err))
		return
	}

	var oldBrand models.Brand
	result := tx.Preload("Image").First(&oldBrand, brandID)
	if result.Error != nil {
		tx.Rollback()
		utils.WriteError(w, http.StatusNotFound, fmt.Errorf("brand not found: %w", result.Error))
		return
	}

	oldBrand.Name = formData.Fields["name"][0]
	oldBrand.Description = formData.Fields["description"][0]

	result = tx.Save(&oldBrand)
	if result.Error != nil {
		tx.Rollback()
		utils.WriteError(w, http.StatusInternalServerError, result.Error)
		return
	}

	if formData.File != nil {
		var imagePayload models.Image
		imagePayload.ImagePath, err = utils.SaveUploadedFile(formData.File, uploadDirectory)
		if err != nil {
			tx.Rollback()
			utils.WriteError(w, http.StatusInternalServerError, err)
			return
		}
		imagePayload.BrandID = &oldBrand.ID

		result := tx.Delete(&models.Image{}, "brand_id = ?", oldBrand.ID)
		if result.Error != nil {
			tx.Rollback()
			utils.WriteError(w, http.StatusInternalServerError, result.Error)
			return
		}

		result = tx.Create(&imagePayload)
		if result.Error != nil {
			tx.Rollback()
			utils.WriteError(w, http.StatusInternalServerError, result.Error)
			return
		}
	}

	result = tx.Commit()
	if result.Error != nil {
		utils.WriteError(w, http.StatusInternalServerError, result.Error)
		return
	}

	var updatedBrand models.Brand
	result = db.DB.DB.Preload("Image").First(&updatedBrand, oldBrand.ID)
	if result.Error != nil {
		utils.WriteError(w, http.StatusInternalServerError, result.Error)
		return
	}

	utils.WriteJson(w, http.StatusOK, map[string]interface{}{
		"message": "Brand updated successfully",
		"brand":   updatedBrand,
	})
}

func (h *AdminHandler) DeleteBrand(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	brandID := vars["brandID"]

	if brandID == "" {
		utils.WriteError(w, http.StatusBadRequest, errors.New("brand id is missing in the url"))
		return
	}

	result := db.DB.DB.Where("id = ?", brandID).Delete(&models.Brand{})
	if result.Error != nil {
		utils.WriteError(w, http.StatusInternalServerError, result.Error)
		return
	}

	utils.WriteJson(w, http.StatusOK, map[string]interface{}{
		"message": "Brand was deleted.",
	})
}

// ======================
// Product Management
// ======================

func (h *AdminHandler) PostProduct(w http.ResponseWriter, r *http.Request) {
	_, ok := r.Context().Value("userID").(int)
	if !ok {
		utils.WriteError(w, http.StatusUnauthorized, errors.New("unauthorized access"))
		return
	}

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
	brandID, err := strconv.Atoi(formData.Fields["brandID"][0])
	if err != nil {
		tx.Rollback()
		utils.WriteError(w, http.StatusInternalServerError, err)
		return
	}
	productPayload.BrandID = uint(brandID)

	result := tx.Create(&productPayload)
	if result.Error != nil {
		tx.Rollback()
		utils.WriteError(w, http.StatusInternalServerError, result.Error)
		return
	}

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

	result = tx.Commit()
	if result.Error != nil {
		utils.WriteError(w, http.StatusInternalServerError, result.Error)
		return
	}

	var updatedProduct models.Product
	result = db.DB.DB.Preload("Image").First(&updatedProduct, productPayload.ID)
	if result.Error != nil {
		utils.WriteError(w, http.StatusInternalServerError, result.Error)
		return
	}

	utils.WriteJson(w, http.StatusCreated, map[string]interface{}{
		"message": "Product created successfully",
		"product": updatedProduct,
	})
}

func (h *AdminHandler) PutProduct(w http.ResponseWriter, r *http.Request) {
	formData, err := utils.ParseMultipartForm(r, maxFileSize)
	if err != nil {
		utils.WriteError(w, http.StatusBadRequest, err)
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

	productID, err := strconv.Atoi(formData.Fields["productID"][0])
	if err != nil {
		tx.Rollback()
		utils.WriteError(w, http.StatusBadRequest, fmt.Errorf("invalid product ID: %w", err))
		return
	}

	var oldProduct models.Product
	result := tx.Preload("Image").First(&oldProduct, productID)
	if result.Error != nil {
		tx.Rollback()
		utils.WriteError(w, http.StatusNotFound, fmt.Errorf("product not found: %w", result.Error))
		return
	}

	oldProduct.Name = formData.Fields["name"][0]
	oldProduct.Description = formData.Fields["description"][0]

	categoryIDInt, err := strconv.Atoi(formData.Fields["categoryID"][0])
	if err != nil {
		tx.Rollback()
		utils.WriteError(w, http.StatusInternalServerError, err)
		return
	}
	oldProduct.CategoryID = uint(categoryIDInt)
	brandID, err := strconv.Atoi(formData.Fields["brandID"][0])
	if err != nil {
		tx.Rollback()
		utils.WriteError(w, http.StatusInternalServerError, err)
		return
	}
	oldProduct.BrandID = uint(brandID)

	result = tx.Save(&oldProduct)
	if result.Error != nil {
		tx.Rollback()
		utils.WriteError(w, http.StatusInternalServerError, result.Error)
		return
	}

	if formData.File != nil {
		var imagePayload models.Image
		imagePayload.ImagePath, err = utils.SaveUploadedFile(formData.File, uploadDirectory)
		if err != nil {
			tx.Rollback()
			utils.WriteError(w, http.StatusInternalServerError, err)
			return
		}
		imagePayload.ProductID = &oldProduct.ID

		result := tx.Delete(&models.Image{}, "product_id = ?", oldProduct.ID)
		if result.Error != nil {
			tx.Rollback()
			utils.WriteError(w, http.StatusInternalServerError, result.Error)
			return
		}

		result = tx.Create(&imagePayload)
		if result.Error != nil {
			tx.Rollback()
			utils.WriteError(w, http.StatusInternalServerError, result.Error)
			return
		}
	}

	result = tx.Commit()
	if result.Error != nil {
		utils.WriteError(w, http.StatusInternalServerError, result.Error)
		return
	}

	var updatedProduct models.Product
	result = db.DB.DB.Preload("Image").First(&updatedProduct, oldProduct.ID)
	if result.Error != nil {
		utils.WriteError(w, http.StatusInternalServerError, result.Error)
		return
	}

	utils.WriteJson(w, http.StatusOK, map[string]interface{}{
		"message": "Product updated successfully",
		"product": updatedProduct,
	})
}

func (h *AdminHandler) DeleteProduct(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	productID := vars["productID"]

	if productID == "" {
		utils.WriteError(w, http.StatusBadRequest, errors.New("product id is missing in the url"))
		return
	}

	result := db.DB.DB.Where("id = ?", productID).Delete(&models.Product{})
	if result.Error != nil {
		utils.WriteError(w, http.StatusInternalServerError, result.Error)
		return
	}

	utils.WriteJson(w, http.StatusOK, map[string]interface{}{
		"message": "Product was deleted.",
	})
}

// ======================
// Variant Management
// ======================

func (h *AdminHandler) PostVariant(w http.ResponseWriter, r *http.Request) {
	_, ok := r.Context().Value("userID").(int)
	if !ok {
		utils.WriteError(w, http.StatusUnauthorized, errors.New("unauthorized access"))
		return
	}

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

	if formData.Model != nil {
		modelPath, err := utils.SaveUploadedFile(formData.Model, modelUploadDirectory)
		if err != nil {
			tx.Rollback()
			utils.WriteError(w, http.StatusInternalServerError, err)
			return
		}
		variantPayload.ModelUrl = modelPath
	}

	result := tx.Create(&variantPayload)
	if result.Error != nil {
		tx.Rollback()
		utils.WriteError(w, http.StatusInternalServerError, result.Error)
		return
	}

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

	result = tx.Commit()
	if result.Error != nil {
		utils.WriteError(w, http.StatusInternalServerError, result.Error)
		return
	}

	var completeVariant models.Variant
	result = db.DB.DB.Preload("Images").Preload("Inventory").First(&completeVariant, variantPayload.ID)
	if result.Error != nil {
		utils.WriteError(w, http.StatusInternalServerError, result.Error)
		return
	}

	utils.WriteJson(w, http.StatusCreated, map[string]interface{}{
		"message": "Product created successfully",
		"variant": completeVariant,
	})
}

func (h *AdminHandler) DeleteVariant(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	variantID := vars["variantID"]

	result := db.DB.DB.Delete(&models.Variant{}, "id = ?", variantID)
	if result.Error != nil {
		utils.WriteError(w, http.StatusInternalServerError, result.Error)
		return
	}

	utils.WriteJson(w, http.StatusOK, map[string]interface{}{
		"message": "Variant deleted successfully",
	})
}

func (h *AdminHandler) PutVariant(w http.ResponseWriter, r *http.Request) {
	_, ok := r.Context().Value("userID").(int)
	if !ok {
		utils.WriteError(w, http.StatusUnauthorized, errors.New("unauthorized access"))
		return
	}

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

	variantID, err := strconv.Atoi(formData.Fields["variantID"][0])
	if err != nil {
		tx.Rollback()
		utils.WriteError(w, http.StatusBadRequest, fmt.Errorf("invalid variant ID: %w", err))
		return
	}

	var oldVariant models.Variant
	result := tx.Preload("Images").Preload("Inventory").First(&oldVariant, variantID)
	if result.Error != nil {
		tx.Rollback()
		utils.WriteError(w, http.StatusNotFound, fmt.Errorf("variant not found: %w", result.Error))
		return
	}

	oldVariant.Name = formData.Fields["name"][0]
	oldVariant.Description = formData.Fields["description"][0]
	priceFloat64, err := strconv.ParseFloat(formData.Fields["price"][0], 64)
	if err != nil {
		tx.Rollback()
		utils.WriteError(w, http.StatusBadRequest, fmt.Errorf("invalid price: %w", err))
		return
	}
	oldVariant.Price = priceFloat64

	quantity, err := strconv.Atoi(formData.Fields["quantity"][0])
	if err != nil {
		tx.Rollback()
		utils.WriteError(w, http.StatusBadRequest, fmt.Errorf("invalid quantity: %w", err))
		return
	}
	oldVariant.Inventory.Quantity = uint(quantity)

	if formData.Model != nil {
		modelPath, err := utils.SaveUploadedFile(formData.Model, modelUploadDirectory)
		if err != nil {
			tx.Rollback()
			utils.WriteError(w, http.StatusInternalServerError, err)
			return
		}
		oldVariant.ModelUrl = modelPath
	}

	result = tx.Save(&oldVariant)
	if result.Error != nil {
		tx.Rollback()
		utils.WriteError(w, http.StatusInternalServerError, result.Error)
		return
	}

	existingImageIDs := make(map[uint]bool)
	existingImagesStr := formData.Fields["existingImages"]

	for _, imageIDStr := range existingImagesStr {
		imageID, err := strconv.Atoi(imageIDStr)
		if err != nil {
			tx.Rollback()
			utils.WriteError(w, http.StatusBadRequest, fmt.Errorf("invalid image ID: %w", err))
			return
		}
		existingImageIDs[uint(imageID)] = true
	}

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

	result = tx.Commit()
	if result.Error != nil {
		utils.WriteError(w, http.StatusInternalServerError, result.Error)
		return
	}

	var updatedVariant models.Variant
	result = db.DB.DB.Preload("Images").Preload("Inventory").First(&updatedVariant, oldVariant.ID)
	if result.Error != nil {
		utils.WriteError(w, http.StatusInternalServerError, result.Error)
		return
	}

	utils.WriteJson(w, http.StatusOK, map[string]interface{}{
		"message": "Variant updated successfully",
		"variant": updatedVariant,
	})
}
