package services

import (
	"bytes"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"math/rand"
	"net/http"
	"os"
	"regexp"
	"sync"
	"time"

	"github.com/google/uuid"
)

// Global cache variables for Daraja OAuth token persistence
var (
	tokenMutex      sync.Mutex
	cachedToken     string
	tokenExpiryTime time.Time
)

// =====================================================================
// 1. YOUR ORIGINAL B2C MOCK DISBURSEMENT CODE (100% INTACT)
// =====================================================================

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

// =====================================================================
// 2. LIVE DARAJA STK PUSH CODE WITH MEMORY CACHING
// =====================================================================

// STKPushPayload defines the exact JSON structure Safaricom expects
type STKPushPayload struct {
	BusinessShortCode string `json:"BusinessShortCode"`
	Password          string `json:"Password"`
	Timestamp         string `json:"Timestamp"`
	TransactionType   string `json:"TransactionType"`
	Amount            string `json:"Amount"`
	PartyA            string `json:"PartyA"`
	PartyB            string `json:"PartyB"`
	PhoneNumber       string `json:"PhoneNumber"`
	CallBackURL       string `json:"CallBackURL"`
	AccountReference  string `json:"AccountReference"`
	TransactionDesc   string `json:"TransactionDesc"`
}

type mpesaTokenResponse struct {
	AccessToken string `json:"access_token"`
	ExpiresIn   string `json:"expires_in"`
}

// getAccessToken fetches an existing token from memory or requests a new one if expired
func getAccessToken() (string, error) {
	tokenMutex.Lock()
	defer tokenMutex.Unlock()

	// Check if token exists and is still valid (with a 5-minute safety buffer)
	if cachedToken != "" && time.Now().Before(tokenExpiryTime.Add(-5*time.Minute)) {
		return cachedToken, nil
	}

	key := os.Getenv("MPESA_CONSUMER_KEY")
	secret := os.Getenv("MPESA_CONSUMER_SECRET")

	authString := key + ":" + secret
	encodedAuth := base64.StdEncoding.EncodeToString([]byte(authString))

	url := "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return "", err
	}

	req.Header.Set("Authorization", "Basic "+encodedAuth)

	client := &http.Client{Timeout: 10 * time.Second}
	res, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer res.Body.Close()

	if res.StatusCode != 200 {
		return "", fmt.Errorf("failed to get token, status code: %d", res.StatusCode)
	}

	body, _ := io.ReadAll(res.Body)
	var tokenRes mpesaTokenResponse
	if err := json.Unmarshal(body, &tokenRes); err != nil {
		return "", err
	}

	// Update memory cache status definitions
	cachedToken = tokenRes.AccessToken
	tokenExpiryTime = time.Now().Add(time.Hour) // Standard Daraja authorization token duration

	return cachedToken, nil
}

// InitiateSTKPush handles Step 2: The actual payment prompt
func InitiateSTKPush(phoneNumber string, amount string, taskID string) error {
	accessToken, err := getAccessToken()
	if err != nil {
		return fmt.Errorf("auth error: %v", err)
	}

	shortcode := os.Getenv("MPESA_SHORTCODE")
	passkey := os.Getenv("MPESA_PASSKEY")
	timestamp := time.Now().Format("20060102150405")

	passwordStr := fmt.Sprintf("%s%s%s", shortcode, passkey, timestamp)
	password := base64.StdEncoding.EncodeToString([]byte(passwordStr))

	payload := STKPushPayload{
		BusinessShortCode: shortcode,
		Password:          password,
		Timestamp:         timestamp,
		TransactionType:   "CustomerPayBillOnline",
		Amount:            amount,
		PartyA:            phoneNumber,
		PartyB:            shortcode,
		PhoneNumber:       phoneNumber,
		CallBackURL:       "https://blcts-backend.onrender.com/api/mpesa/callback",
		AccountReference:  taskID,
		TransactionDesc:   "BLCTS Maintenance Payment",
	}

	jsonPayload, _ := json.Marshal(payload)

	req, _ := http.NewRequest("POST", "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest", bytes.NewBuffer(jsonPayload))
	req.Header.Set("Authorization", "Bearer "+accessToken)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 15 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("failed to reach Daraja STK endpoint: %v", err)
	}
	defer resp.Body.Close()

	respBody, _ := io.ReadAll(resp.Body)
	fmt.Printf("Daraja STK Response: %s\n", string(respBody))

	if resp.StatusCode != 200 {
		return fmt.Errorf("STK push failed with status %d", resp.StatusCode)
	}

	return nil
}
