package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"blcts-backend/config"
	"blcts-backend/handlers"
	customMiddleware "blcts-backend/middleware"
)

// DBAdapter bridges any structural type mismatch between config pool signatures and handlers interfaces
type DBAdapter struct {
	Pool *config.PostgresPool
}

func (a DBAdapter) Exec(query string, args ...interface{}) error {
	return a.Pool.Exec(query, args...)
}

func (a DBAdapter) QueryRow(query string, args ...interface{}) handlers.RowScanner {
	scanner := a.Pool.QueryRow(query, args...)
	return RowScannerAdapter{Scanner: scanner}
}

type RowScannerAdapter struct {
	Scanner config.RowScanner
}

func (rsa RowScannerAdapter) Scan(dest ...interface{}) error {
	return rsa.Scanner.Scan(dest...)
}

func main() {
	log.SetFlags(log.LstdFlags | log.Lshortfile)
	log.Println("Starting BLCTS Backend...")

	var dbPool handlers.DBConnectionPool
	db, err := config.ConnectDatabase()
	if err != nil {
		log.Printf("DATABASE WARNING: %s\n", err.Error())
		log.Println("Running in sandbox mode with in-memory persistence.")
	} else {
		log.Println("Database pool linked to PostgreSQL.")
		dbPool = DBAdapter{Pool: db}
		defer db.Pool.Close()
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

	// Public health probe
	r.Get("/api/health", func(w http.ResponseWriter, r *http.Request) {
		status := "healthy"
		if dbPool == nil {
			status = "degraded (sandbox mode)"
		}
		handlers.SendJSON(w, http.StatusOK, map[string]interface{}{
			"status":    status,
			"timestamp": time.Now().Format(time.RFC3339),
			"version":   "1.0.0",
		})
	})

	// Public read-only dashboard data (charts, KPIs)
	r.Get("/api/dashboard/{building_id}", deps.HandleGetDashboard)

	// Protected endpoints with JWT + role-based access control
	r.Group(func(secured chi.Router) {
		secured.Use(customMiddleware.EnsureJWT)

		// Cost entry creation: Administrator and Facility Manager only
		secured.With(customMiddleware.RequireRole("administrator", "facility_manager")).Post("/api/costs", deps.HandleCreateCost)

		// Cost entry deletion: Administrator only
		secured.With(customMiddleware.RequireRole("administrator")).Delete("/api/costs/{id}", deps.HandleDeleteCost)

		// User management: Administrator only
		secured.With(customMiddleware.RequireRole("administrator")).Post("/api/users", deps.HandleCreateUser)
		secured.With(customMiddleware.RequireRole("administrator")).Delete("/api/users/{id}", deps.HandleDeleteUser)
		secured.With(customMiddleware.RequireRole("administrator")).Put("/api/users/{id}/role", deps.HandleUpdateUserRole)

		// Material pricing: Administrator only
		secured.With(customMiddleware.RequireRole("administrator")).Put("/api/materials/{id}", deps.HandleUpdateMaterial)

		// Project management: Administrator and Facility Manager
		secured.With(customMiddleware.RequireRole("administrator", "facility_manager")).Post("/api/projects", deps.HandleCreateProject)
		secured.With(customMiddleware.RequireRole("administrator")).Delete("/api/projects/{id}", deps.HandleDeleteProject)

		// Maintenance records: Administrator and Facility Manager
		secured.With(customMiddleware.RequireRole("administrator", "facility_manager")).Post("/api/maintenance", deps.HandleCreateMaintenance)
		secured.With(customMiddleware.RequireRole("administrator", "facility_manager")).Put("/api/maintenance/{id}", deps.HandleUpdateMaintenance)

		// System settings: Administrator only
		secured.With(customMiddleware.RequireRole("administrator")).Put("/api/settings", deps.HandleUpdateSettings)

		// Building Owner: read-only access to owned buildings
		secured.With(customMiddleware.RequireRole("administrator", "facility_manager", "building_owner")).Get("/api/buildings", deps.HandleListBuildings)
		secured.With(customMiddleware.RequireRole("administrator", "facility_manager", "building_owner")).Get("/api/buildings/{id}/report", deps.HandleGetBuildingReport)
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	serverAddr := fmt.Sprintf("0.0.0.0:%s", port)

	server := &http.Server{
		Addr:         serverAddr,
		Handler:      r,
		ReadTimeout:  15 * time.Minute,
		WriteTimeout: 15 * time.Minute,
		IdleTimeout:  2 * time.Minute,
	}

	shutdownChan := make(chan os.Signal, 1)
	signal.Notify(shutdownChan, os.Interrupt, syscall.SIGTERM, syscall.SIGINT)

	go func() {
		log.Printf("Server listening on: http://%s\n", serverAddr)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Listener error: %s\n", err.Error())
		}
	}()

	sig := <-shutdownChan
	log.Printf("Graceful shutdown triggered: %s\n", sig)

	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	if err := server.Shutdown(ctx); err != nil {
		log.Fatalf("Forced exit: %s\n", err.Error())
	}

	log.Println("Server stopped. Clean shutdown complete.")
}
