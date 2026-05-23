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
  const redirectTo = (formData.get('redirect') as string) || '/'

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return { error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' }

  const valid = await bcrypt.compare(password, user.password)
  if (!valid) return { error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' }

  await createSession({ userId: user.id, email: user.email, role: user.role, name: user.name })
  redirect(redirectTo)
}

export async function register(
  _: unknown,
  formData: FormData,
): Promise<{ error?: string }> {
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const phone = formData.get('phone') as string
  const redirectTo = (formData.get('redirect') as string) || '/'

  if (!name || !email || !password) return { error: 'جميع الحقول مطلوبة' }
  if (password.length < 6) return { error: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' }

  const exists = await prisma.user.findUnique({ where: { email } })
  if (exists) return { error: 'البريد الإلكتروني مستخدم بالفعل' }

  const hashed = await bcrypt.hash(password, 12)
  const user = await prisma.user.create({
    data: { name, email, password: hashed, phone: phone || null },
  })

  await createSession({ userId: user.id, email: user.email, role: user.role, name: user.name })
  redirect(redirectTo)
}

export async function logout() {
  await deleteSession()
  redirect('/login')
}

export async function adminLogout() {
  await deleteSession()
  redirect('/admin')
}

export async function adminLogin(
  _: unknown,
  formData: FormData,
): Promise<{ error?: string } | undefined> {
  const password = formData.get('password') as string
  if (password !== '114891') return { error: 'كلمة المرور غير صحيحة' }

  const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } })
  if (!admin) return { error: 'لا يوجد حساب مدير' }

  await createSession({ userId: admin.id, email: admin.email, role: admin.role, name: admin.name })
  redirect('/admin')
}

// POS login: accepts STAFF (by username) or ADMIN (by password)
export async function posLogin(
  _: unknown,
  formData: FormData,
): Promise<{ error?: string } | undefined> {
  const username = formData.get('username') as string
  const password = formData.get('password') as string

  if (!username || !password) return { error: 'أدخل اسم المستخدم وكلمة المرور' }

  // Admin can log in with username "admin" + their password
  if (username.toLowerCase() === 'admin') {
    if (password !== '114891') return { error: 'كلمة المرور غير صحيحة' }
    const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } })
    if (!admin) return { error: 'لا يوجد حساب مدير' }
    await createSession({ userId: admin.id, email: admin.email, role: admin.role, name: admin.name })
    redirect('/pos')
  }

  // Staff login by username
  const staff = await prisma.user.findUnique({ where: { username } })
  if (!staff || staff.role !== 'STAFF') return { error: 'اسم المستخدم غير صحيح' }

  const valid = await bcrypt.compare(password, staff.password)
  if (!valid) return { error: 'كلمة المرور غير صحيحة' }

  await createSession({ userId: staff.id, email: staff.email, role: staff.role, name: staff.name })
  redirect('/pos')
}

export async function posLogout() {
  await deleteSession()
  redirect('/pos')
}

// Owner (Ashraf) login — password stored in SiteSettings key "owner_password"
export async function ownerLogin(
  _: unknown,
  formData: FormData,
): Promise<{ error?: string } | undefined> {
  const password = formData.get('password') as string
  if (!password) return { error: 'أدخل كلمة المرور' }

  const setting = await prisma.siteSettings.findUnique({ where: { key: 'owner_password' } })
  const storedPassword = setting?.value ?? 'ashraf2024'

  if (password !== storedPassword) return { error: 'كلمة المرور غير صحيحة' }

  await createSession({ userId: 'owner', email: 'owner@zahrtelkhlig.com', role: 'OWNER', name: 'أشرف' })
  redirect('/owner')
}

export async function ownerLogout() {
  await deleteSession()
  redirect('/owner')
}

// Admin: create a staff account
export async function createStaffAccount(
  _: unknown,
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  const name = formData.get('name') as string
  const username = formData.get('username') as string
  const password = formData.get('password') as string

  if (!name || !username || !password) return { error: 'جميع الحقول مطلوبة' }
  if (password.length < 6) return { error: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' }
  if (!/^[a-z0-9_]+$/.test(username)) return { error: 'اسم المستخدم: حروف إنجليزية صغيرة وأرقام فقط' }

  const exists = await prisma.user.findUnique({ where: { username } })
  if (exists) return { error: 'اسم المستخدم مستخدم بالفعل' }

  const hashed = await bcrypt.hash(password, 12)
  await prisma.user.create({
    data: {
      name,
      username,
      email: `${username}@staff.zahrtelkhlig`,
      password: hashed,
      role: 'STAFF',
    },
  })

  return { success: true }
}

// Admin: delete a user
export async function deleteUser(userId: string): Promise<{ error?: string; success?: boolean }> {
  try {
    // Nullify order userId so orders remain
    await prisma.order.updateMany({ where: { userId }, data: { userId: null } })
    await prisma.cartItem.deleteMany({ where: { userId } })
    await prisma.wishlist.deleteMany({ where: { userId } })
    await prisma.user.delete({ where: { id: userId } })
    return { success: true }
  } catch {
    return { error: 'فشل حذف المستخدم' }
  }
}

// Admin: update user info
export async function updateUser(
  userId: string,
  data: { name: string; phone?: string; address?: string; city?: string; role?: string },
): Promise<{ error?: string; success?: boolean }> {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name,
        phone: data.phone || null,
        address: data.address || null,
        city: data.city || null,
        ...(data.role && { role: data.role as 'USER' | 'STAFF' | 'OWNER' | 'ADMIN' }),
      },
    })
    return { success: true }
  } catch {
    return { error: 'فشل تحديث البيانات' }
  }
}
