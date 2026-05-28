export default function PageSkeleton() {
  return (
    <div
      style={{
        minHeight: '100svh',
        background: '#000',
        padding: '16px',
        paddingBottom: '80px',
      }}
    >
      {/* Top bar */}
      <div style={{ height: 28, width: 120, borderRadius: 8, background: 'rgba(255,255,255,0.08)', marginBottom: 24 }} />

      {/* Cards */}
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          style={{
            height: 96,
            borderRadius: 16,
            background: 'rgba(255,255,255,0.06)',
            marginBottom: 12,
            animation: 'pulse 1.5s ease-in-out infinite',
          }}
        />
      ))}

      {/* List rows */}
      {[1, 2, 3, 4].map((i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.06)', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ height: 14, width: '60%', borderRadius: 6, background: 'rgba(255,255,255,0.08)', marginBottom: 8 }} />
            <div style={{ height: 11, width: '40%', borderRadius: 6, background: 'rgba(255,255,255,0.05)' }} />
          </div>
        </div>
      ))}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  )
}
