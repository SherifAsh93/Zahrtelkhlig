'use client'
import { useActionState, useState } from 'react'
import Link from 'next/link'
import { Eye, EyeOff } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { register } from '@/app/actions/auth'
import { Button } from '@/components/ui/Button'
import { Suspense } from 'react'

function RegisterForm() {
  const [state, action, pending] = useActionState(register, undefined)
  const [showPass, setShowPass] = useState(false)
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/'
  const fromCheckout = redirect === '/checkout'

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4" dir="rtl">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img
            src="https://cdn.jsdelivr.net/gh/SherifAsh93/Zahrtelkhlig@main/public/images/logo.jpg"
            alt="زهرة الخليج"
            className="w-16 h-16 rounded-full object-cover mx-auto mb-4 border-2 border-brand-100"
          />
          <h1 className="text-2xl font-bold text-gray-900 font-cairo">إنشاء حساب جديد</h1>
          <p className="text-gray-500 font-cairo mt-1">انضمي لعائلة زهرة الخليج</p>
        </div>

        {fromCheckout && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm font-cairo text-center">
            أنشئي حسابك لإتمام الشراء 🛍️
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <form action={action} className="space-y-5">
            <input type="hidden" name="redirect" value={redirect} />

            {state?.error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm font-cairo">
                {state.error}
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 font-cairo mb-1.5">
                الاسم الكامل
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 font-cairo"
                placeholder="اسمك الكامل"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 font-cairo mb-1.5">
                البريد الإلكتروني
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 font-cairo"
                placeholder="example@email.com"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 font-cairo mb-1.5">
                رقم الهاتف
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 font-cairo"
                placeholder="01XXXXXXXXX"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 font-cairo mb-1.5">
                كلمة المرور
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPass ? 'text' : 'password'}
                  required
                  minLength={6}
                  autoComplete="new-password"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 font-cairo pl-10"
                  placeholder="على الأقل 6 أحرف"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <Button type="submit" loading={pending} className="w-full py-3" size="lg">
              إنشاء الحساب
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 font-cairo mt-6">
            لديك حساب بالفعل؟{' '}
            <Link href={`/login${redirect !== '/' ? `?redirect=${redirect}` : ''}`} className="text-brand-600 font-medium hover:underline">
              سجلي الدخول
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  )
}
