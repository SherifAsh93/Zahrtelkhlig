'use client'
import { useActionState, useState } from 'react'
import { ownerLogin } from '@/app/actions/auth'
import { Eye, EyeOff } from 'lucide-react'

export default function OwnerLoginView() {
  const [state, action, pending] = useActionState(ownerLogin, undefined)
  const [showPass, setShowPass] = useState(false)

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'linear-gradient(135deg, #1a0a0f 0%, #2d1520 50%, #1a0a0f 100%)' }}
      dir="rtl"
    >
      {/* Decorative background pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #c8956c, transparent)' }} />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #8b5e52, transparent)' }} />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <div
            className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-2xl"
            style={{ background: 'linear-gradient(135deg, #c8956c, #8b5e52)' }}
          >
            <span className="text-white font-bold text-3xl font-cairo">ز</span>
          </div>
          <h1 className="text-3xl font-bold text-white font-cairo tracking-wide">زهرة الخليج</h1>
          <p className="text-sm mt-2 font-cairo" style={{ color: '#c8956c' }}>لوحة المالك</p>
        </div>

        {/* Card */}
        <div
          className="rounded-3xl border p-8 shadow-2xl"
          style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(200,149,108,0.2)', backdropFilter: 'blur(20px)' }}
        >
          <p className="text-white font-cairo text-lg font-semibold mb-1">مرحباً أشرف</p>
          <p className="text-gray-400 font-cairo text-sm mb-6">أدخل كلمة المرور للوصول إلى التقارير</p>

          <form action={action} className="space-y-5">
            {state?.error && (
              <div
                className="p-3 rounded-xl text-sm font-cairo text-center"
                style={{ background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.3)', color: '#fca5a5' }}
              >
                {state.error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium font-cairo mb-2" style={{ color: '#c8956c' }}>
                كلمة المرور
              </label>
              <div className="relative">
                <input
                  name="password"
                  type={showPass ? 'text' : 'password'}
                  required
                  autoFocus
                  className="w-full px-4 py-3.5 rounded-xl text-white text-sm font-cairo pl-11 focus:outline-none focus:ring-2 transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(200,149,108,0.3)',
                  }}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={pending}
              className="w-full py-3.5 rounded-xl text-white font-bold font-cairo transition-all disabled:opacity-50 shadow-lg"
              style={{ background: 'linear-gradient(135deg, #c8956c, #8b5e52)' }}
            >
              {pending ? 'جاري الدخول...' : 'دخول'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
