package config

import (
	"context"
	"fmt"
	"os"
	"time"

	"github.com/jackc/pgx/v5" // Added to support the pgx.Row return type
	"github.com/jackc/pgx/v5/pgxpool"
)

// PostgresPool wraps the connection pool
type PostgresPool struct {
	Pool *pgxpool.Pool
}

// Exec executes statement changes
// Updated to accept context.Context to match the handlers interface
func (p *PostgresPool) Exec(ctx context.Context, query string, args ...interface{}) error {
	_, err := p.Pool.Exec(ctx, query, args...)
	return err
}

// QueryRow fetches single records
// Updated to accept context.Context and return native pgx.Row
func (p *PostgresPool) QueryRow(ctx context.Context, query string, args ...interface{}) pgx.Row {
	return p.Pool.QueryRow(ctx, query, args...)
}

// ConnectDatabase instantiates high-performance connections with pooling configs
func ConnectDatabase() (*PostgresPool, error) {
	// Pull standard environment connections configs or fallback to local containers
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		host := os.Getenv("DB_HOST")
		if host == "" {
			host = "localhost"
		}
		port := os.Getenv("DB_PORT")
		if port == "" {
			port = "5432"
		}
		user := os.Getenv("DB_USER")
		if user == "" {
			user = "postgres"
		}
		password := os.Getenv("DB_PASSWORD")
		if password == "" {
			password = "postgres_secure_pass"
		}
		dbname := os.Getenv("DB_NAME")
		if dbname == "" {
			dbname = "blcts_db"
		}

		dsn = fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=disable", user, password, host, port, dbname)
	}

	config, err := pgxpool.ParseConfig(dsn)
	if err != nil {
		return nil, fmt.Errorf("error parsing connection string: %w", err)
	}

	// High-performance concurrency tunings for high-load systems
	config.MaxConns = 25
	config.MinConns = 5
	config.MaxConnLifetime = 30 * time.Minute
	config.MaxConnIdleTime = 15 * time.Minute

	pool, err := pgxpool.NewWithConfig(context.Background(), config)
	if err != nil {
		return nil, fmt.Errorf("error establishing PostgreSQL pool handles: %w", err)
	}

	// Verify live connections using Ping
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err = pool.Ping(ctx); err != nil {
		return nil, fmt.Errorf("failed to ping PG database pool: %w", err)
	}

	return &PostgresPool{Pool: pool}, nil
}
