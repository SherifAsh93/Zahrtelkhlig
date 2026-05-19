'use server'
import { redirect } from 'next/navigation'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { createSession, deleteSession } from '@/lib/session'

export async function login(
  _: unknown,
  formData: FormData,
): Promise<{ error?: string }> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return { error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' }

  const valid = await bcrypt.compare(password, user.password)
  if (!valid) return { error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' }

  await createSession({ userId: user.id, email: user.email, role: user.role, name: user.name })
  redirect('/')
}

export async function register(
  _: unknown,
  formData: FormData,
): Promise<{ error?: string }> {
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const phone = formData.get('phone') as string

  if (!name || !email || !password) return { error: 'جميع الحقول مطلوبة' }
  if (password.length < 6) return { error: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' }

  const exists = await prisma.user.findUnique({ where: { email } })
  if (exists) return { error: 'البريد الإلكتروني مستخدم بالفعل' }

  const hashed = await bcrypt.hash(password, 12)
  const user = await prisma.user.create({
    data: { name, email, password: hashed, phone: phone || null },
  })

  await createSession({ userId: user.id, email: user.email, role: user.role, name: user.name })
  redirect('/')
}

export async function logout() {
  await deleteSession()
  redirect('/login')
}

export async function adminLogin(
  _: unknown,
  formData: FormData,
): Promise<{ error?: string }> {
  const password = formData.get('password') as string
  if (password !== '114891') return { error: 'كلمة المرور غير صحيحة' }

  const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } })
  if (!admin) return { error: 'لا يوجد حساب مدير' }

  await createSession({ userId: admin.id, email: admin.email, role: admin.role, name: admin.name })
  redirect('/admin')
}
