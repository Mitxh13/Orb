CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_wallet_id UUID NOT NULL REFERENCES wallets(id),
    receiver_wallet_id UUID NOT NULL REFERENCES wallets(id),
    amount DECIMAL(15,2) NOT NULL,
    type VARCHAR(20) NOT NULL DEFAULT 'TRANSFER',
    status VARCHAR(20) NOT NULL,
    note TEXT,
    reference_id VARCHAR(64) NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_transactions_sender ON transactions(sender_wallet_id);
CREATE INDEX idx_transactions_receiver ON transactions(receiver_wallet_id);
CREATE INDEX idx_transactions_reference ON transactions(reference_id);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);
