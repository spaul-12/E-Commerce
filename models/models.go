package models

import (
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/lib/pq"
	"gorm.io/gorm"
)

//Get Current Date & time in string format
func GetTimeNow() string {
	currenttime := time.Now()
	t := fmt.Sprintf("%d-%d-%d %d:%d:%d", currenttime.Year(), currenttime.Month(), currenttime.Day(), currenttime.Hour(), currenttime.Minute(), currenttime.Second())
	return t
}

// GenerateISOString generates a time string equivalent to Date.now().toISOString in JavaScript
func GenerateISOString() string {
	return time.Now().UTC().Format("2006-01-02T15:04:05.999Z07:00")
}

// Base contains common columns for all tables
type Base struct {
	ID        uint      `gorm:"primaryKey"`
	UUID      uuid.UUID `json:"_id" gorm:"primaryKey;autoIncrement:false"`
	CreatedAt string    `json:"created_at"`
	UpdatedAt string    `json:"updated_at"`
}

// BeforeCreate will set Base struct before every insert
func (base *Base) BeforeCreate(tx *gorm.DB) error {
	// uuid.New() creates a new random UUID or panics.
	base.UUID = uuid.New()

	// generate timestamps
	t := GenerateISOString()
	base.CreatedAt, base.UpdatedAt = t, t

	return nil
}

// AfterUpdate will update the Base struct after every update
func (base *Base) AfterUpdate(tx *gorm.DB) error {
	// update timestamps
	base.UpdatedAt = GenerateISOString()
	return nil
}

//stock model
type BookStock struct {
	Bookid   uint32
	Bookname string
	Catagory pq.StringArray `gorm:"type:text[]"`
	Quantity uint32
	Price    uint64
}

//Item contains the common structure of each book purchased by user
type Item struct {
	User            string `json:"username"`
	OrderID         uuid.UUID
	Bookid          uint32 `json:"bookid"`
	Bookname        string `json:"bookname"`
	Time            string `json:"time"`
	Quantity        uint32 `json:"quantity"`
	Totalprice      uint64 `json:"price"`
	ShippingAddress string
	PaymentMethod   string
}

//cart model
type Cart struct {
	User       string `json:"username"`
	Bookid     uint32 `json:"bookid"`
	Bookname   string `json:"bookname"`
	Time       string `json:"time"`
	Quantity   uint32 `json:"quantity"`
	Totalprice uint64 `json:"price"`
}
