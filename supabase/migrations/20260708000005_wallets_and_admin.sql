-- Multiple wallets per player + admin flag

CREATE TABLE wallet_addresses (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id   UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  address     TEXT NOT NULL,
  chain_id    INTEGER NOT NULL DEFAULT 84532,
  label       TEXT,
  verified    BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(player_id, address)
);

ALTER TABLE wallet_addresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY wallet_addresses_self ON wallet_addresses
  FOR ALL USING (player_id = auth.uid());

CREATE POLICY wallet_addresses_select_player ON wallet_addresses
  FOR SELECT USING (true);

ALTER TABLE players ADD COLUMN is_admin BOOLEAN DEFAULT false;
