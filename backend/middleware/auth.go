package middleware

import (
	"context"
	"net/http"
	"strings"

	"github.com/golang-jwt/jwt/v5"
	"github.com/username/blcts-backend/handlers"
)

type contextKey string

const (
	UserContextKey contextKey = "user_claims"
	JWTSecretKey              = "BLCTS_ENTERPRISE_SECURE_TOKEN_SECRET_KEY_2026_MAY_25"
)

// UserClaims models standard system identities
type UserClaims struct {
	UserID string `json:"user_id"`
	Email  string `json:"email"`
	Role   string `json:"role"` // owner, manager, staff
	jwt.RegisteredClaims
}

// EnsureJWT injects JWT authentication verification filters to secure endpoints
func EnsureJWT(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			handlers.SendError(w, http.StatusUnauthorized, "Missing Authorization authorization header credentials", "UNAUTHORIZED")
			return
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || strings.ToLower(parts[0]) != "bearer" {
			handlers.SendError(w, http.StatusUnauthorized, "Authorization format invalid. Must be 'Bearer <JWT_TOKEN>'", "MALFORMED_AUTH_HEADER")
			return
		}

		tokenString := parts[1]
		claims := &UserClaims{}

		token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
			// Validate signing method matches expectations
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, jwt.ErrSignatureInvalid
			}
			return []byte(JWTSecretKey), nil
		})

		if err != nil || !token.Valid {
			handlers.SendError(w, http.StatusUnauthorized, "Access Token has expired or signature is invalid", "INVALID_TOKEN")
			return
		}

		// Inject active verified user traits in req Context for downstream handler audits
		ctx := context.WithValue(r.Context(), UserContextKey, claims)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

// RequireRole guards specific controller paths based on identity permissions
func RequireRole(allowedRoles ...string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			claims, ok := r.Context().Value(UserContextKey).(*UserClaims)
			if !ok {
				handlers.SendError(w, http.StatusUnauthorized, "User context identity missing in request scope", "UNAUTHORIZED_CONTEXT")
				return
			}

			isAllowed := false
			for _, role := range allowedRoles {
				if strings.ToLower(claims.Role) == strings.ToLower(role) {
					isAllowed = true
					break
				}
			}

			if !isAllowed {
				handlers.SendError(w, http.StatusForbidden, "Privilege Escalation Blocked: insufficient role access permissions", "FORBIDDEN_ESC")
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}
