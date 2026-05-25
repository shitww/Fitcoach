# FitCoach — XFITX AI Fitness Coach

## 项目结构

```
FitCoach/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/                # REST API 路由
│   │   │   ├── auth/           # NextAuth 端点
│   │   │   ├── food-logs/      # 饮食日志
│   │   │   ├── foods/          # 食物数据库
│   │   │   ├── nutrition-goals/
│   │   │   ├── workouts/
│   │   │   ├── exercises/
│   │   │   ├── plans/
│   │   │   ├── analysis/
│   │   │   └── water-logs/
│   │   ├── diet/               # 饮食记录页
│   │   ├── workout/            # 训练页
│   │   ├── history/            # 训练历史
│   │   ├── analytics/          # 数据分析
│   │   ├── exercises/          # 动作库
│   │   ├── profile/            # 个人中心
│   │   ├── settings/           # 设置
│   │   ├── plans/              # 训练计划
│   │   ├── auth/               # 登录/注册
│   │   └── page.tsx            # 首页
│   ├── components/             # React 组件
│   │   ├── ai-coaching/        # AI 分析组件
│   │   ├── FoodSearch.tsx      # 食物搜索
│   │   ├── ExercisePicker.tsx
│   │   └── FloatingTimer.tsx
│   ├── lib/                    # 工具函数 & 服务
│   │   ├── prisma.ts           # Prisma client 单例
│   │   ├── auth.ts             # NextAuth 配置
│   │   ├── calc.ts             # 营养/训练计算
│   │   ├── workout-service.ts
│   │   └── ...
│   ├── core/                   # 核心业务逻辑
│   │   ├── analysis.ts         # 训练趋势分析
│   │   └── calc.ts             # 1RM 计算
│   ├── types/                  # TypeScript 类型扩展
│   ├── stores/                 # 状态管理 (Zustand)
│   └── proxy.ts                # Next.js 路由守卫 (Next.js 16 proxy convention)
├── prisma/
│   ├── schema.prisma           # 数据库 Schema
│   ├── migrations/             # 迁移历史
│   ├── seed.ts                 # 演示账号种子
│   └── seed-foods.ts           # 食物数据种子
├── public/                     # 静态资源
├── scripts/
│   ├── seed-exercises.cjs      # 动作库导入脚本
│   ├── create-user.js
│   └── debug/                  # 历史调试脚本 (gitignored)
├── docs/                       # 开发文档
├── .env.example                # 环境变量模板
└── next.config.ts
```

---

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
