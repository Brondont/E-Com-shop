package handlers

import (
	"fmt"
	"net/http"
	"strconv"

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
		utils.WriteError(w, http.StatusInternalServerError, result.Error)
		return
	}

	utils.WriteJson(w, http.StatusOK, map[string]interface{}{
		"message":    "Successfully fetched results",
		"categories": categories,
	})
}

func (h *GeneralHandler) GetManufacturers(w http.ResponseWriter, r *http.Request) {
	count := r.URL.Query().Get("count")

	var manufacturers []models.Manufacturer
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

	result := query.Find(&manufacturers)
	if result.Error != nil {
		utils.WriteError(w, http.StatusInternalServerError, result.Error)
		return
	}

	utils.WriteJson(w, http.StatusOK, map[string]interface{}{
		"message":       "Successfully fetched results",
		"manufacturers": manufacturers,
	})
}

func (h *GeneralHandler) GetProduct(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	productID := vars["productID"] // Get the productID from the URL

	var productPayload models.Product
	result := db.DB.DB.Preload("Variants").Preload("Variants.Images").Preload("Variants.Inventory").Preload("Image").Where("ID = ?", productID).Find(&productPayload)
	if result.Error != nil {
		utils.WriteError(w, http.StatusInternalServerError, result.Error)
		return
	}

	utils.WriteJson(w, http.StatusOK, map[string]interface{}{
		"message": "Fetched product",
		"product": productPayload,
	})
}

func (h *GeneralHandler) GetProducts(w http.ResponseWriter, r *http.Request) {
	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	pageItemCount, _ := strconv.Atoi(r.URL.Query().Get("pageItemCount"))

	// Default values for pagination
	if page < 1 {
		page = 1
	}
	if pageItemCount < 1 {
		pageItemCount = 10 // Default page size
	}

	var products []models.Product
	var totalProducts int64

	// Calculate offset
	offset := (page - 1) * pageItemCount

	// Fetch total number of products
	db.DB.DB.Model(&models.Product{}).Count(&totalProducts)

	// Fetch paginated products
	result := db.DB.DB.Preload("Image").Preload("Category").Preload("Manufacturer").
		Offset(offset).Limit(pageItemCount).Find(&products)
	if result.Error != nil {
		utils.WriteError(w, http.StatusInternalServerError, result.Error)
		return
	}

	// Calculate total pages
	totalPages := int(totalProducts) / pageItemCount
	if int(totalProducts)%pageItemCount != 0 {
		totalPages++
	}

	// Return response
	utils.WriteJson(w, http.StatusOK, map[string]interface{}{
		"message":      "Successfully fetched results",
		"products":     products,
		"currentPage":  page,
		"totalPages":   totalPages,
		"totalItems":   totalProducts,
		"itemsPerPage": pageItemCount,
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
		utils.WriteError(w, http.StatusInternalServerError, result.Error)
		return
	}

	utils.WriteJson(w, http.StatusOK, map[string]interface{}{
		"message":  "Successfully fetched results",
		"variants": variants,
	})
}
