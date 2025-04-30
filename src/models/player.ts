import { D1Database } from '@cloudflare/workers-types'

export interface Player {
  id: number
  name: string
  avatar?: string
  created_at: string
}

export interface CreatePlayerInput {
  name: string
  avatar?: string
}

export async function getPlayers(db: D1Database): Promise<Player[]> {
  const stmt = db.prepare('SELECT * FROM players ORDER BY created_at DESC')
  const { results } = await stmt.all()
  return results.map((row) => ({
    id: Number(row.id),
    name: String(row.name),
    avatar: row.avatar ? String(row.avatar) : undefined,
    created_at: String(row.created_at),
  }))
}

export async function createPlayer(db: D1Database, input: CreatePlayerInput): Promise<Player> {
  const stmt = db
    .prepare(
      `
    INSERT INTO players (name, avatar)
    VALUES (?, ?)
    RETURNING *
  `,
    )
    .bind(input.name, input.avatar || null)

  const result = await stmt.first()

  if (!result) {
    throw new Error('Failed to create player')
  }

  return {
    id: Number(result.id),
    name: String(result.name),
    avatar: result.avatar ? String(result.avatar) : undefined,
    created_at: String(result.created_at),
  }
}

export async function getPlayerById(db: D1Database, id: number): Promise<Player | null> {
  const stmt = db.prepare('SELECT * FROM players WHERE id = ?').bind(id)
  const result = await stmt.first()

  if (!result) {
    return null
  }

  return {
    id: Number(result.id),
    name: String(result.name),
    avatar: result.avatar ? String(result.avatar) : undefined,
    created_at: String(result.created_at),
  }
}
