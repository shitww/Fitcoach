import { ImageResponse } from 'next/og'

export const size = { width: 512, height: 512 }
export const contentType = 'image/png'

export default function Icon() {
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
            fontSize: '340px',
            fontWeight: 900,
            fontFamily: 'ui-sans-serif, system-ui, sans-serif',
            letterSpacing: '-16px',
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
