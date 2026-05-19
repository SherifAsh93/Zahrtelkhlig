'use client'
import { useActionState } from 'react'
import Link from 'next/link'
import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { login } from '@/app/actions/auth'
import { Button } from '@/components/ui/Button'

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, undefined)
  const [showPass, setShowPass] = useState(false)

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4" dir="rtl">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-brand-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl font-cairo">ز</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 font-cairo">أهلاً بعودتك</h1>
          <p className="text-gray-500 font-cairo mt-1">سجلي دخولك للوصول إلى حسابك</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <form action={action} className="space-y-5">
            {state?.error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm font-cairo">
                {state.error}
              </div>
            )}

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
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 font-cairo mb-1.5">
                كلمة المرور
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPass ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 font-cairo pl-10"
                  placeholder="كلمة المرور"
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
              تسجيل الدخول
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 font-cairo mt-6">
            ليس لديك حساب؟{' '}
            <Link href="/register" className="text-brand-600 font-medium hover:underline">
              سجلي الآن
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
