import { Hono } from 'hono'
import { getPlayers, createPlayer, getPlayerById, CreatePlayerInput } from '../models/player'

// base path: /poker/v1/players
const playerRoutes = new Hono<{ Bindings: Env }>()

// 获取所有玩家
playerRoutes.get('/', async (c) => {
  const players = await getPlayers(c.env.DB)

  return new Response(JSON.stringify(players), {
    headers: {
      'content-type': 'application/json',
    },
  })
})

// 获取单个玩家
playerRoutes.get('/:id', async (c) => {
  const id = Number(c.req.param('id'))

  if (isNaN(id)) {
    return new Response(JSON.stringify({ error: 'Invalid player ID' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    })
  }

  const player = await getPlayerById(c.env.DB, id)

  if (!player) {
    return new Response(JSON.stringify({ error: 'Player not found' }), {
      status: 404,
      headers: { 'content-type': 'application/json' },
    })
  }

  return new Response(JSON.stringify(player), {
    headers: {
      'content-type': 'application/json',
    },
  })
})

// 创建玩家
playerRoutes.post('/', async (c) => {
  try {
    const input = (await c.req.raw.json()) as CreatePlayerInput

    // 验证输入
    if (!input.name) {
      return new Response(JSON.stringify({ error: 'Name is required' }), {
        status: 400,
        headers: { 'content-type': 'application/json' },
      })
    }

    const player = await createPlayer(c.env.DB, input)
    return new Response(JSON.stringify(player), {
      status: 201,
      headers: { 'content-type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to create player' }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    })
  }
})

export default playerRoutes
