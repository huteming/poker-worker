CREATE TABLE IF NOT EXISTS game_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  player1_id INTEGER NOT NULL,
  player2_id INTEGER NOT NULL,
  player3_id INTEGER NOT NULL,
  player4_id INTEGER NOT NULL,
  player1_bomb_score INTEGER NOT NULL,
  player2_bomb_score INTEGER NOT NULL,
  player3_bomb_score INTEGER NOT NULL,
  player4_bomb_score INTEGER NOT NULL,
  player1_final_score INTEGER NOT NULL,
  player2_final_score INTEGER NOT NULL,
  player3_final_score INTEGER NOT NULL,
  player4_final_score INTEGER NOT NULL,
  game_result_type TEXT NOT NULL CHECK (
    game_result_type IN ('DOUBLE_WIN', 'SINGLE_WIN', 'DRAW')
  ),
  settlement_status TEXT NOT NULL CHECK (
    settlement_status IN ('PENDING', 'SETTLED')
  ),
  created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  updated_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  remarks TEXT,
  FOREIGN KEY(player1_id) REFERENCES players(id),
  FOREIGN KEY(player2_id) REFERENCES players(id),
  FOREIGN KEY(player3_id) REFERENCES players(id),
  FOREIGN KEY(player4_id) REFERENCES players(id)
);

CREATE INDEX IF NOT EXISTS idx_game_records_game_result_type ON game_records(game_result_type);
CREATE INDEX IF NOT EXISTS idx_game_records_settlement_status ON game_records(settlement_status);
CREATE INDEX IF NOT EXISTS idx_game_records_created_at ON game_records(created_at);