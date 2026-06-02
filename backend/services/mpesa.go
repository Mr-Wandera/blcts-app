package services

import (
	"fmt"
	"math/rand"
	"regexp"
	"time"

	"github.com/google/uuid"
)

// MpesaDisbursementRequest mirrors Daraja B2C payload parameters
type MpesaDisbursementRequest struct {
	ReceiverPhone string  `json:"receiver_phone"`
	Amount        float64 `json:"amount"`
	TaskID        string  `json:"task_id"`
}

// MpesaDisbursementResponse details Safaricom's B2C transfer confirmation state
type MpesaDisbursementResponse struct {
	ConversationID           string    `json:"conversation_id"`
	OriginatorConversationID string    `json:"originator_conversation_id"`
	ResponseCode             string    `json:"response_code"`
	ResponseDescription      string    `json:"response_description"`
	TransactionID            string    `json:"transaction_id"`
	RecipientName            string    `json:"recipient_name"`
	DisbursedAmount          float64   `json:"disbursed_amount"`
	Timestamp                time.Time `json:"timestamp"`
}

// Phone validation pattern for Kenyan mobile networks (+254 or 07...)
var phoneRegex = regexp.MustCompile(`^(?:254|\+254|0)?(7|1)\d{8}$`)

// DisburseContractorFunds performs Safaricom Daraja API gateway call integrations in sandbox environment
func DisburseContractorFunds(req MpesaDisbursementRequest, contractorName string) (*MpesaDisbursementResponse, error) {
	// 1. Rigorous input validation checks
	if req.Amount <= 0 {
		return nil, fmt.Errorf("invalid disbursement amount: %.2f KSh (must be greater than 0)", req.Amount)
	}

	if !phoneRegex.MatchString(req.ReceiverPhone) {
		return nil, fmt.Errorf("invalid receiver phone format: %s. Must be a valid Kenyan mobile number (e.g. 2547XXXXXXXX)", req.ReceiverPhone)
	}

	// 2. Mock payment network connection latency (250ms - 850ms)
	rng := rand.New(rand.NewSource(time.Now().UnixNano()))
	sleepDuration := time.Duration(250+rng.Intn(600)) * time.Millisecond
	time.Sleep(sleepDuration)

	// Simulate a 2.5% occasional network failure rate in the Daraja API sandbox sandbox
	if rng.Float32() < 0.025 {
		return nil, fmt.Errorf("Safaricom API gateway response: [504] Upstream third-party timeout - please retry")
	}

	// 3. Compose response payload
	txID := fmt.Sprintf("B2C%s", uuid.New().String()[:10])
	convID := uuid.New().String()
	origConvID := uuid.New().String()

	return &MpesaDisbursementResponse{
		ConversationID:           convID,
		OriginatorConversationID: origConvID,
		ResponseCode:             "0",
		ResponseDescription:      "Accept the service request successfully.",
		TransactionID:            txID,
		RecipientName:            contractorName,
		DisbursedAmount:          req.Amount,
		Timestamp:                time.Now(),
	}, nil
}
