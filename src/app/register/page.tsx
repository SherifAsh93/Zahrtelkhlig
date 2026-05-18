'use client'
import { useActionState } from 'react'
import Link from 'next/link'
import { register } from '@/app/actions/auth'
import { Button } from '@/components/ui/Button'

export default function RegisterPage() {
  const [state, action, pending] = useActionState(register, undefined)

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4" dir="rtl">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl font-cairo">ز</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 font-cairo">إنشاء حساب جديد</h1>
          <p className="text-gray-500 font-cairo mt-1">انضمي لعائلة زهرة الخليج</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <form action={action} className="space-y-5">
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
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 font-cairo"
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
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 font-cairo"
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
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 font-cairo"
                placeholder="01XXXXXXXXX"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 font-cairo mb-1.5">
                كلمة المرور
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={6}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 font-cairo"
                placeholder="على الأقل 6 أحرف"
              />
            </div>

            <Button type="submit" loading={pending} className="w-full py-3" size="lg">
              إنشاء الحساب
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 font-cairo mt-6">
            لديك حساب بالفعل؟{' '}
            <Link href="/login" className="text-rose-600 font-medium hover:underline">
              سجلي الدخول
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
