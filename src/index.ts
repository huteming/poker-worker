import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { bearerAuth } from 'hono/bearer-auth'
import { logger } from 'hono/logger'
import { Env } from './types'
import gameRecordRoutes from './routes/game-record'
import playerRoutes from './routes/player'

const app = new Hono<{ Bindings: Env }>().basePath('/poker/v1')

app.use(logger())

// CORS 配置
app.use(
  '*',
  cors({
    origin: '*',
    allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'Accept', 'Accept-Charset'],
    exposeHeaders: ['Content-Length', 'Content-Type'],
    maxAge: 600,
  }),
)

// 认证中间件
app.use('*', async (c, next) => {
  const middleware = bearerAuth({ token: c.env.API_TOKEN })
  return middleware(c, next)
})

app.route('/players', playerRoutes)
app.route('/game-records', gameRecordRoutes)

app.get('/health', (c) => {
  return c.json({ status: 'ok' })
})

app.notFound((c) => {
  return c.html('Welcome to Poker API')
})

export default app
