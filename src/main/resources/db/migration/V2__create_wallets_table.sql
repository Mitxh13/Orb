CREATE TABLE wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    balance DECIMAL(15,2) NOT NULL DEFAULT 100000.00,
    currency VARCHAR(10) NOT NULL DEFAULT 'ORB',
    wallet_tag VARCHAR(64) NOT NULL UNIQUE,
    transfer_pin_hash VARCHAR(255) NOT NULL,
    is_locked BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_wallets_user_id ON wallets(user_id);
CREATE INDEX idx_wallets_wallet_tag ON wallets(wallet_tag);
