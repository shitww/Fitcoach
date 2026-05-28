import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'XFITX - AI 健身私人教练',
    short_name: 'XFITX',
    description: '智能健身训练记录与数据分析',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#000000',
    theme_color: '#000000',
    categories: ['health', 'fitness', 'sports'],
    shortcuts: [
      {
        name: '开始训练',
        short_name: '训练',
        description: '选择训练模式，立即开始',
        url: '/workout',
        icons: [{ src: '/icon', sizes: '96x96' }],
      },
      {
        name: '记录饮食',
        short_name: '饮食',
        description: '记录今日饮食摄入',
        url: '/diet',
        icons: [{ src: '/icon', sizes: '96x96' }],
      },
      {
        name: 'AI 教练',
        short_name: 'AI',
        description: '与 AI 私人教练对话',
        url: '/chat',
        icons: [{ src: '/icon', sizes: '96x96' }],
      },
    ],
    icons: [
      {
        src: '/icon',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }
}
