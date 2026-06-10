package services

import (
	"bytes"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"sync"
	"time"
)

var (
	tokenMutex      sync.Mutex
	cachedToken     string
	tokenExpiryTime time.Time
)

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

type DarajaResponse struct {
	MerchantRequestID   string `json:"MerchantRequestID"`
	CheckoutRequestID   string `json:"CheckoutRequestID"`
	ResponseCode        string `json:"ResponseCode"`
	ResponseDescription string `json:"ResponseDescription"`
	CustomerMessage     string `json:"CustomerMessage"`
}

type mpesaTokenResponse struct {
	AccessToken string `json:"access_token"`
	ExpiresIn   string `json:"expires_in"`
}

func getAccessToken() (string, error) {
	tokenMutex.Lock()
	defer tokenMutex.Unlock()

	if cachedToken != "" && time.Now().Before(tokenExpiryTime.Add(-5*time.Minute)) {
		return cachedToken, nil
	}

	key := os.Getenv("MPESA_CONSUMER_KEY")
	secret := os.Getenv("MPESA_CONSUMER_SECRET")
	encodedAuth := base64.StdEncoding.EncodeToString([]byte(key + ":" + secret))

	req, err := http.NewRequest("GET", "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials", nil)
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

	if res.StatusCode != http.StatusOK {
		return "", fmt.Errorf("daraja token token initialization failure status code: %d", res.StatusCode)
	}

	var tokenRes mpesaTokenResponse
	if err := json.NewDecoder(res.Body).Decode(&tokenRes); err != nil {
		return "", err
	}

	cachedToken = tokenRes.AccessToken
	tokenExpiryTime = time.Now().Add(time.Hour)
	return cachedToken, nil
}

func InitiateSTKPush(phoneNumber string, amount string, taskID string) (*DarajaResponse, error) {
	accessToken, err := getAccessToken()
	if err != nil {
		return nil, fmt.Errorf("mpesa authentication sequence error: %v", err)
	}

	shortcode := os.Getenv("MPESA_SHORTCODE")
	passkey := os.Getenv("MPESA_PASSKEY")
	callbackURL := os.Getenv("MPESA_CALLBACK_URL")
	timestamp := time.Now().Format("20060102150405")
	password := base64.StdEncoding.EncodeToString([]byte(shortcode + passkey + timestamp))

	payload := STKPushPayload{
		BusinessShortCode: shortcode,
		Password:          password,
		Timestamp:         timestamp,
		TransactionType:   "CustomerPayBillOnline",
		Amount:            amount,
		PartyA:            phoneNumber,
		PartyB:            shortcode,
		PhoneNumber:       phoneNumber,
		CallBackURL:       callbackURL,
		AccountReference:  taskID,
		TransactionDesc:   "BLCTS Payment",
	}

	jsonPayload, _ := json.Marshal(payload)
	req, _ := http.NewRequest("POST", "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest", bytes.NewBuffer(jsonPayload))
	req.Header.Set("Authorization", "Bearer "+accessToken)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 15 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("safaricom API gateway failure code %d: %s", resp.StatusCode, string(body))
	}

	var darajaRes DarajaResponse
	if err := json.NewDecoder(resp.Body).Decode(&darajaRes); err != nil {
		return nil, err
	}

	return &darajaRes, nil
}
