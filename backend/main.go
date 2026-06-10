package main

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	_ "github.com/lib/pq"
	"github.com/username/blcts-backend/handlers"
	customMiddleware "github.com/username/blcts-backend/middleware"
)

type sqlPoolWrapper struct {
	*sql.DB
}

func (s *sqlPoolWrapper) QueryRow(ctx context.Context, query string, args ...interface{}) *sql.Row {
	return s.DB.QueryRowContext(ctx, query, args...)
}

func (s *sqlPoolWrapper) Query(ctx context.Context, query string, args ...interface{}) (*sql.Rows, error) {
	return s.DB.QueryContext(ctx, query, args...)
}

func (s *sqlPoolWrapper) Exec(ctx context.Context, query string, args ...interface{}) (sql.Result, error) {
	return s.DB.ExecContext(ctx, query, args...)
}

func (s *sqlPoolWrapper) BeginTx(ctx context.Context, opts *sql.TxOptions) (*sql.Tx, error) {
	return s.DB.BeginTx(ctx, opts)
}

func main() {
	log.SetFlags(log.LstdFlags | log.Lshortfile)
	log.Println("Starting Production-Ready BLCTS Core Backend Cluster Engine Pipeline...")

	var dbPool handlers.DBConnectionPool
	dbConnStr := os.Getenv("DATABASE_URL")

	if dbConnStr != "" {
		nativeDB, err := sql.Open("postgres", dbConnStr)
		if err != nil {
			log.Printf("CRITICAL STORAGE SYSTEM INITIALIZATION ERROR TRACE CONTEXT EXCEPTION: %s\n", err.Error())
		} else {
			nativeDB.SetMaxOpenConns(25)
			nativeDB.SetMaxIdleConns(5)
			nativeDB.SetConnMaxLifetime(5 * time.Minute)

			ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
			if err := nativeDB.PingContext(ctx); err != nil {
				log.Printf("DATABASE CONNECTIVITY WARNING STATUS FAILURE: %s\n", err.Error())
			} else {
				log.Println("🚀 PostgreSQL cluster linked successfully.")
				dbPool = &sqlPoolWrapper{nativeDB}
			}
			cancel()
		}
	} else {
		log.Println("⚡ Running in isolated development environment fallback mode without database backing.")
	}

	deps := &handlers.HandlerDeps{
		DB: dbPool,
	}

	r := chi.NewRouter()

	r.Use(middleware.RealIP)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.Timeout(60 * time.Second))
	r.Use(customMiddleware.CORS)

	// Public Probe Mappings
	r.Get("/api/health", func(w http.ResponseWriter, req *http.Request) {
		status := "healthy"
		if dbPool == nil {
			status = "degraded (mock active)"
		}
		handlers.SendJSON(w, http.StatusOK, map[string]interface{}{
			"status":    status,
			"timestamp": time.Now().Format(time.RFC3339),
			"version":   "1.1.0",
		})
	})

	r.Get("/api/dashboard/{building_id}", deps.HandleGetDashboard)

	// Open Payment Webhook Target Endpoint (Unshielded from internal application authentication headers)
	r.Post("/api/mpesa/callback", deps.HandleMpesaCallback)
	r.Post("/api/maintenance/{task_id}/stk", deps.HandleInitiateSTKPush)

	// Protected Transaction Groups
	r.Group(func(secured chi.Router) {
		secured.Use(customMiddleware.EnsureJWT)
		secured.Post("/api/costs", deps.HandleCreateCost)
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	serverAddr := fmt.Sprintf("0.0.0.0:%s", port)

	server := &http.Server{
		Addr:         serverAddr,
		Handler:      r,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	shutdownChan := make(chan os.Signal, 1)
	signal.Notify(shutdownChan, os.Interrupt, syscall.SIGTERM, syscall.SIGINT)

	go func() {
		log.Printf("Server listening actively on configuration port mapping route link: http://%s\n", serverAddr)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Critical platform layer termination: %s\n", err.Error())
		}
	}()

	sig := <-shutdownChan
	log.Printf("Graceful termination sequence initialized on target interrupt: %s\n", sig)

	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	if err := server.Shutdown(ctx); err != nil {
		log.Fatalf("Forced server exit execution exception: %s\n", err.Error())
	}

	log.Println("Process exited successfully.")
}
