export interface AuthContext {
  isAuthenticated: boolean
  userId?: string
}

export async function authenticate(request: Request): Promise<AuthContext> {
  // 从请求头中获取 token
  const token = request.headers.get('Authorization')?.replace('Bearer ', '')

  if (!token) {
    return { isAuthenticated: false }
  }

  // 简单判断 token 是否存在
  return {
    isAuthenticated: true,
    userId: token,
  }
}

export async function requireAuth(request: Request): Promise<Response | null> {
  const auth = await authenticate(request)

  if (!auth.isAuthenticated) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'content-type': 'application/json' },
    })
  }

  return null
}
