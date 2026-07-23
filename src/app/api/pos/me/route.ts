import { getSession } from '@/lib/session'

export async function GET() {
  const session = await getSession()
  if (!session || (session.role !== 'ADMIN' && session.role !== 'STAFF')) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return Response.json({ name: session.name, role: session.role })
}
