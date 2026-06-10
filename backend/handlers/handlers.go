package handlers

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/username/blcts-backend/models"
	"github.com/username/blcts-backend/services"
	"github.com/username/blcts-backend/utils"
)

// DBConnectionPool interfaces standard operations for clean PostgreSQL connections
type DBConnectionPool interface {
	QueryRow(ctx context.Context, query string, args ...interface{}) *sql.Row
	Query(ctx context.Context, query string, args ...interface{}) (*sql.Rows, error)
	Exec(ctx context.Context, query string, args ...interface{}) (sql.Result, error)
	BeginTx(ctx context.Context, opts *sql.TxOptions) (*sql.Tx, error)
}

type HandlerDeps struct {
	DB DBConnectionPool
}

type CostUpsertInput struct {
	BuildingID  string  `json:"building_id"`
	Phase       string  `json:"phase"` 
	Category    string  `json:"category"`
	Amount      float64 `json:"amount"`
	Description string  `json:"description"`
	Date        string  `json:"date"` 
}

type STKPushRequest struct {
	PhoneNumber string `json:"phone_number"`
}

type ErrorResponse struct {
	Status  int    `json:"status"`
	Message string `json:"message"`
	Code    string `json:"code"`
}

func SendError(w http.ResponseWriter, status int, msg string, code string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(ErrorResponse{
		Status:  status,
		Message: msg,
		Code:    code,
	})
}

func SendJSON(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}

func (h *HandlerDeps) HandleCreateCost(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	var input CostUpsertInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		SendError(w, http.StatusBadRequest, "Malformed JSON request body parameters", "BAD_REQUEST_BODY")
		return
	}

	buildingUUID, err := uuid.Parse(input.BuildingID)
	if err != nil {
		SendError(w, http.StatusBadRequest, "Invalid building_id parameter string UUID composition", "INVALID_BUILDING_ID")
		return
	}

	phaseNormalized := strings.ToLower(input.Phase)
	validPhases := map[string]bool{"capex": true, "opex": true, "maintenance": true, "end-of-life": true}
	if !validPhases[phaseNormalized] {
		SendError(w, http.StatusBadRequest, "Invalid phase property specification", "INVALID_LIFECYCLE_PHASE")
		return
	}

	if input.Amount <= 0 {
		SendError(w, http.StatusBadRequest, "Cost aggregation field parameters must exceed zero", "INVALID_AMOUNT")
		return
	}

	parsedDate, err := utils.ParseFlexibleDate(input.Date)
	if err != nil {
		SendError(w, http.StatusBadRequest, err.Error(), "INVALID_DATE_FORMAT")
		return
	}

	newRecord := models.CostEntry{
		ID:          uuid.New().String(),
		BuildingID:  buildingUUID.String(),
		Phase:       phaseNormalized,
		Category:    input.Category,
		Amount:      input.Amount,
		Description: input.Description,
		Date:        parsedDate,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	if h.DB != nil {
		query := `INSERT INTO cost_entries (id, building_id, phase, category, amount, description, date, created_at, updated_at) 
                  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`
		_, dbErr := h.DB.Exec(ctx, query, newRecord.ID, newRecord.BuildingID, newRecord.Phase, newRecord.Category, newRecord.Amount, newRecord.Description, newRecord.Date, newRecord.CreatedAt, newRecord.UpdatedAt)
		if dbErr != nil {
			SendError(w, http.StatusInternalServerError, "Database execution error sequence trace: "+dbErr.Error(), "DATABASE_PERSIST_ERROR")
			return
		}
	}

	SendJSON(w, http.StatusCreated, map[string]interface{}{
		"success": true,
		"record":  newRecord,
	})
}

type DashboardAggregationResponse struct {
	BuildingID           string                  `json:"building_id"`
	BuildingName         string                  `json:"building_name"`
	Location             string                  `json:"location"`
	TotalCapex           float64                 `json:"total_capex"`
	TotalOpex            float64                 `json:"total_opex"`
	TotalCostOfOwnership float64                 `json:"total_cost_of_ownership"`
	AssetHealthGrade     string                  `json:"asset_health_grade"`
	ChartTrends          []models.ChartDataPoint `json:"chart_trends"`
	GeneratedAt          time.Time               `json:"generated_at"`
}

