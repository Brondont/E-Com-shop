package handlers

import (
	"errors"
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"github.com/Brondont/E-Com-shop/db"
	"github.com/Brondont/E-Com-shop/models"
	"github.com/Brondont/E-Com-shop/utils"
	"github.com/gorilla/mux"
)

type GeneralHandler struct {
	*Handler
}

func NewGeneralHandler() *GeneralHandler {
	return &GeneralHandler{
		Handler: NewHandler(),
	}
}

func (h *GeneralHandler) GetCategories(w http.ResponseWriter, r *http.Request) {
	count := r.URL.Query().Get("count")

	var categories []models.Category
	query := db.DB.DB.Preload("Image")

	// If count is provided, limit the number of results
	if count != "" {
		limit, err := strconv.Atoi(count)
		if err != nil {
			utils.WriteError(w, http.StatusBadRequest, fmt.Errorf("invalid count parameter"))
			return
		}
		query = query.Limit(limit)
	}

	result := query.Find(&categories)
	if result.Error != nil {
		utils.WriteError(w, http.StatusInternalServerError, errors.New("something went wrong with getting categories, try again"))
		return
	}

	utils.WriteJson(w, http.StatusOK, map[string]interface{}{
		"message":    "Successfully fetched results",
		"categories": categories,
	})
}

func (h *GeneralHandler) GetBrands(w http.ResponseWriter, r *http.Request) {
	count := r.URL.Query().Get("count")

	var brands []models.Brand
	query := db.DB.DB.Preload("Image")

	// If count is provided, limit the number of results
	if count != "" {
		limit, err := strconv.Atoi(count)
		if err != nil {
			utils.WriteError(w, http.StatusBadRequest, err)
			return
		}
		query = query.Limit(limit)
	}

	result := query.Find(&brands)
	if result.Error != nil {
		utils.WriteError(w, http.StatusInternalServerError, errors.New("something went wrong with getting brands, try again"))
		return
	}

	utils.WriteJson(w, http.StatusOK, map[string]interface{}{
		"message": "Successfully fetched results",
		"brands":  brands,
	})
}

func (h *GeneralHandler) GetProduct(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	productID := vars["productID"] // Get the productID from the URL

	var productPayload models.Product
	result := db.DB.DB.Preload("Variants").Preload("Variants.Images").Preload("Variants.Inventory").Preload("Image").Where("ID = ?", productID).Find(&productPayload)
	if result.Error != nil {
		utils.WriteError(w, http.StatusInternalServerError, errors.New("something went wrong with fetching products, try again"))
		return
	}

	utils.WriteJson(w, http.StatusOK, map[string]interface{}{
		"message": "Fetched product",
		"product": productPayload,
	})
}

func (h *GeneralHandler) GetProducts(w http.ResponseWriter, r *http.Request) {
	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
	search := r.URL.Query().Get("search")

	// Default values for pagination
	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 10 // Default page size
	}

	var products []models.Product
	var totalProducts int64

	// Calculate offset
	offset := (page - 1) * limit
	// Initialize the base query

	baseQuery := db.DB.DB.Model(&models.Product{}).Preload("Image").Preload("Category").Preload("Brand")

	// Apply search filter if provided
	if search != "" {
		searchPattern := "%" + strings.ToLower(search) + "%"
		baseQuery = baseQuery.Where(
			"LOWER(name) LIKE ?", searchPattern,
		)
	}

	// category
	categoriesIDs := r.URL.Query().Get("categoriesIDs")
	if categoriesIDs != "" {
		// Split the comma-separated string into a slice of strings
		categoryIDsStr := strings.Split(categoriesIDs, ",")
		var categoryIDs []int
		for _, idStr := range categoryIDsStr {
			id, err := strconv.Atoi(idStr)
			if err == nil {
				categoryIDs = append(categoryIDs, id)
			}
		}

		// Apply the filter if there are valid category IDs
		if len(categoryIDs) > 0 {
			baseQuery = baseQuery.Where("category_id IN ?", categoryIDs)
		}
	}

	// brand
	brandsIDs := r.URL.Query().Get("brandsIDs")
	if brandsIDs != "" {
		// Split the comma-separated string into a slice of strings
		brandIDsStr := strings.Split(brandsIDs, ",")
		var brandIDs []int
		for _, idStr := range brandIDsStr {
			id, err := strconv.Atoi(idStr)
			if err == nil {
				brandIDs = append(brandIDs, id)
			}
		}

		// Apply the filter if there are valid brand IDs
		if len(brandIDs) > 0 {
			baseQuery = baseQuery.Where("brand_id IN ?", brandIDs)
		}
	}

	// Fetch total number of products
	db.DB.DB.Model(&models.Product{}).Count(&totalProducts)

	// Fetch paginated products
	result := baseQuery.Offset(offset).Limit(limit).Find(&products)
	if result.Error != nil {
		utils.WriteError(w, http.StatusInternalServerError, errors.New("something went wrong with getting products, try again"))
		return
	}

	// Calculate total pages
	totalPages := int(totalProducts) / limit
	if int(totalProducts)%limit != 0 {
		totalPages++
	}

	// Return response
	utils.WriteJson(w, http.StatusOK, map[string]interface{}{
		"message":      "Successfully fetched results",
		"products":     products,
		"currentPage":  page,
		"totalPages":   totalPages,
		"totalItems":   totalProducts,
		"itemsPerPage": limit,
	})
}

func (h *GeneralHandler) GetVariants(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	productID := vars["productID"] // Get the productID from the URL

	count := r.URL.Query().Get("count") // Get the count query parameter

	var variants []models.Variant
	query := db.DB.DB.Preload("Images").Preload("Inventory").Where("product_id = ?", productID)

	// If count is provided, limit the number of results
	if count != "" {
		limit, err := strconv.Atoi(count)
		if err != nil {
			utils.WriteError(w, http.StatusBadRequest, fmt.Errorf("invalid count parameter"))
			return
		}
		query = query.Limit(limit)
	}

	result := query.Find(&variants)
	if result.Error != nil {
		utils.WriteError(w, http.StatusInternalServerError, errors.New("something went wrong with getting variants, try again"))
		return
	}

	utils.WriteJson(w, http.StatusOK, map[string]interface{}{
		"message":  "Successfully fetched results",
		"variants": variants,
	})
}
