import { Hono } from 'hono'
import {
  getGameRecords,
  getPendingGameRecords,
  createGameRecord,
  deleteGameRecord,
  settleAllPendingGameRecords,
  getGameRecordById,
  CreateGameRecordInput,
  getPlayerStats,
  SortField,
  SortOrder,
} from '../models/game-record'

// base path: /poker/v1/game-records
const gameRecordRoutes = new Hono<{ Bindings: Env }>()

// 获取所有游戏记录
gameRecordRoutes.get('/', async (c) => {
  const gameRecords = await getGameRecords(c.env.DB)

  return c.json(gameRecords)
})

// 获取待结算的游戏记录
gameRecordRoutes.get('/pending', async (c) => {
  const gameRecords = await getPendingGameRecords(c.env.DB)
  return c.json(gameRecords)
})

// 获取玩家统计信息
gameRecordRoutes.get('/player-stats', async (c) => {
  try {
    const sortBy = (c.req.query('sortBy') as SortField) || 'win_rate'
    const order = (c.req.query('order') as SortOrder) || 'desc'

    // 验证排序参数
    if (!['win_rate', 'total_games', 'wins', 'total_score'].includes(sortBy)) {
      return c.json({ error: 'Invalid sort field' }, 400)
    }
    if (!['asc', 'desc'].includes(order)) {
      return c.json({ error: 'Invalid sort order' }, 400)
    }

    const stats = await getPlayerStats(c.env.DB, sortBy, order)
    return c.json(stats)
  } catch (error) {
    console.error(error)
    return c.json({ error: 'Failed to get player stats' }, 500)
  }
})

// 获取单个游戏记录
gameRecordRoutes.get('/:id', async (c) => {
  const id = Number(c.req.param('id'))

  if (isNaN(id)) {
    return c.json({ error: 'Invalid game record ID' }, 400)
  }

  const gameRecord = await getGameRecordById(c.env.DB, id)

  if (!gameRecord) {
    return c.json({ error: 'Game record not found' }, 404)
  }

  return c.json(gameRecord)
})

// 创建游戏记录
gameRecordRoutes.post('/', async (c) => {
  try {
    const input = (await c.req.raw.json()) as CreateGameRecordInput

    // 验证输入
    if (
      !input.player1_id ||
      !input.player2_id ||
      !input.player3_id ||
      !input.player4_id ||
      !input.game_result_type ||
      !['DOUBLE_WIN', 'SINGLE_WIN', 'DRAW'].includes(input.game_result_type)
    ) {
      return c.json({ error: 'Invalid input' }, 400)
    }

    const gameRecord = await createGameRecord(c.env.DB, input)
    return c.json(gameRecord, 201)
  } catch (error) {
    console.error(error)
    return c.json({ error: 'Failed to create game record' }, 500)
  }
})

// 结算所有待结算的游戏记录
gameRecordRoutes.patch('/settle-all', async (c) => {
  try {
    const settledCount = await settleAllPendingGameRecords(c.env.DB)
    return c.json(
      {
        message: `Successfully settled ${settledCount} game records`,
        settledCount,
      },
      200,
    )
  } catch (error) {
    return c.json({ error: 'Failed to settle game records' }, 500)
  }
})

// 删除游戏记录
gameRecordRoutes.delete('/:id', async (c) => {
  const id = Number(c.req.param('id'))

  if (isNaN(id)) {
    return new Response(JSON.stringify({ error: 'Invalid game record ID' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    })
  }

  try {
    const success = await deleteGameRecord(c.env.DB, id)
    if (!success) {
      return c.json({ error: 'Game record not found' }, 404)
    }

    return c.json({ message: 'Game record deleted successfully' }, 200)
  } catch (error) {
    return c.json({ error: 'Failed to delete game record' }, 500)
  }
})

export default gameRecordRoutes