func (h *HandlerDeps) HandleGetDashboard(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	buildingIDStr := chi.URLParam(r, "building_id")
	_, err := uuid.Parse(buildingIDStr)
	if err != nil {
		SendError(w, http.StatusBadRequest, "Invalid UUID parameter structure allocation", "INVALID_UUID")
		return
	}

	name := "Unassigned Registered Property Asset"
	location := "Nairobi Metropolitan Area"
	var totalCapex float64 = 0.0
	var totalOpex float64 = 0.0

	if h.DB != nil {
		buildingQuery := `SELECT name, location FROM buildings WHERE id = $1`
		err = h.DB.QueryRow(ctx, buildingQuery, buildingIDStr).Scan(&name, &location)
		if err != nil && err != sql.ErrNoRows {
			SendError(w, http.StatusInternalServerError, "Failed to retrieve building metadata details", "DATABASE_ERROR")
			return
		}

		capexQuery := `SELECT COALESCE(SUM(amount), 0.0) FROM cost_entries WHERE building_id = $1 AND phase = 'capex'`
		_ = h.DB.QueryRow(ctx, capexQuery, buildingIDStr).Scan(&totalCapex)

		opexQuery := `SELECT COALESCE(SUM(amount), 0.0) FROM cost_entries WHERE building_id = $1 AND (phase = 'opex' OR phase = 'maintenance')`
		_ = h.DB.QueryRow(ctx, opexQuery, buildingIDStr).Scan(&totalOpex)
	} else {
		name = "Delta Corner Commercial Block"
		location = "Westlands, Nairobi"
		totalCapex = 124500000.00
		totalOpex = 19480000.00
	}

	trends := []models.ChartDataPoint{
		{Month: "Jan", CapexBudget: 15.0, CapexActual: 14.2, OpexBudget: 4.5, OpexActual: 4.8},
		{Month: "Feb", CapexBudget: 12.0, CapexActual: 11.8, OpexBudget: 4.5, OpexActual: 4.2},
		{Month: "Mar", CapexBudget: 10.0, CapexActual: 10.5, OpexBudget: 4.5, OpexActual: 5.1},
	}

	SendJSON(w, http.StatusOK, DashboardAggregationResponse{
		BuildingID:           buildingIDStr,
		BuildingName         name,
		Location             location,
		TotalCapex           totalCapex,
		TotalOpex            totalOpex,
		TotalCostOfOwnership: totalCapex + totalOpex,
		AssetHealthGrade:     "A",
		ChartTrends:          trends,
		GeneratedAt:          time.Now(),
	})
}

func (h *HandlerDeps) HandleInitiateSTKPush(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 10*time.Second)
	defer cancel()

	taskID := chi.URLParam(r, "task_id")
	_, err := uuid.Parse(taskID)
	if err != nil {
		SendError(w, http.StatusBadRequest, "Invalid task ID structural formatting parameters", "INVALID_TASK_ID")
		return
	}

	var req STKPushRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		SendError(w, http.StatusBadRequest, "Malformed payload parameters tracking layout input", "BAD_REQUEST")
		return
	}

	if req.PhoneNumber == "" {
		SendError(w, http.StatusBadRequest, "Missing explicit phone number parameter allocation mapping", "MISSING_PHONE")
		return
	}

	amountToPay := "1"
	darajaRes, err := services.InitiateSTKPush(req.PhoneNumber, amountToPay, taskID)
	if err != nil {
		SendError(w, http.StatusInternalServerError, "M-Pesa STK Push gateway initialization exception: "+err.Error(), "STK_PUSH_ERROR")
		return
	}

	if h.DB != nil {
		tx, txErr := h.DB.BeginTx(ctx, nil)
		if txErr == nil {
			defer tx.Rollback()

			updateTaskQuery := `UPDATE maintenance_tasks SET checkout_request_id = $1, status = 'PROCESSING' WHERE id = $2`
			_, _ = tx.Exec(ctx, updateTaskQuery, darajaRes.CheckoutRequestID, taskID)

			insertTxQuery := `INSERT INTO mpesa_transactions (task_id, merchant_request_id, checkout_request_id, result_code, result_desc, status) 
                              VALUES ($1, $2, $3, $4, $5, 'PENDING')`
			_, _ = tx.Exec(ctx, insertTxQuery, taskID, darajaRes.MerchantRequestID, darajaRes.CheckoutRequestID, 0, "Awaiting customer response verification validation sequence loop")

			_ = tx.Commit()
		}
	}

	SendJSON(w, http.StatusOK, map[string]interface{}{
		"success":             true,
		"message":             "STK Push prompt dispatched successfully.",
		"checkout_request_id": darajaRes.CheckoutRequestID,
	})
}

