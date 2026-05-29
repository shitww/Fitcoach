"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Mail, Lock, User, Loader2, ArrowLeft } from "lucide-react"

export default function SignUpPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!name || !email || !password) { setError("请填写所有字段"); return; }
    if (password.length < 6) { setError("密码至少6位"); return; }
    if (password !== confirmPassword) { setError("两次密码不一致"); return; }
    setLoading(true)
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
        credentials: "include"
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || "注册失败"); return; }
      router.push("/auth/signin?registered=true")
    } catch (err) { setError("注册失败，请重试") }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="relative w-full max-w-md">

        {/* Logo: X-FIT-X 居中 */}
        <div className="flex flex-col items-center mb-8">
          <svg width="120" height="56" viewBox="0 0 120 56" fill="none" xmlns="http://www.w3.org/2000/svg">
            <text x="0" y="44" fontFamily="'Space Grotesk', sans-serif" fontSize="48" fontWeight="900"
              fill="var(--accent)" style={{ filter: 'drop-shadow(0 0 8px var(--accent-glow))' }}>
              <tspan>X</tspan><tspan fill="#FFFFFF" letterSpacing="0.05em" fontWeight="800" fontSize="40">FIT</tspan><tspan>X</tspan>
            </text>
          </svg>
          <p className="mt-1" style={{ color: 'rgba(255,255,255,0.25)', letterSpacing: '0.3em', fontFamily: "'Space Grotesk', sans-serif" }}>
            SMART FITNESS SYSTEM
          </p>
        </div>

        {/* Form */}
        <div className="rounded-2xl p-8" style={{ background: '#0a0a0a', border: '1px solid #1e1e1e' }}>
          <h2 className="text-2xl font-black mb-6">注册账号</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>姓名</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'rgba(255,255,255,0.2)' }} />
                <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="你的名字" required
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-foreground text-sm"
                  style={{ background: '#111', border: '1px solid #1e1e1e' }}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>邮箱</label>
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
                  placeholder="至少6位" required
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-foreground text-sm"
                  style={{ background: '#111', border: '1px solid #1e1e1e' }}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>确认密码</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'rgba(255,255,255,0.2)' }} />
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="再次输入密码" required
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

            <button type="submit" disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-base text-accent-foreground transition-all flex items-center justify-center gap-2"
              style={{ background: 'var(--accent)', boxShadow: '0 0 20px var(--accent-glow)' }}>
              {loading ? <><Loader2 className="w-5 h-5 animate-spin" />注册中…</> : "注册"}
            </button>
          </form>

          <p className="text-center mt-6" style={{ color: 'rgba(255,255,255,0.35)' }}>
            已有账号？{" "}
            <Link href="/auth/signin" className="font-bold" style={{ color: 'var(--accent)' }}>立即登录</Link>
          </p>
        </div>

        <p className="text-center mt-6 text-xs" style={{ color: 'rgba(255,255,255,0.15)' }}>
          注册即表示同意我们的服务条款和隐私政策
        </p>
      </div>
    </div>
  )
}
