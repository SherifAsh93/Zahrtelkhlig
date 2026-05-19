'use client'
import { useActionState } from 'react'
import { adminLogin } from '@/app/actions/auth'
import { Button } from '@/components/ui/Button'
import { useState } from 'react'
import { Eye, EyeOff, ShieldCheck } from 'lucide-react'

export default function AdminLoginPage() {
  const [state, action, pending] = useActionState(adminLogin, undefined)
  const [showPass, setShowPass] = useState(false)

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4" dir="rtl">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <ShieldCheck size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 font-cairo">لوحة التحكم</h1>
          <p className="text-gray-500 font-cairo text-sm mt-1">أدخل كلمة المرور للدخول</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <form action={action} className="space-y-5">
            {state?.error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm font-cairo text-center">
                {state.error}
              </div>
            )}

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
                  autoFocus
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 font-cairo pl-10 text-center tracking-widest"
                  placeholder="••••••"
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
              دخول
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
