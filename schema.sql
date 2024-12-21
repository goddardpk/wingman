-- Accounts table
CREATE TABLE IF NOT EXISTS accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Account Preferences table
CREATE TABLE IF NOT EXISTS account_preferences (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    account_id INTEGER NOT NULL,
    notifications_enabled BOOLEAN DEFAULT true,
    preferred_language TEXT DEFAULT 'en',
    FOREIGN KEY (account_id) REFERENCES accounts(id)
);

-- Saved Addresses table
CREATE TABLE IF NOT EXISTS saved_addresses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    account_id INTEGER NOT NULL,
    address_type TEXT NOT NULL,  -- 'home' or 'work'
    address TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (account_id) REFERENCES accounts(id)
);

-- Payment Methods table
CREATE TABLE IF NOT EXISTS payment_methods (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    account_id INTEGER NOT NULL,
    type TEXT NOT NULL,
    last_four TEXT,
    email TEXT,
    is_primary BOOLEAN DEFAULT false,
    FOREIGN KEY (account_id) REFERENCES accounts(id)
);

-- Ride Requests table
CREATE TABLE IF NOT EXISTS ride_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    rider_id INTEGER NOT NULL,
    pickup_location TEXT NOT NULL,
    destination TEXT NOT NULL,
    vehicle_type TEXT NOT NULL,
    estimated_fare DECIMAL(10,2) NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (rider_id) REFERENCES accounts(id)
);

-- Vehicle Types table
CREATE TABLE IF NOT EXISTS vehicle_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    base_fare DECIMAL(10,2) NOT NULL,
    per_mile_rate DECIMAL(10,2) NOT NULL,
    per_minute_rate DECIMAL(10,2) NOT NULL
);

-- Insert default vehicle types
INSERT INTO vehicle_types (name, base_fare, per_mile_rate, per_minute_rate) VALUES
    ('standard', 5.00, 1.50, 0.25),
    ('premium', 10.00, 2.50, 0.50);

-- Insert test account
INSERT OR IGNORE INTO accounts (email, full_name, phone) VALUES
    ('test@wingman.com', 'Test User', '555-0123');

-- Insert test account addresses
INSERT OR IGNORE INTO saved_addresses (account_id, address_type, address)
SELECT id, 'home', '123 Home Street, City, State 12345'
FROM accounts WHERE email = 'test@wingman.com';

INSERT OR IGNORE INTO saved_addresses (account_id, address_type, address)
SELECT id, 'work', '456 Work Avenue, City, State 12345'
FROM accounts WHERE email = 'test@wingman.com';
