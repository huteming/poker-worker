-- 创建临时表
CREATE TABLE game_records_temp (
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
  game_result_type TEXT NOT NULL,
  settlement_status TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  updated_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  remarks TEXT,
  FOREIGN KEY(player1_id) REFERENCES players(id),
  FOREIGN KEY(player2_id) REFERENCES players(id),
  FOREIGN KEY(player3_id) REFERENCES players(id),
  FOREIGN KEY(player4_id) REFERENCES players(id)
);

-- 复制数据
INSERT INTO game_records_temp 
SELECT * FROM game_records;

-- 删除原表
DROP TABLE game_records;

-- 重命名临时表
ALTER TABLE game_records_temp RENAME TO game_records;

-- 重新创建索引
CREATE INDEX IF NOT EXISTS idx_game_records_game_result_type ON game_records(game_result_type);
CREATE INDEX IF NOT EXISTS idx_game_records_settlement_status ON game_records(settlement_status);
CREATE INDEX IF NOT EXISTS idx_game_records_created_at ON game_records(created_at); 