"use client"

/**
 * AmbientGlow — 环境光背景层
 * 在页面顶部投射主题 Accent 颜色的径向渐变光晕
 */
export function AmbientGlow() {
  return (
    <div
      className="fixed inset-0 pointer-events-none"
      style={{
        background: 'radial-gradient(ellipse 60% 40% at 50% 0%, var(--accent-dim) 0%, transparent 60%)',
      }}
    />
  )
}
