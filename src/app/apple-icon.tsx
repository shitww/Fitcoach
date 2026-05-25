import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#000000',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            color: '#CCFF00',
            fontSize: '110px',
            fontWeight: 900,
            fontFamily: 'ui-sans-serif, system-ui, sans-serif',
            letterSpacing: '-5px',
            lineHeight: 1,
          }}
        >
          X
        </div>
      </div>
    ),
    { ...size },
  )
}
