package models

import (
	"time"

	"github.com/google/uuid"
)

// User represents the system identity profile
type User struct {
	ID           uuid.UUID `json:"id" db:"id"`
	Name         string    `json:"name" db:"name"`
	Email        string    `json:"email" db:"email"`
	PasswordHash string    `json:"-" db:"password_hash"` // Never expose password hashes in JSON payloads
	Role         string    `json:"role" db:"role"`       // owner, manager, staff
	CreatedAt    time.Time `json:"created_at" db:"created_at"`
	UpdatedAt    time.Time `json:"updated_at" db:"updated_at"`
}

// Building represents the construction & operational real estate asset
type Building struct {
	ID         uuid.UUID `json:"id" db:"id"`
	Name       string    `json:"name" db:"name"`
	Location   string    `json:"location" db:"location"`
	TotalCapex float64   `json:"total_capex" db:"total_capex"`
	TotalOpex  float64   `json:"total_opex" db:"total_opex"`
	CreatedAt  time.Time `json:"created_at" db:"created_at"`
	UpdatedAt  time.Time `json:"updated_at" db:"updated_at"`
}

// GetTCO compiles the true running Total Cost of Ownership (TCO = CAPEX + OPEX)
func (b *Building) GetTCO() float64 {
	return b.TotalCapex + b.TotalOpex
}

// BuildingWithTCO embeds the dynamic calculations for response bodies
type BuildingResponse struct {
	Building
	TotalCostOfOwnership float64 `json:"total_cost_of_ownership"`
}

// NewBuildingResponse compiles hydrated database records into calculation structures
func NewBuildingResponse(b Building) BuildingResponse {
	return BuildingResponse{
		Building:             b,
		TotalCostOfOwnership: b.GetTCO(),
	}
}

// CostEntry defines recorded invoices under specific lifecycle phases
type CostEntry struct {
	ID          uuid.UUID `json:"id" db:"id"`
	BuildingID  uuid.UUID `json:"building_id" db:"building_id"`
	Phase       string    `json:"phase" db:"phase"` // capex, opex, maintenance, end-of-life
	Category    string    `json:"category" db:"category"`
	Amount      float64   `json:"amount" db:"amount"`
	Description string    `json:"description" db:"description"`
	Date        time.Time `json:"date" db:"date"`
	CreatedAt   time.Time `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time `json:"updated_at" db:"updated_at"`
}

// MaintenanceTask holds schedule workflows tracking vendor performance
type MaintenanceTask struct {
	ID             uuid.UUID `json:"id" db:"id"`
	BuildingID     uuid.UUID `json:"building_id" db:"building_id"`
	Component      string    `json:"component" db:"component"`
	Status         string    `json:"status" db:"status"` // Scheduled, In-Progress, Completed, Paid
	TargetDate     time.Time `json:"target_date" db:"target_date"`
	ContractorName string    `json:"contractor_name" db:"contractor_name"`
	Phone          string    `json:"phone" db:"phone"`   // mobile number for M-Pesa sandbox payouts
	Amount         float64   `json:"amount" db:"amount"` // disbursement threshold
	CreatedAt      time.Time `json:"created_at" db:"created_at"`
	UpdatedAt      time.Time `json:"updated_at" db:"updated_at"`
}

type ChartDataPoint struct {
	Month       string  `json:"month"`
	CapexBudget float64 `json:"capexBudget"`
	CapexActual float64 `json:"capexActual"`
	OpexBudget  float64 `json:"opexBudget"`
	OpexActual  float64 `json:"opexActual"`
}
