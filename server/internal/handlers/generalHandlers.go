package handlers

import (
	"net/http"

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

func (h *GeneralHandler) GetCategories(w http.ResponseWriter, _ *http.Request) {
	var categories []models.Category
	result := db.DB.DB.Find(&categories)
	if result.Error != nil {
		utils.WriteError(w, http.StatusInternalServerError, result.Error)
		return
	}

	utils.WriteJson(w, http.StatusOK, map[string]interface{}{
		"message":    "Successfully fetched results",
		"categories": categories,
	})
}

func (h *GeneralHandler) GetManufacturers(w http.ResponseWriter, _ *http.Request) {
	var manufacturers []models.Manufacturer
	result := db.DB.DB.Find(&manufacturers)
	if result.Error != nil {
		utils.WriteError(w, http.StatusInternalServerError, result.Error)
		return
	}

	utils.WriteJson(w, http.StatusOK, map[string]interface{}{
		"message":       "Successfully fetched results",
		"manufacturers": manufacturers,
	})
}

func (h *GeneralHandler) GetProducts(w http.ResponseWriter, _ *http.Request) {
	var products []models.Product
	result := db.DB.DB.Find(&products)
	if result.Error != nil {
		utils.WriteError(w, http.StatusInternalServerError, result.Error)
		return
	}

	utils.WriteJson(w, http.StatusOK, map[string]interface{}{
		"message":  "Successfully fetched results",
		"products": products,
	})
}

func (h *GeneralHandler) GetVariants(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	productID := vars["productID"]

	var variants []models.Variant
	result := db.DB.DB.Where("product_id = ?", productID).Find(&variants)
	if result.Error != nil {
		utils.WriteError(w, http.StatusInternalServerError, result.Error)
		return
	}

	utils.WriteJson(w, http.StatusOK, map[string]interface{}{
		"message":  "Successfully fetched results",
		"variants": variants,
	})
}
