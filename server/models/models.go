package models

import (
	"time"

	"gorm.io/gorm"
)

type User struct {
	gorm.Model
	Username    string `json:"username" gorm:"type:varchar(100);not null"`
	Email       string `json:"email" gorm:"type:varchar(100);not null;unique"`
	Password    string `json:"password" gorm:"type:text;not null"`
	PhoneNumber string `json:"phoneNumber" gorm:"type:varchar(100);unique"`
	IsAdmin     bool   `json:"isAdmin" gorm:"default:false"`
}

type Category struct {
	gorm.Model
	Name        string    `json:"name" gorm:"type:varchar(100); not null"`
	Description string    `json:"description" gorm:"type:text"`
	Products    []Product `json:"products" gorm:"foreingKey:CategoryID"`
	Image       Image     `json:"image" gorm:"foreignKey:CategoryID"`
}

type Manufacturer struct {
	gorm.Model
	Name        string    `json:"name" gorm:"type:varchar(100); not null; unique"`
	Description string    `json:"description" gorm:"type:text; not null"`
	Products    []Product `json:"products" gorm:"foreignKey:ManufacturerID"`
	Image       Image     `json:"image" gorm:"foreignKey:ManufacturerID"`
}

type Image struct {
	gorm.Model
	VariantID      *uint  `json:"variantID" gorm:"index"`
	ProductID      *uint  `json:"productID,omitempty" gorm:"index"`
	ManufacturerID *uint  `json:"manufacturerID" gorm:"index"`
	BrandID        *uint  `json:"brandID,omitempty" gorm:"index"`
	CategoryID     *uint  `json:"categoryID,omitempty" gorm:"index"`
	ImagePath      string `json:"imagePath" gorm:"type:text;not null"`
}

type Product struct {
	gorm.Model
	Name           string       `json:"name" gorm:"type:varchar(100);not null"`
	Description    string       `json:"description" gorm:"type:text"`
	CategoryID     uint         `json:"categoryID"`
	Category       Category     `json:"category" gorm:"constraint:OnUpdate:CASCADE,OnDelete:SET NULL"`
	ManufacturerID uint         `json:"manufacturerID"`
	Manufacturer   Manufacturer `json:"manufacturer" gorm:"constraint:OnUpdate:CASCADE,OnDelete:SET NULL"`
	Image          Image        `json:"image" gorm:"foreignKey:ProductID"`
	Variants       []Variant    `json:"variants" gorm:"foreignKey:ProductID"`
}

type Variant struct {
	gorm.Model
	ProductID   uint      `json:"productID"`
	Name        string    `json:"name" gorm:"type:varchar(100);not null"`
	Description string    `json:"description" gorm:"type:text"`
	Price       float64   `json:"price" gorm:"type:decimal(10,2);not null"`
	ModelUrl    string    `json:"modelURL" gorm:"type:text"`
	Images      []Image   `json:"images" gorm:"foreignKey:VariantID"`
	Inventory   Inventory `json:"inventory" gorm:"foreignKey:VariantID"`
	Product     Product   `json:"product" gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
}

type Inventory struct {
	gorm.Model
	VariantID   uint      `json:"variantID"`
	Quantity    uint      `json:"quantity" gorm:"type:int;not null"`
	LastUpdated time.Time `json:"lastUpdated" gorm:"autoUpdateTime"`
}

type Address struct {
	gorm.Model
	UserID     uint   `json:"userID"`
	User       User   `json:"user" gorm:"constraint:OnDelete:CASCADE;"`
	Street1    string `json:"street1" gorm:"type:varchar(255);not null"`
	Street2    string `json:"street2" gorm:"type:varchar(255)"`
	City       string `json:"city" gorm:"type:varchar(100);not null"`
	State      string `json:"state" gorm:"type:varchar(100);not null"`
	PostalCode string `json:"postalCode" gorm:"type:varchar(20);not null"`
	Country    string `json:"country" gorm:"type:varchar(100);not null"`
}

type OrderItem struct {
	gorm.Model
	Order     Order   `json:"order" gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	OrderID   uint    `json:"orderID"`
	VariantID uint    `json:"variantID"`
	Variant   Variant `json:"variant" gorm:"constraint:OnDelete:CASCADE"`
	Quantity  int     `json:"quantity" gorm:"type:int;not null"`
	Price     float64 `json:"price" gorm:"type:decimal(10,2);not null"`
}

type Order struct {
	gorm.Model
	UserID     uint        `json:"userID"`
	User       User        `json:"user" gorm:"constraint:OnUpdate:CASCADE,OnDelete:SET NULL;"`
	Total      float64     `json:"total" gorm:"type:decimal(10,2);not null"`
	Status     string      `json:"status" gorm:"type:varchar(50);not null;default:'Pending'"`
	OrderItems []OrderItem `json:"orderItems" gorm:"foreignKey:OrderID"`
	AddressID  uint        `json:"addressID"`
	Address    Address     `json:"address" gorm:"constraint:OnUpdate:CASCADE,OnDelete:SET NULL;"`
}

type CartItem struct {
	gorm.Model
	UserID    uint    `json:"userID" gorm:"constraint:OnDelete:CASCADE"`
	VariantID uint    `json:"variantID" gorm:"constraint:OnDelete:CASCADE"`
	Variant   Variant `json:"variant" gorm:"constraint:OnUpdate:CASCADE,OnDelete:SET NULL;"`
	Quantity  uint    `json:"quantity" gorm:"type:int;not null"`
}
