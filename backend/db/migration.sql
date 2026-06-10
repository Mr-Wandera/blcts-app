-- PostgreSQL DDL Migration Script for BLCTS Core Schema & M-Pesa Integration

-- Enable UUID extension for cryptographic primary keys
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create 'users' table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('owner', 'manager', 'staff')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create 'buildings' table 
CREATE TABLE IF NOT EXISTS buildings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    total_capex DECIMAL(15,2) DEFAULT 0.00 CHECK (total_capex >= 0),
    total_opex DECIMAL(15,2) DEFAULT 0.00 CHECK (total_opex >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create 'cost_entries' table
CREATE TABLE IF NOT EXISTS cost_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    building_id UUID NOT NULL REFERENCES buildings(id) ON DELETE CASCADE,
    phase VARCHAR(50) NOT NULL CHECK (phase IN ('capex', 'opex', 'maintenance', 'end-of-life')),
    category VARCHAR(100) NOT NULL, -- component or category
    amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
    description TEXT,
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Create 'maintenance_tasks' table (Merged with checkout_request_id)
CREATE TABLE IF NOT EXISTS maintenance_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    building_id UUID NOT NULL REFERENCES buildings(id) ON DELETE CASCADE,
    component VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Scheduled' CHECK (status IN ('Scheduled', 'In-Progress', 'Completed', 'Paid')),
    target_date DATE NOT NULL,
    contractor_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) DEFAULT '254712345678', -- Phone for M-Pesa sandbox disbursement
    amount DECIMAL(15,2) NOT NULL DEFAULT 0.00 CHECK (amount >= 0),
    checkout_request_id VARCHAR(255), -- Tracks the specific M-Pesa payment attempt
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Create 'mpesa_transactions' table (Unified formatting)
CREATE TABLE IF NOT EXISTS mpesa_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES maintenance_tasks(id) ON DELETE CASCADE,
    merchant_request_id VARCHAR(255) NOT NULL,
    checkout_request_id VARCHAR(255) NOT NULL UNIQUE,
    result_code INT,
    result_desc TEXT,
    mpesa_receipt_number VARCHAR(100),
    transaction_date TIMESTAMP WITH TIME ZONE,
    phone_number VARCHAR(20),
    amount DECIMAL(15, 2),
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- High-performance relational lookup indices 
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_cost_entries_building_id ON cost_entries(building_id);
CREATE INDEX IF NOT EXISTS idx_cost_entries_phase ON cost_entries(phase);
CREATE INDEX IF NOT EXISTS idx_maintenance_tasks_building_id ON maintenance_tasks(building_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_tasks_status ON maintenance_tasks(status);
CREATE INDEX IF NOT EXISTS idx_mpesa_checkout_id ON mpesa_transactions(checkout_request_id);

-- Automatic metadata timestamp progression function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply automatic timezone update triggers
CREATE TRIGGER trigger_update_users_timestamp BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_update_buildings_timestamp BEFORE UPDATE ON buildings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_update_cost_entries_timestamp BEFORE UPDATE ON cost_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_update_maintenance_tasks_timestamp BEFORE UPDATE ON maintenance_tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_update_mpesa_transactions_timestamp BEFORE UPDATE ON mpesa_transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();