func (h *HandlerDeps) HandleMpesaCallback(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 10*time.Second)
	defer cancel()

	var payload models.MpesaCallbackPayload
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"ResultCode": 1, "ResultDesc": "Payload compilation structural processing exception formatting error"}`))
		return
	}

	stk := payload.Body.StkCallback
	if h.DB == nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"ResultCode": 0, "ResultDesc": "Success mapping mock intercept trace completed layout"}`))
		return
	}

	tx, txErr := h.DB.BeginTx(ctx, nil)
	if txErr != nil {
		w.WriteHeader(http.StatusOK)
		return
	}
	defer tx.Rollback()

	var txExists bool
	checkQuery := `SELECT EXISTS(SELECT 1 FROM mpesa_transactions WHERE checkout_request_id = $1 AND status != 'PENDING')`
	_ = tx.QueryRow(ctx, checkQuery, stk.CheckoutRequestID).Scan(&txExists)
	if txExists {
		_ = tx.Commit()
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"ResultCode": 0, "ResultDesc": "Idempotency catch hit: Duplicate transaction request skipped securely"}`))
		return
	}

	finalStatus := "FAILED"
	taskStatus := "FAILED"
	if stk.ResultCode == 0 {
		finalStatus = "SUCCESS"
		taskStatus = "Paid"
	}

	var mpesaReceiptNumber *string
	var phoneNumber *string
	var amount *float64

	if stk.CallbackMetadata != nil {
		for _, item := range stk.CallbackMetadata.Item {
			switch item.Name {
			case "MpesaReceiptNumber":
				if valStr, ok := item.Value.(string); ok {
					mpesaReceiptNumber = &valStr
				}
			case "PhoneNumber":
				if valStr, ok := item.Value.(string); ok {
					phoneNumber = &valStr
				}
			case "Amount":
				if valFloat, ok := item.Value.(float64); ok {
					amount = &valFloat
				}
			}
		}
	}

	updateTxQuery := `UPDATE mpesa_transactions 
                      SET result_code = $1, result_desc = $2, mpesa_receipt_number = $3, phone_number = $4, amount = $5, status = $6, updated_at = NOW() 
                      WHERE checkout_request_id = $7 RETURNING task_id`
	
	var taskIDStr string
	err := tx.QueryRow(ctx, updateTxQuery, stk.ResultCode, stk.ResultDesc, mpesaReceiptNumber, phoneNumber, amount, finalStatus, stk.CheckoutRequestID).Scan(&taskIDStr)
	
	if err == nil && taskIDStr != "" {
		updateTaskQuery := `UPDATE maintenance_tasks SET status = $1 WHERE id = $2`
		_, _ = tx.Exec(ctx, updateTaskQuery, taskStatus, taskIDStr)
	}

	if err := tx.Commit(); err != nil {
		w.WriteHeader(http.StatusOK)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"ResultCode": 0, "ResultDesc": "Callback record captured and tracked securely"}`))
}