import { D1Database } from '@cloudflare/workers-types'

export interface GameRecord {
  id: number
  player1_id: number
  player2_id: number
  player3_id: number
  player4_id: number
  player1_bomb_score: number
  player2_bomb_score: number
  player3_bomb_score: number
  player4_bomb_score: number
  player1_final_score: number
  player2_final_score: number
  player3_final_score: number
  player4_final_score: number
  game_result_type: 'DOUBLE_WIN' | 'SINGLE_WIN' | 'DRAW'
  settlement_status: 'PENDING' | 'SETTLED'
  created_at: string
  updated_at: string
  remarks?: string
}

export interface CreateGameRecordInput {
  player1_id: number
  player2_id: number
  player3_id: number
  player4_id: number
  player1_bomb_score: number
  player2_bomb_score: number
  player3_bomb_score: number
  player4_bomb_score: number
  player1_final_score: number
  player2_final_score: number
  player3_final_score: number
  player4_final_score: number
  game_result_type: 'DOUBLE_WIN' | 'SINGLE_WIN' | 'DRAW'
  remarks?: string
}

export async function getGameRecords(db: D1Database): Promise<GameRecord[]> {
  const stmt = db.prepare('SELECT * FROM game_records ORDER BY created_at DESC')
  const { results } = await stmt.all()
  return results.map((row) => ({
    id: Number(row.id),
    player1_id: Number(row.player1_id),
    player2_id: Number(row.player2_id),
    player3_id: Number(row.player3_id),
    player4_id: Number(row.player4_id),
    player1_bomb_score: Number(row.player1_bomb_score),
    player2_bomb_score: Number(row.player2_bomb_score),
    player3_bomb_score: Number(row.player3_bomb_score),
    player4_bomb_score: Number(row.player4_bomb_score),
    player1_final_score: Number(row.player1_final_score),
    player2_final_score: Number(row.player2_final_score),
    player3_final_score: Number(row.player3_final_score),
    player4_final_score: Number(row.player4_final_score),
    game_result_type: row.game_result_type as 'DOUBLE_WIN' | 'SINGLE_WIN' | 'DRAW',
    settlement_status: row.settlement_status as 'PENDING' | 'SETTLED',
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
    remarks: row.remarks ? String(row.remarks) : undefined,
  }))
}

export async function getPendingGameRecords(db: D1Database): Promise<GameRecord[]> {
  const stmt = db.prepare(`
    SELECT * FROM game_records 
    WHERE settlement_status = 'PENDING'
    ORDER BY created_at DESC
  `)
  const { results } = await stmt.all()
  return results.map((row) => ({
    id: Number(row.id),
    player1_id: Number(row.player1_id),
    player2_id: Number(row.player2_id),
    player3_id: Number(row.player3_id),
    player4_id: Number(row.player4_id),
    player1_bomb_score: Number(row.player1_bomb_score),
    player2_bomb_score: Number(row.player2_bomb_score),
    player3_bomb_score: Number(row.player3_bomb_score),
    player4_bomb_score: Number(row.player4_bomb_score),
    player1_final_score: Number(row.player1_final_score),
    player2_final_score: Number(row.player2_final_score),
    player3_final_score: Number(row.player3_final_score),
    player4_final_score: Number(row.player4_final_score),
    game_result_type: row.game_result_type as 'DOUBLE_WIN' | 'SINGLE_WIN' | 'DRAW',
    settlement_status: row.settlement_status as 'PENDING' | 'SETTLED',
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
    remarks: row.remarks ? String(row.remarks) : undefined,
  }))
}

async function checkPlayerExists(db: D1Database, playerId: number): Promise<boolean> {
  const stmt = db.prepare('SELECT 1 FROM players WHERE id = ?').bind(playerId)
  const result = await stmt.first()
  return !!result
}

export async function createGameRecord(db: D1Database, input: CreateGameRecordInput): Promise<GameRecord> {
  // 检查所有玩家是否存在
  const playerIds = [input.player1_id, input.player2_id, input.player3_id, input.player4_id]
  for (const playerId of playerIds) {
    const exists = await checkPlayerExists(db, playerId)
    if (!exists) {
      throw new Error(`Player with ID ${playerId} does not exist`)
    }
  }

  try {
    const stmt = db
      .prepare(
        `
      INSERT INTO game_records (
        player1_id, player2_id, player3_id, player4_id,
        player1_bomb_score, player2_bomb_score, player3_bomb_score, player4_bomb_score,
        player1_final_score, player2_final_score, player3_final_score, player4_final_score,
        game_result_type, settlement_status, remarks
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', ?)
    `,
      )
      .bind(
        input.player1_id,
        input.player2_id,
        input.player3_id,
        input.player4_id,
        input.player1_bomb_score,
        input.player2_bomb_score,
        input.player3_bomb_score,
        input.player4_bomb_score,
        input.player1_final_score,
        input.player2_final_score,
        input.player3_final_score,
        input.player4_final_score,
        input.game_result_type,
        input.remarks || null,
      )

    await stmt.run()

    // 获取最后插入的记录
    const lastInsertId = await db.prepare('SELECT last_insert_rowid() as id').first()
    if (!lastInsertId) {
      throw new Error('Failed to get last insert ID')
    }

    const id = Number(lastInsertId.id)
    return getGameRecordById(db, id) as Promise<GameRecord>
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to create game record: ${error.message}`)
    }
    throw new Error('Failed to create game record: Unknown error')
  }
}

export async function deleteGameRecord(db: D1Database, id: number): Promise<boolean> {
  const stmt = db.prepare('DELETE FROM game_records WHERE id = ?').bind(id)
  const result = await stmt.run()
  return result.success
}

export async function settleAllPendingGameRecords(db: D1Database): Promise<number> {
  const stmt = db.prepare(`
    UPDATE game_records 
    SET settlement_status = 'SETTLED',
        updated_at = CURRENT_TIMESTAMP
    WHERE settlement_status = 'PENDING'
    RETURNING id
  `)
  const { results } = await stmt.all()
  return results.length
}

export async function getGameRecordById(db: D1Database, id: number): Promise<GameRecord | null> {
  const stmt = db.prepare('SELECT * FROM game_records WHERE id = ?').bind(id)
  const result = await stmt.first()

  if (!result) {
    return null
  }

  return {
    id: Number(result.id),
    player1_id: Number(result.player1_id),
    player2_id: Number(result.player2_id),
    player3_id: Number(result.player3_id),
    player4_id: Number(result.player4_id),
    player1_bomb_score: Number(result.player1_bomb_score),
    player2_bomb_score: Number(result.player2_bomb_score),
    player3_bomb_score: Number(result.player3_bomb_score),
    player4_bomb_score: Number(result.player4_bomb_score),
    player1_final_score: Number(result.player1_final_score),
    player2_final_score: Number(result.player2_final_score),
    player3_final_score: Number(result.player3_final_score),
    player4_final_score: Number(result.player4_final_score),
    game_result_type: result.game_result_type as 'DOUBLE_WIN' | 'SINGLE_WIN' | 'DRAW',
    settlement_status: result.settlement_status as 'PENDING' | 'SETTLED',
    created_at: String(result.created_at),
    updated_at: String(result.updated_at),
    remarks: result.remarks ? String(result.remarks) : undefined,
  }
}
