-- Fix 3: Account Lockout DoS (change from permanent lock to time-based lock)
ALTER TABLE users ADD COLUMN lockout_until TIMESTAMP;

-- Fix 4: Refresh Token Database Table for revocation and rotation
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    token TEXT NOT NULL UNIQUE,
    expiry_date TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_refresh_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);
