import { createElement as e } from 'react'
import { ImageResponse } from 'next/og'
import { type NextRequest } from 'next/server'

export const runtime = 'edge'

const MAX_DIM = 2796

export function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const w = Math.min(Math.max(Number(searchParams.get('w')) || 1170, 320), MAX_DIM)
  const h = Math.min(Math.max(Number(searchParams.get('h')) || 2532, 568), MAX_DIM)

  const logoSize = Math.round(w * 0.22)
  const subtitleSize = Math.round(w * 0.038)
  const gap = String(Math.round(w * 0.04)) + 'px'
  const letterStyle = (color: string) => ({
    color,
    fontSize: logoSize,
    fontWeight: 900,
    fontFamily: 'ui-sans-serif, system-ui, sans-serif',
    lineHeight: 1,
  })

  return new ImageResponse(
    e('div', {
      style: {
        background: '#000000',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap,
      },
    },
      e('div', { style: { display: 'flex', flexDirection: 'row', alignItems: 'baseline' } },
        e('span', { style: letterStyle('#CCFF00') }, 'X'),
        e('span', { style: letterStyle('#ffffff') }, 'FIT'),
        e('span', { style: letterStyle('#CCFF00') }, 'X'),
      ),
      e('div', {
        style: {
          color: 'rgba(255,255,255,0.30)',
          fontSize: subtitleSize,
          fontWeight: 400,
          fontFamily: 'ui-sans-serif, system-ui, sans-serif',
          letterSpacing: '0.08em',
        },
      }, 'AI 健身私人教练'),
    ),
    {
      width: w,
      height: h,
      headers: {
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
      },
    },
  )
}
