package models

import (
	"time"

	"github.com/google/uuid"
)

type CostEntry struct {
	ID          uuid.UUID `json:"id"`
	BuildingID  uuid.UUID `json:"building_id"`
	Phase       string    `json:"phase"`
	Category    string    `json:"category"`
	Amount      float64   `json:"amount"`
	Description string    `json:"description"`
	Date        time.Time `json:"date"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type ChartDataPoint struct {
	Month       string  `json:"month"`
	CapexBudget float64 `json:"capex_budget"`
	CapexActual float64 `json:"capex_actual"`
	OpexBudget  float64 `json:"opex_budget"`
	OpexActual  float64 `json:"opex_actual"`
}

type MaintenanceTask struct {
	ID                uuid.UUID `json:"id"`
	PropertyID        uuid.UUID `json:"property_id"`
	Component         string    `json:"component"`
	Status            string    `json:"status"`
	TargetDate        time.Time `json:"target_date"`
	Contractor        string    `json:"contractor"`
	Amount            float64   `json:"amount"`
	Phone             string    `json:"phone"`
	CheckoutRequestID *string   `json:"checkout_request_id,omitempty"`
}

type MpesaTransaction struct {
	ID                uuid.UUID `json:"id"`
	TaskID            uuid.UUID `json:"task_id"`
	MerchantRequestID string    `json:"merchant_request_id"`
	CheckoutRequestID string    `json:"checkout_request_id"`
	ResultCode        int       `json:"result_code"`
	ResultDesc        string    `json:"result_desc"`
	MpesaReceiptNo    string    `json:"mpesa_receipt_number,omitempty"`
	TransactionDate   time.Time `json:"transaction_date,omitempty"`
	PhoneNumber       string    `json:"phone_number,omitempty"`
	Amount            float64   `json:"amount,omitempty"`
	Status            string    `json:"status"`
	CreatedAt         time.Time `json:"created_at"`
	UpdatedAt         time.Time `json:"updated_at"`
}
