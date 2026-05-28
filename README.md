# FitCoach — XFITX AI 智能健身教练

> 面向中文用户的 AI 驱动全栈健身应用，覆盖训练执行、饮食管理、身体数据追踪与 AI 教练对话。

---

## 项目介绍

FitCoach 是一款移动优先的 Web 健身助手，核心理念是让每个人都拥有一位随身 AI 私教。主要能力：

- **训练执行引擎**：实时组/次计数、间歇计时、休息倒计时、PR 识别，支持力量、有氧、恢复三种训练模式
- **AI 教练**：基于通义千问（Qwen）的对话教练，结合 RAG 知识库提供个性化建议与训练后反馈
- **饮食管理**：食物搜索、拍照识别、营养目标设定、饮食周报 AI 分析、碳水循环计划
- **数据分析**：训练量趋势、肌肉群分布、连续打卡统计、体测数据记录
- **PWA 支持**：Service Worker + 离线缓存，可安装到手机主屏幕使用

---

## 技术栈

| 层级 | 技术 |
|------|------|
| 框架 | [Next.js 15](https://nextjs.org) (App Router) + React 19 |
| 语言 | TypeScript 5 |
| 样式 | TailwindCSS 4 + CSS 变量主题系统 |
| 组件 | Radix UI + Lucide React 图标 |
| 动画 | Framer Motion 12 |
| 状态管理 | Zustand 5（训练运行时）+ React Context（主题） |
| 离线存储 | Dexie 4（IndexedDB，食物缓存） |
| 数据库 | PostgreSQL（生产：Supabase）+ Prisma 6 ORM |
| 认证 | NextAuth v5（JWT 策略） |
| AI / LLM | 阿里云 DashScope — 通义千问 `qwen-plus` / `qwen-turbo` / `qwen-vl-plus`（视觉） |
| 图表 | Recharts 3 |
| 包管理 | pnpm 10 |
| 部署 | Netlify（`@netlify/plugin-nextjs`）/ Vercel |

---

## 环境要求

| 工具 | 版本要求 |
|------|---------|
| Node.js | **>= 24**（见 `.node-version`） |
| pnpm | **>= 10**（`packageManager` 字段锁定） |
| PostgreSQL | >= 14（本地开发可用 Docker；生产推荐 Supabase） |
| DashScope API Key | 申请地址：[dashscope.aliyun.com](https://dashscope.aliyun.com)（免费额度 1M tokens/月） |

---

## 安装依赖

```bash
# 克隆仓库
git clone <repo-url>
cd FitCoach

# 安装 Node 依赖（严格使用 pnpm，不要用 npm/yarn）
pnpm install

# 复制环境变量模板并填写
cp .env.example .env.local
```

**`.env.local` 必填项：**

```env
# 生产/Supabase Transaction Pooler（pgBouncer）
DATABASE_URL="postgresql://<user>:<password>@*.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Prisma 迁移专用直连（不走 pooler）
DIRECT_URL="postgresql://postgres:<password>@db.<ref>.supabase.co:5432/postgres"

# 本地开发可直接用同一个 URL，无需区分
# DATABASE_URL="postgresql://postgres:password@localhost:5432/fitcoach"
# DIRECT_URL="postgresql://postgres:password@localhost:5432/fitcoach"

AUTH_SECRET="至少32位随机字符串"
NEXTAUTH_URL="http://localhost:3000"

DASHSCOPE_API_KEY="sk-..."
```

**初始化数据库：**

```bash
# 应用迁移（首次）
pnpm db:migrate

# 生成 Prisma Client（迁移后或 schema 变更后）
pnpm db:generate

# 导入基础动作库（中文数据）
npx tsx prisma/seed-exercises-cn.ts

# 导入食物数据库（中文）
npx tsx prisma/seed-foods-cn.ts
```

---

## 本地启动

```bash
# 开发模式（绑定 0.0.0.0，局域网手机可访问）
pnpm dev
```

启动后：
- 本机访问：`http://localhost:3000`
- 手机/局域网：`http://<本机IP>:3000`

其他常用命令：

```bash
pnpm build        # 生产构建
pnpm start        # 启动生产服务
pnpm lint         # ESLint 检查
pnpm db:studio    # 打开 Prisma Studio（可视化数据库）
pnpm db:push      # 直接推送 schema（跳过迁移，适合快速原型）
```

---

## 打包部署

### Netlify（推荐）

项目已包含 `netlify.toml`，直接连接 Git 仓库即可自动部署：

```toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "24"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

在 Netlify 控制台配置与 `.env.local` 相同的环境变量后，推送到主分支即触发部署。

### Vercel

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录并部署
vercel --prod
```

Vercel 会自动识别 Next.js 项目，在项目设置中填写环境变量即可。

> **注意**：生产环境 `DATABASE_URL` 必须使用 Supabase Transaction Pooler（pgBouncer），并带 `?pgbouncer=true` 参数，否则 Serverless 函数会因连接数耗尽报错。

---

## 访问地址

| 环境 | 地址 |
|------|------|
| 本地开发 | `http://localhost:3000` |
| 局域网手机测试 | `http://<本机IP>:3000` |
| Prisma Studio | `http://localhost:5555` |
| 生产（Netlify） | 由 Netlify 分配，可自定义域名 |
| 生产（Vercel） | 由 Vercel 分配，可自定义域名 |

**主要页面路由：**

| 路由 | 说明 |
|------|------|
| `/` | 仪表盘（今日训练 + 打卡连续天数 + 营养快照） |
| `/intent` | 训练意图选择（力量/有氧/恢复） |
| `/workout` | 训练执行主页 |
| `/diet` | 饮食记录 |
| `/diet-analysis` | 饮食分析与 AI 周报 |
| `/history` | 训练历史 |
| `/analytics` | 数据趋势分析 |
| `/exercises` | 动作库 |
| `/plans` | 训练计划 |
| `/chat` | AI 教练对话 |
| `/profile` | 个人中心 |
| `/settings` | 偏好设置 |
| `/auth/signin` | 登录 |

---

## 功能简介

### 训练执行
- 三种模式：**力量训练**（多动作 + 组间休息倒计时）、**有氧训练**（跑步机/踏步机，实时速度/坡度/卡路里统计）、**恢复训练**（引导式动作序列）
- 实时 1RM 估算、历史最佳记录对比、PR 自动标记
- 训练完成后 AI 生成反馈报告（基于 `qwen-plus`）

### AI 教练
- 全上下文对话，内置 RAG 知识库（运动科学 + 营养学文档）
- 三种教练人格：耐心型 / 直接型 / 激励型
- AI 事件注入系统（可在运行时动态调整训练参数）

### 饮食管理
- 食物数据库搜索（含中文食物）
- **拍照识别**：调用 `qwen-vl-plus` 视觉模型识别食物并估算营养
- 每日热量 / 蛋白质 / 碳水 / 脂肪追踪
- AI 饮食周报分析
- 碳水循环计划配置

### 数据分析
- 训练量趋势折线图
- 肌肉群分布雷达图
- 体测数据（体重/体脂/围度）时间轴
- 喝水记录
- 连续打卡统计

### PWA
- 离线访问（Service Worker 缓存策略）
- 可添加到手机主屏幕（`/manifest.ts` + Apple 图标）

---

## 项目结构

```
FitCoach/
├── src/
│   ├── app/                    # Next.js App Router 页面 & API
│   │   ├── api/                # REST API 路由（17 个模块）
│   │   ├── workout/            # 训练执行页 + 子组件
│   │   ├── diet/               # 饮食记录页
│   │   ├── analytics/          # 数据分析页
│   │   └── ...                 # 其他页面路由
│   ├── components/             # 可复用 React 组件
│   │   ├── workout/            # 训练专属组件（RestOverlay, ActiveExerciseCard 等）
│   │   └── ui/                 # 通用 UI 原件
│   ├── lib/
│   │   ├── ai/                 # 统一 LLM 调度层（orchestrator + providers + prompts + RAG）
│   │   └── ...                 # 其他工具库
│   ├── stores/                 # Zustand store（workoutTimer 运行时状态机）
│   ├── core/                   # 纯函数业务逻辑（1RM 计算、趋势分析）
│   └── types/                  # 全局 TypeScript 类型
├── prisma/
│   ├── schema.prisma           # 数据库 Schema（13 个模型）
│   └── migrations/             # 迁移历史
├── public/                     # 静态资源 + sw.js（Service Worker）
├── docs/                       # 开发文档与审计报告
├── .env.example                # 环境变量模板
└── next.config.ts
```

---

## 开发注意事项

### Next.js 版本
本项目使用 **Next.js 15**，与旧版本存在 Breaking Changes（如 `params` 需要 `await`、Turbopack 默认启用等）。在修改 App Router 相关代码前，请先阅读 `node_modules/next/dist/docs/` 中的对应指南。

### 包管理器
**必须使用 pnpm**，`package.json` 中通过 `packageManager` 字段锁定版本。使用 npm 或 yarn 会产生错误的 lockfile，请勿提交。

### 数据库连接
| 场景 | 应使用的 URL |
|------|-------------|
| 生产 / Serverless 运行时 | `DATABASE_URL`（pgBouncer Transaction Pooler） |
| `prisma migrate dev` | `DIRECT_URL`（直连，不走 pooler） |
| 本地开发 | 两者可指向同一个本地 PostgreSQL 实例 |

### AI API Key
`DASHSCOPE_API_KEY` 不得硬编码，必须通过环境变量注入。视觉识别接口（拍照识别食物）超时设置为 40s，请勿在 Vercel Hobby 计划（最大 10s）上使用。

### Service Worker
`public/sw.js` 在 `next.config.ts` 中配置了 `no-cache` 响应头，确保更新即时生效。本地开发时 Service Worker 可能缓存旧资源，遇到页面行为异常时先在 DevTools → Application → Service Workers 中点击 "Unregister"。

### ESLint
`eslint-config-next` v15.3.3 与 ESLint 9 flat config 存在已知兼容性问题（pre-existing），运行 `pnpm lint` 可能报配置警告，不影响构建。PR 提交前请至少确保 `tsc --noEmit` 零错误。

### 训练运行时状态机
训练执行逻辑集中在 `src/stores/workoutTimer.ts`（Zustand）+ `src/app/workout/` 目录。该模块维护一个 5 阶段状态机（`idle → exercise → rest → cardio → completed`），修改前需理解事件溯源结构（`src/lib/events/eventLog.ts`）。

### 数据库迁移
- 每次 `prisma schema.prisma` 变更后执行 `pnpm db:migrate`，**不要**直接用 `db:push` 跳过迁移历史
- 迁移文件一旦提交不得修改，需要回滚时创建新迁移
