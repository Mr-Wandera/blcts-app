package models

import (
	"time"

	"github.com/google/uuid"
)

// CostEntry records a single capex/opex/maintenance ledger transaction for a building
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

// ChartDataPoint represents one month's budget-vs-actual figures for Recharts/Chart.js
type ChartDataPoint struct {
	Month       string  `json:"month"`
	CapexBudget float64 `json:"capex_budget"`
	CapexActual float64 `json:"capex_actual"`
	OpexBudget  float64 `json:"opex_budget"`
	OpexActual  float64 `json:"opex_actual"`
}
