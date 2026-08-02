import 'server-only'
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

export type SessionPayload = {
  userId: string
  email: string
  role: string
  name: string
}

const secretKey = process.env.SESSION_SECRET!
const encodedKey = new TextEncoder().encode(secretKey)

export async function encrypt(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(encodedKey)
}

export async function decrypt(session: string | undefined = '') {
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ['HS256'],
    })
    return payload as SessionPayload
  } catch {
    return null
  }
}

export async function createSession(payload: SessionPayload) {
  const token = await encrypt(payload)
  const cookieStore = await cookies()
  cookieStore.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies()
  const session = cookieStore.get('session')?.value
  if (!session) return null
  return decrypt(session)
}

export async function deleteSession() {
  const cookieStore = await cookies()
  cookieStore.delete('session')
}

// ── Admin-only session (separate cookie, password-gated independently) ──

export async function createAdminSession() {
  const token = await encrypt({
    userId: 'admin',
    email: 'admin@zahrtelkhlig.com',
    role: 'ADMIN',
    name: 'مدير النظام',
  })
  const cookieStore = await cookies()
  cookieStore.set('admin_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 8, // 8 hours
    path: '/',
  })
}

export async function getAdminSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies()
  const raw = cookieStore.get('admin_session')?.value
  if (!raw) return null
  const payload = await decrypt(raw)
  if (!payload || payload.role !== 'ADMIN') return null
  return payload
}

export async function deleteAdminSession() {
  const cookieStore = await cookies()
  cookieStore.delete('admin_session')
}

// ── Shared guard for product-management actions (create product, upload
// image, browse media library) that both the admin panel AND POS staff may
// perform. Admin gets full reach via admin_session; POS staff (STAFF/ADMIN
// role) get the same capability, but attributed to their name so admin can
// see who added what. ──
export async function getProductManagerSession(): Promise<{ name: string | null } | null> {
  const admin = await getAdminSession()
  if (admin) return { name: null }
  const session = await getSession()
  if (session && (session.role === 'STAFF' || session.role === 'ADMIN')) {
    return { name: session.name }
  }
  return null
}
