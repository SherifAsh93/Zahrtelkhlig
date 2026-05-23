'use client'
import { useActionState, useState } from 'react'
import { posLogin } from '@/app/actions/auth'
import { Eye, EyeOff, ShoppingCart, User } from 'lucide-react'

export default function POSLoginView() {
  const [state, action, pending] = useActionState(posLogin, undefined)
  const [showPass, setShowPass] = useState(false)

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4" dir="rtl">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <ShoppingCart size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white font-cairo">نقطة البيع</h1>
          <p className="text-gray-400 font-cairo text-sm mt-1">زهرة الخليج</p>
        </div>

        <div className="bg-gray-800 rounded-2xl border border-gray-700 p-8">
          <form action={action} className="space-y-5">
            {state?.error && (
              <div className="p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-400 text-sm font-cairo text-center">
                {state.error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-300 font-cairo mb-1.5">اسم المستخدم</label>
              <div className="relative">
                <input
                  name="username"
                  type="text"
                  required
                  autoFocus
                  autoComplete="username"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-cairo pl-10"
                  placeholder="أدخل اسم المستخدم"
                />
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 font-cairo mb-1.5">كلمة المرور</label>
              <div className="relative">
                <input
                  name="password"
                  type={showPass ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-cairo pl-10"
                  placeholder="••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={pending}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold font-cairo rounded-xl transition-colors disabled:opacity-50"
            >
              {pending ? 'جاري الدخول...' : 'دخول'}
            </button>
          </form>
        </div>

        <p className="text-center text-gray-600 text-xs font-cairo mt-4">
          للمديرين: اسم المستخدم &ldquo;admin&rdquo; + كلمة المرور الخاصة
        </p>
      </div>
    </div>
  )
}
