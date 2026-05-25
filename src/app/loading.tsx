export default function Loading() {
  return (
    <div
      style={{
        minHeight: '100svh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#000000',
      }}
    >
      {/* Border-based spinner — no external dependency, matches brand accent */}
      <div
        className="animate-spin"
        style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          border: '3px solid rgba(204,255,0,0.15)',
          borderTopColor: '#CCFF00',
        }}
        role="status"
        aria-label="加载中"
      />
    </div>
  )
}
