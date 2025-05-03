import { describe, it, expect } from 'vitest'
import app from '../src/index'

describe('Health Check API', () => {
  it('GET /poker/v1/health should return 200 and correct response', async () => {
    // 创建测试环境
    const env = {
      API_TOKEN: '1234567890',
      DB: {}, // 这里可以添加你的 D1 数据库 mock
      ENVIRONMENT: 'test' as const,
    }

    // 创建请求
    const req = new Request('http://localhost/poker/v1/health', {
      headers: {
        Authorization: `Bearer ${env.API_TOKEN}`,
      },
    })

    // 发送请求
    const res = await app.fetch(req, env)

    // 验证状态码
    expect(res.status).toBe(200)

    // 验证响应内容
    const data = await res.json()
    expect(data).toEqual({ status: 'ok' })
  })

  it('GET /poker/v1/health without auth should return 401', async () => {
    const env = {
      API_TOKEN: '1234567890',
      DB: {},
      ENVIRONMENT: 'test' as const,
    }

    const req = new Request('http://localhost/poker/v1/health')

    const res = await app.fetch(req, env)

    expect(res.status).toBe(401)
  })
})
