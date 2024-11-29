package models

import (
	"gorm.io/gorm"
)

type User struct {
	gorm.Model
	Username string `json:"username" gorm:"type:varchar(100);not null"`
	Email    string `json:"email" gorm:"type:varchar(100);not null;unique"`
	Password string `json:"password" gorm:"type:text;not null"`
	IsAdmin  bool   `json:"is_admin" gorm:"default:false"`
}

type Category struct {
	gorm.Model
	Name        string    `json:"name" gorm:"type:varchar(100); not null"`
	Description string    `json:"description" gorm:"type:text"`
	Products    []Product `json:"products" gorm:"foreingKey:CategoryID"`
}

type Manufacturer struct {
	gorm.Model
	Name string `json:"name" gorm:"type:varchar(100); not null; unique"`
}

type Image struct {
	gorm.Model
	ProductID uint   `json:"product_id"`
	ImagePath string `json:"name" gorm:"type:text; not null"`
}

type Product struct {
	gorm.Model
	Name           string       `json:"name" gorm:"type:varchar(100);not null"`
	Description    string       `json:"description" gorm:"type:text"`
	Price          float64      `json:"price" gorm:"type:decimal(10,2);not null"`
	Stock          uint         `json:"stock" gorm:"type:int; not null"`
	CategoryID     uint         `json:"category_id"`
	Category       Category     `json:"category" gorm:"constraint:OnUpdate:CASCADE,OnDelete:SET NULL"`
	ManufacturerID uint         `json:"manufacturer_id"`
	Manufacturer   Manufacturer `json:"manufacturer" gorm:"constraint:OnUpdate:CASCADE,OnDelete:SET NULL;"`
	Images         []Image      `json:"images" gorm:"foreignKey:ProductID"`
}

type Address struct {
	gorm.Model
	UserID     uint   `json:"user_id"`
	User       User   `json:"user" gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	Street     string `json:"street" gorm:"type:varchar(255);not null"`
	City       string `json:"city" gorm:"type:varchar(100);not null"`
	State      string `json:"state" gorm:"type:varchar(100);not null"`
	PostalCode string `json:"postal_code" gorm:"type:varchar(20);not null"`
	Country    string `json:"country" gorm:"type:varchar(100);not null"`
}

type OrderItem struct {
	gorm.Model
	Order     Order   `json:"order" gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	OrderID   uint    `json:"order_id"`
	ProductID uint    `json:"product_id"`
	Product   Product `json:"product" gorm:"constraint:OnUpdate:CASCADE,OnDelete:SET NULL;"`
	Quantity  int     `json:"quantity" gorm:"type:int;not null"`
	Price     float64 `json:"price" gorm:"type:decimal(10,2);not null"`
}

type Order struct {
	gorm.Model
	UserID     uint        `json:"user_id"`
	User       User        `json:"user" gorm:"constraint:OnUpdate:CASCADE,OnDelete:SET NULL;"`
	Total      float64     `json:"total" gorm:"type:decimal(10,2);not null"`
	Status     string      `json:"status" gorm:"type:varchar(50);not null;default:'Pending'"`
	OrderItems []OrderItem `json:"order_items" gorm:"foreignKey:OrderID"`
	AddressID  uint        `json:"address_id"`
	Address    Address     `json:"address" gorm:"constraint:OnUpdate:CASCADE,OnDelete:SET NULL;"`
}

type CartItem struct {
	gorm.Model
	UserID    uint    `json:"user_id"`
	User      User    `json:"user" gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	ProductID uint    `json:"product_id"`
	Product   Product `json:"product" gorm:"constraint:OnUpdate:CASCADE,OnDelete:SET NULL;"`
	Quantity  int     `json:"quantity" gorm:"type:int;not null"`
}
