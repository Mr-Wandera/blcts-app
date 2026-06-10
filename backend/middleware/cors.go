package middleware

import (
	"net/http"
	"os"
	"strings"
)

func CORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")
		rawOrigins := os.Getenv("ALLOWED_ORIGINS")

		allowedOrigins := []string{
			"http://localhost:3000",
			"http://localhost:5173",
			"https://blcts-dashboard.onrender.com",
		}

		if rawOrigins != "" {
			customOrigins := strings.Split(rawOrigins, ",")
			for _, o := range customOrigins {
				allowedOrigins = append(allowedOrigins, strings.TrimSpace(o))
			}
		}

		isAllowed := false
		if origin != "" {
			for _, allowed := range allowedOrigins {
				if allowed == "*" || allowed == origin {
					w.Header().Set("Access-Control-Allow-Origin", origin)
					isAllowed = true
					break
				}
			}
		}

		if !isAllowed && origin != "" && (strings.HasPrefix(origin, "http://localhost:") || strings.HasPrefix(origin, "http://127.0.0.1:")) {
			w.Header().Set("Access-Control-Allow-Origin", origin)
		} else if !isAllowed && origin == "" {
			w.Header().Set("Access-Control-Allow-Origin", "*")
		}

		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Accept, Content-Length, X-CSRF-Token")
		w.Header().Set("Access-Control-Allow-Credentials", "true")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		next.ServeHTTP(w, r)
	})
}
