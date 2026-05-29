"use client"

import { Suspense, useState, useEffect } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Dumbbell, Mail, Lock, Loader2, CheckCircle, ArrowLeft } from "lucide-react"

function SignInContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const registered = searchParams.get('registered')

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [initLoading, setInitLoading] = useState(false)

  useEffect(() => {
    initDemoUser()
  }, [])

  const initDemoUser = async () => {
    setInitLoading(true)
    try { await fetch('/api/init', { method: 'POST', credentials: 'include' }) } catch (e) {}
    finally { setInitLoading(false) }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const result = await signIn("credentials", { email, password, redirect: false })
      if (result?.error) { setError("邮箱或密码错误") }
      else { router.push("/"); router.refresh() }
    } catch (err) { setError("登录失败，请稍后重试") }
    finally { setLoading(false) }
  }

  const fillDemo = () => {
    setEmail("demo@fitcoach.com")
    setPassword("demo123")
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="relative w-full max-w-md">

        {/* Back */}
        <button onClick={() => router.push('/')}
          className="flex items-center gap-2 mb-8 transition-colors" style={{ color: 'rgba(255,255,255,0.35)' }}>
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">返回首页</span>
        </button>

        {/* Logo: X-FIT-X 居中 */}
        <div className="flex flex-col items-center mb-8">
          <svg width="120" height="56" viewBox="0 0 120 56" fill="none" xmlns="http://www.w3.org/2000/svg">
            <text x="0" y="44" fontFamily="'Space Grotesk', sans-serif" fontSize="48" fontWeight="900"
              fill="var(--accent)" style={{ filter: 'drop-shadow(0 0 8px var(--accent-glow))' }}>
              <tspan>X</tspan><tspan fill="#FFFFFF" letterSpacing="0.05em" fontWeight="800" fontSize="40">FIT</tspan><tspan>X</tspan>
            </text>
          </svg>
          <p className="mt-1" style={{ color: 'rgba(255,255,255,0.25)', letterSpacing: '0.3em', fontFamily: "'Space Grotesk', sans-serif" }}>
            AI FITNESS COACH
          </p>
        </div>

        {/* Registered notice */}
        {registered && (
          <div className="mb-6 p-4 rounded-2xl flex items-center gap-3" style={{ background: 'var(--accent-dim)', border: '1px solid var(--accent-glow)' }}>
            <CheckCircle className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--accent)' }} />
            <p className="text-sm" style={{ color: 'var(--accent)' }}>注册成功！请登录您的账号</p>
          </div>
        )}

        {/* Form */}
        <div className="rounded-2xl p-8" style={{ background: '#0a0a0a', border: '1px solid #1e1e1e' }}>
          <h2 className="text-2xl font-black mb-6">登录账号</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>邮箱地址</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'rgba(255,255,255,0.2)' }} />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com" required
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-foreground text-sm"
                  style={{ background: '#111', border: '1px solid #1e1e1e' }}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>密码</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'rgba(255,255,255,0.2)' }} />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="输入密码" required
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-foreground text-sm"
                  style={{ background: '#111', border: '1px solid #1e1e1e' }}
                />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl" style={{ background: 'var(--error-bg)', border: '1px solid var(--error-border)' }}>
                <p className="text-sm" style={{ color: 'var(--error-text)' }}>{error}</p>
              </div>
            )}

            <button type="submit" disabled={loading || initLoading}
              className="w-full py-3.5 rounded-xl font-bold text-base text-accent-foreground transition-all flex items-center justify-center gap-2"
              style={{ background: 'var(--accent)', boxShadow: '0 0 20px var(--accent-glow)' }}>
              {loading ? <><Loader2 className="w-5 h-5 animate-spin" />登录中…</> : initLoading ? <><Loader2 className="w-5 h-5 animate-spin" />初始化中…</> : "登录"}
            </button>
          </form>

          <p className="text-center mt-6" style={{ color: 'rgba(255,255,255,0.35)' }}>
            还没有账号？{" "}
            <Link href="/auth/signup" className="font-bold" style={{ color: 'var(--accent)' }}>立即注册</Link>
          </p>
        </div>

        {/* Demo */}
        <div className="mt-6 p-4 rounded-xl" style={{ background: '#0a0a0a', border: '1px solid #1e1e1e' }}>
          <p className="text-xs text-center mb-3" style={{ color: 'rgba(255,255,255,0.2)' }}>演示账号快速登录</p>
          <button onClick={fillDemo} disabled={initLoading}
            className="w-full py-2.5 rounded-lg text-sm font-semibold transition-all"
            style={{ background: '#111', color: 'rgba(255,255,255,0.5)' }}>
            {initLoading ? "初始化中…" : "填充演示账号"}
          </button>
          <p className="text-xs text-center mt-2" style={{ color: 'rgba(255,255,255,0.15)' }}>
            demo@fitcoach.com / demo123
          </p>
        </div>
      </div>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <SignInContent />
    </Suspense>
  )
}
