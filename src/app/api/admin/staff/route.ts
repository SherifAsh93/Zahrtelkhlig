import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/session'
import bcrypt from 'bcryptjs'

async function adminGuard() {
  const session = await getAdminSession()
  if (!session) return null
  return session
}

export async function GET() {
  if (!await adminGuard()) return Response.json({ error: 'Forbidden' }, { status: 403 })
  const staff = await prisma.user.findMany({
    where: { role: 'STAFF' },
    select: { id: true, name: true, username: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  })
  return Response.json({ staff })
}

export async function POST(req: NextRequest) {
  if (!await adminGuard()) return Response.json({ error: 'Forbidden' }, { status: 403 })
  const { name, username, password } = await req.json()

  if (!name || !username || !password) return Response.json({ error: 'جميع الحقول مطلوبة' }, { status: 400 })
  if (password.length < 6) return Response.json({ error: 'كلمة المرور قصيرة' }, { status: 400 })
  if (!/^[a-z0-9_]+$/.test(username)) return Response.json({ error: 'اسم المستخدم: حروف إنجليزية صغيرة فقط' }, { status: 400 })

  const exists = await prisma.user.findUnique({ where: { username } })
  if (exists) return Response.json({ error: 'اسم المستخدم مستخدم بالفعل' }, { status: 400 })

  const hashed = await bcrypt.hash(password, 12)
  const staff = await prisma.user.create({
    data: {
      name,
      username,
      email: `${username}@staff.zahrtelkhlig`,
      password: hashed,
      role: 'STAFF',
    },
    select: { id: true, name: true, username: true, createdAt: true },
  })

  return Response.json({ success: true, staff })
}

export async function DELETE(req: NextRequest) {
  if (!await adminGuard()) return Response.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await req.json()
  await prisma.user.delete({ where: { id } })
  return Response.json({ success: true })
}
