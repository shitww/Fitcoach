# FitCoach (XFITX) 项目全面技术分析报告

**分析日期**: 2026-05-25
**分析范围**: `d:\FitCoach` 全项目代码、配置、日志、文档
**分析方法**: 静态代码审查 + 日志分析 + 架构推理（未执行运行时测试）

---

# 第一部分：项目问题诊断

## 一、错误来源分析

### 1.1 编译时错误：Server Component 中使用 `ssr: false` — **严重，阻塞性**

**错误信息**:
```
`ssr: false` is not allowed with `next/dynamic` in Server Components. 
Please move it into a Client Component.
```

**位置**: `src/app/layout.tsx` 第 13-15 行

**原始代码** (已定位到问题):
```typescript
// src/app/layout.tsx:13
const FloatingTimer = dynamic(() => import("@/components/FloatingTimer"), {
  ssr: false,
})
```

**原因分析**:
- `layout.tsx` 是 Server Component（没有 `"use client"` 指令），其中直接使用了 `next/dynamic` 的 `ssr: false` 选项
- Next.js 16 (Turbopack) 不允许在 Server Component 中使用此组合
- **修复验证**: 该问题已被正确修复——`FloatingTimer` 的 lazy loading 被移到了 `src/components/ClientProviders.tsx`（该文件第 11-13 行明确标记为 `"use client"`，正确使用了 `ssr: false`），`layout.tsx` 已移除该代码

**日志证据**: `dev-final.log.txt` 第 38-177 行显示此错误反复触发，导致页面返回 HTTP 500

**根因**: 这是一个典型的 AI 生成代码错误——LLM 将原本应放在 Client Component 中的 `next/dynamic` 代码错误地插入到了根 layout Server Component 中，说明代​​码生成时对 Next.js App Router 的 Server/Client Component 边界理解有误

---

### 1.2 运行时错误：不存在的函数导出 `getUserFromRequest` — **严重，已修复**

**错误信息** (来自 `docs/task-2026-04-20-auth-fix.md`):
```
Export getUserFromRequest doesn't exist in target module
```

**影响范围**: 10 个 API 路由文件

**原因分析**:
- 多个 API route 文件导入了不存在的 `getUserFromRequest` 函数
- `src/lib/auth.ts` 实际只导出 `{ handlers, signIn, signOut, auth }`
- `getUserFromRequest` 从未被定义——AI 在生成 API route 代码时假设了一个不存在的函数签名
- 修复方案正确：将所有引用替换为 `const session = await auth(); const userId = session?.user?.id;`

**涉及文件**:
| 文件 | 状态 |
|------|------|
| `src/app/api/workouts/route.ts` | ✅ 已修复 |
| `src/app/api/workouts/[id]/route.ts` | ✅ 已修复 |
| `src/app/api/analysis/summary/route.ts` | ✅ 已修复 |
| `src/app/api/analysis/trends/route.ts` | ✅ 已修复 |
| `src/app/api/analysis/personal-records/route.ts` | ✅ 已修复 |
| `src/app/api/exercises/route.ts` | ✅ 已修复 |
| `src/app/api/feedback/history/route.ts` | ✅ 已修复 |
| `src/app/api/feedback/generate/route.ts` | ✅ 已修复 |
| `src/app/api/auth/login/route.ts` | ✅ 已修复 |
| `src/app/api/auth/logout/route.ts` | ✅ 已修复 |

**注意**: 当前代码中部分文件（如 `src/app/api/workout/route.ts`）使用的是 `getDbUserId()`（来自 `@/lib/get-db-user`），这说明存在认证方式不统一的问题——有的用 `auth()` 有的用 `getDbUserId()`。

---

### 1.3 运行时错误：未登录用户访问 API 返回 HTML — **中等，已修复**

**问题描述** (来自 `docs/task-2026-04-20-backend-fix.md`):
- 未登录时 NextAuth 中间件将 API 请求重定向到登录页，导致 API 返回 HTML 而非 JSON
- 前端 JSON 解析失败

**修复方案**: 前端使用 `useSession()` 判断登录状态，未登录时不请求数据

**残留风险**: 这一修复依赖前端守卫，如果某个组件忘记 `useSession()` 检查就会再次触发。更健壮的做法是在 API 层统一返回 401 JSON。

---

### 1.4 开发环境日志中的 401 错误 — **低优先级，预期行为**

从 `dev-final.log.txt` 第 15-20 行：
```
GET /api/exercises 401
GET /api/workout 401
GET /api/food-logs 401
GET /api/analysis/summary 401
GET /api/foods/search 401
```

这些是未登录用户在首页触发的 API 请求。在当前代码中已通过 `useSession()` 守卫，但日志显示开发阶段仍偶发这些请求。

---

### 1.5 Cross-Origin 开发警告 — **低优先级，非阻塞**

来自 `dev-final.log.txt` 第 56-77 行:
```
Blocked cross-origin request to Next.js dev resource /_next/webpack-hmr from "127.0.0.1"
```

原因：开发服务器绑定 `0.0.0.0`，从 `127.0.0.1` 访问被视为跨域。需要添加 `allowedDevOrigins: ['127.0.0.1']` 到 `next.config.ts`。

**当前 `next.config.ts`** 中缺失此配置。

---

### 1.6 Middleware 废弃问题 — **已修复**

`docs/task-2026-04-20-backend-fix.md` 记录：Next.js 15+ 已废弃 `middleware.ts`，项目改用 `src/proxy.ts`。当前 `src/proxy.ts` 功能正常，实现了路径保护和登录态检查。

---

## 二、结构合理性评估

### 2.1 目录结构总评：总体良好，存在局部混乱

**合理部分**:
- `src/app/` 使用 Next.js App Router 约定，路由结构清晰
- `src/lib/` 作为共享工具库层，职责明确
- `src/components/` 组件独立目录，易查找
- `prisma/` 数据库 Schema 和种子数据集中管理
- API routes 按功能域分目录（`auth/`, `analysis/`, `exercises/` 等）

**不合理部分**:

#### 2.1.1 `src/core/` vs `src/lib/` 职责重叠 — **结构问题**
- `src/core/analysis.ts` 和 `src/lib/workout-pr.ts` 都涉及训练数据分析
- `src/core/calc.ts` 和 `src/lib/calc.ts` 存在命名冲突
- `src/core/` 只有 2 个文件，几乎不构成独立的架构层
- **建议**: 合并到 `src/lib/analysis/` 或明确界定 `core` 与 `lib` 的分工

#### 2.1.2 `src/lib/workout/` 子模块过度设计 — **复杂度问题**
- `src/lib/workout/` 包含 4 个文件：`events.ts`, `eventLog.ts`, `causal.ts`, `contract.ts`
- `causal.ts` 有 506 行，包含因果图引擎、冲突检测、决策追踪、会话解释等复杂系统
- 但实际使用场景有限——主要服务于 AI coaching 的事件分析，当前基本处于预留状态
- 这些模块导入了 `workoutTimer.ts` store 但没有实际业务使用链路

#### 2.1.3 `src/app/_home/` 下划线命名 — **非标准约定**
- Next.js 约定中 `_` 前缀目录表示私有/不参与路由
- 但将首页子组件放在 `_home/` 下（如 `CriticalBSkeleton.tsx`, `ExtendedWidgets.tsx`）虽然技术上可行，不如放在 `src/components/home/` 更直观

#### 2.1.4 样式系统三轨并存 — **严重问题**
根据 `.trae/documents/ui-review-plan-2026-05-24.md` 分析：
- **三种样式方式并存**: CSS 变量 (globals.css)、内联 style 属性、Tailwind 硬编码类
- 部分页面（`diet/page.tsx`, `settings/page.tsx`）直接使用 Tailwind 暗色硬编码类
- `globals.css` 第 63-149 行存在大量 `!important` 补丁规则，脆弱且性能差
- 主题适配不完整：5 个组件在亮色模式下显示异常

---

## 三、设计缺陷识别

### 3.1 认证方式不统一 — **高风险**

当前项目中存在两种认证模式：
1. `src/lib/get-db-user.ts` 中的 `getDbUserId()`：通过 `auth()` → session → DB 查询
2. API route 中直接 `const session = await auth()` + 内联检查

`getDbUserId()` 函数本身有一个**潜在的性能问题**：
```typescript
// src/lib/get-db-user.ts:17-21
// Legacy fallback: 每次请求都查一次数据库
const user = await prisma.user.findUnique({ where: { email } });
```
在 JWT callback 已正确设置 `token.userId` 的情况下，这个 fallback 永远不会触发。但代码仍保留了这个无用的数据库查询路径。

### 3.2 SQLite 数据库的生产适用性 — **高风险**

`prisma/schema.prisma:5-8`:
```
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

SQLite 适合开发和小规模部署，但在生产环境中存在：
- **并发写入限制**: SQLite 不支持高并发写入，多用户同时记录训练数据时会出现锁冲突
- **无连接池**: 单文件数据库无法水平扩展
- **备份困难**: 需要在应用层处理备份逻辑

### 3.3 Dashboard 缓存策略不完整 — **中风险**

`src/lib/kv/dashboard.ts` 中的缓存实现:
```
// TODO: production — await kvGet(getCacheKey(userId)) and JSON.parse
const snap = memoryCache.get(getCacheKey(userId))
```

- 明确标注了生产环境需要切换到 Redis/KV 但尚未实现
- 内存缓存在多进程/多实例部署下不同步
- `writeDashboardSnapshot` 是异步函数但内部是同步的 Map.set（命名具有误导性）

### 3.4 速率限制器为内存存储 — **中风险**

`src/lib/rate-limit.ts`:
- 使用模块级 `Map` 存储
- 多实例部署时限制不共享
- 清理定时器在服务端常驻，但没有在进程退出时清理

### 3.5 异常处理不统一 — **中风险**

- 部分 API route 使用通用 `catch (error) { logger.error(...) }`，丢失了错误类型信息
- `src/app/api/workout/route.ts:PATCH` 中对 `updateMany` 没有事务保护（第 136-141 行）
- AI orchestration 层（`src/lib/ai/orchestrator.ts`）的重试逻辑虽然完善，但最终 `throw lastError` 不保留调用栈

### 3.6 边界条件处理问题 — **中风险**

**`src/core/analysis.ts:21`**:
```typescript
const maxWeight = Math.max(...allSets.map(set => set.weight), 0);
```
若 `allSets` 为空数组，`Math.max(...[])` 返回 `-Infinity`，然后 `Math.max(-Infinity, 0)` 返回 `0`。虽然通过第二个参数兜底，但逻辑不够直观。

**`src/lib/calc.ts`** (未直接读取，但从 core/analysis.ts 导入的 `calculate1RM`):
- 需要确认 `calculate1RM` 对 `weight=0` 或 `reps=0` 的边界处理

**`src/lib/health/fatigue.ts:87`**:
```typescript
const acwr = chronicLoad > 0 ? acuteLoad / chronicLoad : acuteLoad > 0 ? 2 : 0;
```
嵌套三元表达式可读性差，且 `acuteLoad > 0 && chronicLoad === 0` 时固定返回 2 的合理性需要运动科学依据。

### 3.7 状态管理中的遗留字段 — **低风险**

`src/stores/workoutTimer.ts` 中同时维护了两套状态：
- 主状态: `sessionPhase`, `isTrainingActive`, `isPaused`
- 兼容字段: `isCardioSession`, `isFreeSession` 等布尔值

这种双轨制增加了状态不一致的风险。虽然代码在 `setSessionType` 等 action 中同步更新，但维护成本较高。

### 3.8 AI 生成代码的数据流安全 — **中风险**

`src/lib/ai/orchestrator.ts:98` 的 `completeJSON<T>()`:
```typescript
export async function completeJSON<T>(request: LLMRequest): Promise<T> {
  const resp = await complete({ ...request, jsonMode: true });
  const cleaned = resp.content.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
  return JSON.parse(cleaned) as T;
}
```
- `as T` 是类型断言而非运行时验证——如果 AI 返回了不符合预期的 JSON 结构，调用方会得到类型错误的数据
- 缺少 Zod 或类似库的运行时 Schema 验证

---

## 四、AI 生成代码识别与评估

基于以下特征识别了多处 AI 生成代码：

### 4.1 识别特征

| 特征 | 示例位置 |
|------|---------|
| 过度的模块化分解（单文件功能被拆为多文件微观模块） | `src/lib/workout/causal.ts` (506行，仅用于极少场景) |
| 预留但未实现的扩展点 | `_selectStrategy` 函数注明"Phase 2" |
| TODO 标记未跟进 | `src/lib/kv/dashboard.ts:29`, `src/lib/kv/dashboard.ts:43` |
| 重复的中英双语注释 | 大量文件同时有中英文描述 |
| 过度工程化的架构设计 | Causal Graph Engine（`causal.ts`）在 MVP 阶段就实现了完整的冲突检测/仲裁系统 |
| 统一的代码风格和注释密度 | 几乎所有 `src/lib/` 文件都有详细的 JSDoc 和分隔注释 |

### 4.2 评估结果

**安全性方面 — 总体良好，存在局部风险**:
- DASHSCOPE_API_KEY 从环境变量读取，无硬编码 ✅
- 但 `src/lib/ai/orchestrator.ts:10-13` 的 `getApiKey()` 在每次调用时重新读取 `process.env`（而非缓存），在边缘场景可能有微小性能损失
- RAG 知识库内容（`src/lib/ai/rag/knowledge/*.ts`）作为硬编码数据，内容正确性取决于 AI 生成时的训练数据，未经运动科学专家审核

**性能方面 — 总体良好，存在优化空间**:
- `src/lib/workout-service.ts:88-93` 使用 `findMany({ where: { name: { in: uniqueNames } } })` 批量查询，避免了 N+1 ✅
- `src/lib/dashboard.ts:258-265` 使用 `Promise.allSettled` 并行请求，优化了 Dashboard 加载 ✅
- 但 `src/app/api/analysis/summary/route.ts` 中有冗余的二次查询（当 period !== 'year' 时会再查一次全量数据）
- `src/lib/ai/orchestrator.ts` 的重试+回退链设计合理，但重试延迟使用 `setTimeout` 而非指数退避

**可维护性方面 — 混合评价**:
- 代码注释详细，类型定义完整 ✅
- 但某些模块过度抽象（如 causal.ts 的事件系统）增加了理解成本
- `src/lib/planning/planningEngine.ts` 的 `_selectStrategy` 标注了 Phase 2 计划但当前仅返回 `'template'`，说明该架构是为未来需求设计的，但当前增加了间接层

**业务逻辑准确性 — 需要领域专家验证**:
- 疲劳计算 (`src/lib/health/fatigue.ts`) 引用 Gabbett 2016 等运动科学文献，ACWR 区间映射基于论文数据——需要运动科学专家验证
- 训练模板 (`src/lib/planning/templateStrategy.ts`) 的组数/次数/休息时间设定基于常见训练计划，但不同肌群和水平的合理性需要专业验证
- 教练系统提示词 (`src/lib/ai/prompts/coach-system.ts`) 的健康规则和阈值设定（如"蛋白质严重不足 < 60%"、"热量缺口 > 600kcal"）需要营养学专家审核

---

# 第二部分：项目结构分析

## 一、目录功能解析

### 1.1 顶层目录

```
d:\FitCoach\
├── .next/              # Next.js 构建输出（开发模式缓存）
├── .trae/              # 项目分析文档（AI 辅助生成）
├── .vscode/            # VS Code 编辑器配置
├── docs/               # 项目开发文档（5 个任务记录）
├── fitcoach-miniprogram/  # 微信小程序子项目（独立技术栈）
├── node_modules/       # pnpm 依赖
├── prisma/             # 数据库 ORM 层
│   ├── dev.db          # SQLite 开发数据库文件
│   ├── schema.prisma   # 数据模型定义（核心文件，279 行）
│   ├── seed.ts         # 种子数据入口
│   ├── seed-exercises.ts / seed-exercises-cn.ts  # 动作库种子
│   └── seed-foods.ts / seed-foods-cn.ts          # 食物库种子
├── public/             # 静态资源
│   ├── offline.html    # PWA 离线页面
│   ├── sw.js           # Service Worker
│   └── *.svg           # 图标和品牌素材
├── scripts/            # 运维脚本
│   ├── check-api-usage.js   # API 使用量检查
│   ├── check-foods.js       # 食物数据检查
│   ├── create-user.js       # 用户创建脚本
│   ├── seed-exercises.cjs   # 动作数据种子
│   └── temp_db_check.cjs    # 临时数据库检查
├── src/                # 主应用源代码（详见 1.2）
├── package.json        # 项目配置（Next.js 16, React 19, Prisma）
├── next.config.ts      # Next.js 配置（Webpack alias, headers）
├── tsconfig.json       # TypeScript 配置（strict: true）
├── eslint.config.mjs   # ESLint 配置
├── postcss.config.mjs  # PostCSS 配置（Tailwind CSS v4）
└── pnpm-lock.yaml      # 依赖锁文件
```

### 1.2 src/ 目录详细功能

```
src/
├── app/                        # Next.js App Router 页面与 API
│   ├── _home/                  # 首页私有子组件（不参与路由）
│   │   ├── HomeShell.tsx       # 首页布局壳
│   │   ├── CriticalBWidgets.tsx # 关键 B 区组件（计划+实时状态）
│   │   ├── CriticalBSkeleton.tsx # B 区骨架屏
│   │   ├── ExtendedWidgets.tsx  # 扩展区组件（营养+饮食）
│   │   └── UnauthenticatedContent.tsx # 未登录引导页
│   ├── actions/                # Server Actions
│   │   ├── dashboard.ts        # Dashboard 数据获取
│   │   ├── exercise-actions.ts # 动作相关操作
│   │   └── workout.ts          # 训练记录操作
│   ├── analytics/              # 数据分析页面组
│   │   ├── page.tsx            # 分析主页面
│   │   ├── health/page.tsx     # 健康分析
│   │   ├── records/page.tsx    # 记录分析
│   │   ├── strength/page.tsx   # 力量分析
│   │   └── volume/page.tsx     # 容量分析
│   ├── api/                    # API 路由（后端逻辑）
│   │   ├── analysis/           # 数据分析 API (13 个端点)
│   │   ├── auth/               # 认证 API (7 个端点)
│   │   ├── body-data/          # 身体数据 CRUD
│   │   ├── chat/               # AI 对话 (流式 SSE)
│   │   ├── dashboard/          # Dashboard 状态
│   │   ├── diet-analysis/      # 饮食分析
│   │   ├── exercises/          # 动作库 CRUD
│   │   ├── feedback/           # AI 反馈生成
│   │   ├── food-logs/          # 饮食记录
│   │   ├── foods/              # 食物库（含扫码/拍照）
│   │   ├── init/               # 初始化
│   │   ├── nutrition-goals/    # 营养目标
│   │   ├── plans/              # 训练计划
│   │   ├── streak/             # 连续打卡
│   │   ├── water-logs/         # 饮水记录
│   │   └── workout/            # 训练记录（完整 CRUD + PATCH）
│   ├── auth/                   # 认证页面
│   │   ├── signin/page.tsx     # 登录页
│   │   └── signup/page.tsx     # 注册页
│   ├── [功能页面]/             # 15+ 个 Next.js 页面
│   ├── layout.tsx              # 根布局（Server Component）
│   ├── page.tsx                # 首页（分层加载架构）
│   ├── providers.tsx           # Client Providers 包装
│   ├── template.tsx            # 页面切换动画
│   ├── error.tsx               # 错误边界
│   ├── loading.tsx             # 加载状态
│   ├── globals.css             # 全局样式（主题变量 + 补丁规则）
│   └── manifest.ts             # PWA Manifest
├── components/                 # 共享 UI 组件
│   ├── ai-coaching/            # AI 教练组件（4 个）
│   ├── AmbientGlow.tsx          # 环境光背景效果
│   ├── BottomTabBar.tsx         # 底部导航栏
│   ├── FloatingTimer.tsx        # 浮动训练计时器（核心组件，340行）
│   ├── Skeleton.tsx             # 骨架屏组件
│   ├── Toast.tsx                # Toast 通知系统
│   ├── ExercisePicker.tsx       # 动作选择器
│   ├── FoodSearch.tsx           # 食物搜索
│   ├── MyFoodsPanel.tsx         # 我的食物面板
│   ├── NutritionCard.tsx        # 营养卡片
│   ├── StreakCard.tsx           # 连续打卡卡片
│   ├── TodayWorkoutCard.tsx     # 今日训练卡片
│   ├── TrainingTypeModal.tsx    # 训练类型选择弹窗
│   ├── WarmupGuideModal.tsx     # 热身指导弹窗
│   ├── WorkoutMonthCalendar.tsx # 训练日历
│   ├── PWA相关组件 (3个)       # PWA 注册/安装/更新
│   ├── ClientProviders.tsx      # 客户端 Provider 聚合
│   ├── SessionProvider.tsx      # NextAuth Session Provider
│   └── OfflineToast.tsx         # 离线提示
├── contexts/
│   └── ThemeContext.tsx          # 深色/浅色主题管理
├── core/                        # 核心业务分析逻辑
│   ├── analysis.ts              # 趋势分析与个人记录
│   └── calc.ts                  # 1RM 等健身计算
├── hooks/                       # 自定义 React Hooks
│   ├── useLocalStorage.ts       # LocalStorage 封装
│   ├── useRequireAuth.ts        # 路由认证守卫
│   ├── useWorkoutDebug.ts       # 训练调试
│   ├── useWorkoutEffects.ts     # 训练副作用管理
│   ├── useWorkoutHint.ts        # 训练提示
│   └── useWorkoutUI.ts          # 训练 UI 状态
├── lib/                         # 核心业务库（最大模块）
│   ├── ai/                      # AI 模块
│   │   ├── orchestrator.ts      # LLM 调用编排（重试+回退）
│   │   ├── personality.ts       # 教练人格配置
│   │   ├── types.ts             # LLM 类型定义
│   │   ├── prompts/             # 提示词模板
│   │   │   ├── coach-system.ts  # 教练系统提示词（核心）
│   │   │   ├── diet.ts          # 饮食分析提示词
│   │   │   ├── feedback.ts      # 训练反馈提示词
│   │   │   └── plan.ts          # 计划生成提示词
│   │   ├── providers/
│   │   │   └── dashscope.ts     # 阿里云 DashScope API 封装
│   │   └── rag/                 # RAG 检索增强
│   │       ├── index.ts         # 检索引擎（240行）
│   │       └── knowledge/       # 运动科学知识库 (8 个文件)
│   ├── health/                  # 健康分析引擎
│   │   ├── index.ts             # 健康快照聚合
│   │   ├── fatigue.ts           # 疲劳计算（ACWR 模型）
│   │   ├── injury-risk.ts       # 受伤风险评估
│   │   ├── nutrition-model.ts   # 营养分析模型
│   │   └── types.ts             # 健康数据类型
│   ├── workout/                 # 训练事件系统
│   │   ├── events.ts            # 事件总线（发布/订阅）
│   │   ├── eventLog.ts          # 事件日志存储
│   │   ├── causal.ts            # 因果图引擎（506行）
│   │   └── contract.ts          # 类型约束
│   ├── dashboard/               # Dashboard 实时事件
│   │   └── events.ts            # Dashboard 缓存失效
│   ├── kv/                      # KV 缓存层
│   │   └── dashboard.ts         # Dashboard 缓存（内存，预留生产 KV 切换）
│   ├── planning/                # 训练计划生成
│   │   ├── planningEngine.ts    # 计划引擎入口
│   │   └── templateStrategy.ts  # 模板策略（317行，curated）
│   ├── auth.ts                  # NextAuth 配置
│   ├── prisma.ts                # Prisma 单例
│   ├── calc.ts                  # 健身计算工具
│   ├── dashboard.ts             # Dashboard 数据聚合（347行）
│   ├── workout-service.ts       # 训练记录 CRUD 服务
│   ├── workout-pr.ts            # 个人记录检测
│   ├── workout-summary.ts       # 训练摘要转换
│   ├── feedback.ts              # 反馈生成
│   ├── logger.ts                # 日志工具
│   ├── rate-limit.ts            # 速率限制
│   ├── server-cache.ts          # TTL 缓存
│   ├── themes.ts                # 主题定义
│   ├── exercise-constants.ts    # 动作常量
│   ├── muscle-keywords.ts       # 肌群关键词映射
│   ├── user-storage.ts          # 用户本地存储
│   └── get-db-user.ts           # 数据库用户查询
├── stores/
│   └── workoutTimer.ts          # 训练计时器状态（Zustand，270行）
├── types/
│   ├── next-auth.d.ts           # NextAuth 类型扩展
│   └── workout-plan.ts          # 训练计划类型
└── proxy.ts                     # Next.js 路由代理/保护
```

### 1.3 fitcoach-miniprogram/ 子项目

```
fitcoach-miniprogram/
├── config/                      # 环境配置（dev/prod）
├── dist/                        # Taro 编译输出（微信小程序包）
├── src/                         # 小程序源码（Taro + React 18）
│   ├── app.config.ts            # 小程序配置
│   ├── app.tsx                  # 入口
│   └── pages/
│       ├── index/               # 首页
│       ├── workout/             # 训练页
│       └── summary/             # 总结页
├── package.json                 # Taro 4.2.0 + NutUI
├── babel.config.js              # Babel 配置
└── project.config.json          # 微信开发者工具配置
```

---

## 二、前后端架构定位

### 2.1 前端代码位置

**Web 前端 (PWA)**:
- **页面组件**: `src/app/**/page.tsx`（19 个页面路由）
- **UI 组件**: `src/components/`（20+ 组件）
- **状态管理**: `src/stores/workoutTimer.ts`（Zustand）
- **客户端 Hook**: `src/hooks/`（6 个 hooks）
- **主题管理**: `src/contexts/ThemeContext.tsx`
- **样式**: `src/app/globals.css`（CSS 变量 + Tailwind）
- **PWA**: `public/sw.js`, `public/offline.html`, PWA 相关组件
- **关键标识**: 所有前端文件均有 `"use client"` 指令或为纯客户端组件

**小程序前端**:
- **位置**: `fitcoach-miniprogram/src/pages/`
- **技术栈**: Taro 4.2.0 + React 18 + TypeScript + NutUI

### 2.2 后端代码位置

**API 路由层** (Next.js Route Handlers):
- **位置**: `src/app/api/**/route.ts`（25+ 个 API 端点）
- **作用**: HTTP 请求处理、参数验证、调用业务逻辑、返回 JSON

**业务逻辑层**:
- `src/lib/workout-service.ts` - 训练记录 CRUD
- `src/lib/dashboard.ts` - Dashboard 数据聚合
- `src/lib/planning/planningEngine.ts` - 训练计划生成
- `src/lib/health/` - 健康分析计算
- `src/lib/ai/` - AI 服务集成

**数据访问层**:
- `src/lib/prisma.ts` - Prisma Client 单例
- `prisma/schema.prisma` - 数据模型定义

**中间件/代理层**:
- `src/proxy.ts` - 路由保护（替代 middleware.ts）
- `src/lib/rate-limit.ts` - 速率限制

**Server Actions**:
- `src/app/actions/workout.ts` - 服务端操作

### 2.3 技术栈划分

| 层级 | 技术 | 位置 |
|------|------|------|
| 前端框架 | Next.js 16.2 (App Router) + React 19.2 | `src/app/`, `src/components/` |
| UI 组件库 | Lucide React 图标, Vaul 抽屉 | `package.json` |
| 动画 | Framer Motion 12.38 | `src/components/FloatingTimer.tsx` |
| 图表 | Recharts 3.8 | 分析页面 |
| 状态管理 | Zustand 5.0 | `src/stores/` |
| 样式 | Tailwind CSS v4 + 内联 Style + CSS 变量 | `globals.css`, 各组件 |
| 认证 | NextAuth v5 (beta) + bcryptjs | `src/lib/auth.ts` |
| 数据库 ORM | Prisma 6.19 + SQLite | `prisma/`, `src/lib/prisma.ts` |
| AI 服务 | 阿里云 DashScope (qwen 系列) | `src/lib/ai/providers/dashscope.ts` |
| 小程序 | Taro 4.2.0 + React 18 + NutUI | `fitcoach-miniprogram/` |
| 运行时 | Node.js >= 24, pnpm 10.33 | `package.json` |

---

## 三、数据流程梳理

### 3.1 完整数据生命周期

```
┌─────────────────────────────────────────────────────────────────────┐
│                          数据产生层                                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  用户操作 ──► 客户端组件 ──► Zustand Store ──► API 请求              │
│                                                                     │
│  例: 用户在训练页输入 60kg×10rep                                     │
│  → WorkoutTimer store 记录训练时长                                   │
│  → 提交时 POST /api/workout { exercises, totalVolume, duration }    │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                          传输与路由层                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  proxy.ts ──► 检查 JWT token (getToken)                             │
│  → 未登录 → 302 /auth/signin                                       │
│  → 已登录 → 放行到 API Route Handler                                │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                          业务处理层                                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  API Handler (route.ts)                                             │
│  → getDbUserId() 获取用户身份                                        │
│  → workout-service.ts / createWorkout()                              │
│     → 参数验证 (WorkoutValidationError)                             │
│     → 动作名称 → exerciseId 映射                                    │
│     → PR 检测 (workout-pr.ts / detectNewPRs)                        │
│     → 计算总容量                                                     │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                          数据存储层                                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Prisma Client ──► SQLite (dev.db)                                  │
│                                                                     │
│  写入表:                                                             │
│  - Workout (训练记录)                                                │
│  - WorkoutSet (每组详细数据)                                         │
│  - Exercise (自动创建未知动作)                                        │
│  - Feedback (清除旧 AI 缓存，触发重新生成)                             │
│                                                                     │
│  触发副作用:                                                         │
│  - emitDashboardEvent("WORKOUT_LOGGED", userId)                     │
│    → 标记 Dashboard 缓存为 stale                                     │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                          数据消费层                                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  读取路径:                                                           │
│  1. Dashboard: getDashboardStatus(userId)                           │
│     → 查询最近 14 天 Workout + WorkoutSet                           │
│     → 计算打卡天数、连续天数、疲劳度                                  │
│     → setDashboardCache() 写入 5 分钟 TTL 缓存                      │
│                                                                     │
│  2. 分析页面:                                                        │
│     → /api/analysis/summary?period=week                             │
│     → /api/analysis/trends → 图表数据                               │
│     → /api/analysis/personal-records → PR 记录                      │
│                                                                     │
│  3. AI 对话:                                                         │
│     → fetchUserContext(userId) 获取 28 天训练 + 14 天饮食           │
│     → getHealthSnapshot() 计算疲劳/受伤风险/营养                     │
│     → retrieve(userQuery) RAG 检索相关知识                          │
│     → buildCoachSystemPrompt() 组装提示词                           │
│     → dashscopeStream() 流式输出回复                                │
│                                                                     │
│  4. 训练反馈:                                                        │
│     → POST /api/workout → 完成后调用 /api/feedback/generate         │
│     → buildFeedbackPrompt(ctx) 构造训练数据上下文                   │
│     → dashscopeComplete() 生成 JSON 格式分析                        │
│     → 存储到 Feedback 表                                             │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 3.2 关键数据流路径总结

| 数据流 | 起点 | 经过 | 终点 |
|--------|------|------|------|
| 训练记录写入 | 用户输入训练数据 | WorkoutTimer Store → API POST → workout-service → Prisma | SQLite Workout/WorkoutSet 表 |
| Dashboard 读取 | 首页加载 | proxy.ts(认证) → dashboard.ts(聚合) → kv/dashboard.ts(缓存) | 页面渲染 |
| AI 对话 | 用户提问 | chat/route.ts → fetchUserContext(DB查询) → getHealthSnapshot(计算) → RAG检索 → DashScope API | SSE 流返回 |
| 健康分析 | 训练/饮食数据 | health/fatigue.ts(ACWR模型) + health/injury-risk.ts | 数字快照 → AI上下文 |
| 训练计划 | 用户选择模式 | planningEngine.ts → templateStrategy.ts | 纯 JSON 计划 |

---

## 四、核心逻辑识别

### 4.1 核心业务模块清单

| 模块 | 文件 | 行数 | 核心职责 | 关键程度 |
|------|------|------|---------|---------|
| 训练记录服务 | `src/lib/workout-service.ts` | 272 | 训练 CRUD、PR 检测、数据验证 | ⭐⭐⭐⭐⭐ |
| 训练计时器 | `src/stores/workoutTimer.ts` | 270 | 训练会话状态、计时、休息倒计时 | ⭐⭐⭐⭐⭐ |
| Dashboard 聚合 | `src/lib/dashboard.ts` | 347 | 打卡、连续天数、疲劳、状态判定 | ⭐⭐⭐⭐⭐ |
| 训练页面 | `src/app/workout/page.tsx` | ~2000+ | 训练 UI 主逻辑、动作管理、提交 | ⭐⭐⭐⭐⭐ |
| AI 对话 | `src/app/api/chat/route.ts` | 168 | 获取用户上下文、组装提示词、流式响应 | ⭐⭐⭐⭐ |
| 教练提示词 | `src/lib/ai/prompts/coach-system.ts` | 114 | 健康状态→行为规则转换、RAG 集成 | ⭐⭐⭐⭐ |
| 疲劳计算 | `src/lib/health/fatigue.ts` | 134 | ACWR 模型、单调性、劳损 | ⭐⭐⭐⭐ |
| AI 编排器 | `src/lib/ai/orchestrator.ts` | 98 | 重试、模型回退、JSON 解析 | ⭐⭐⭐ |
| 训练计划引擎 | `src/lib/planning/planningEngine.ts` | 77 | 模式选择、参数验证、策略分发 | ⭐⭐⭐ |
| 模板策略 | `src/lib/planning/templateStrategy.ts` | 317 | 预置训练模板（63 个训练方案） | ⭐⭐⭐ |
| RAG 检索 | `src/lib/ai/rag/index.ts` | 249 | 查询扩展、关键词评分、检索排序 | ⭐⭐⭐ |
| 浮动计时器 | `src/components/FloatingTimer.tsx` | 340 | Dynamic Island UI、训练控制面板 | ⭐⭐⭐ |
| 首页分层加载 | `src/app/page.tsx` | 46 | Critical-A/B/Extended 三级加载 | ⭐⭐⭐ |

### 4.2 核心架构模式：分层仪表盘加载

`src/app/page.tsx` 实现了精心设计的三级加载策略：

```
Critical-A (即时渲染，0ms)
├── DashboardMeta (缓存快照，无 Prisma 查询)
└── StreakCard (基于快照数据)

Critical-B (Suspense + 骨架屏)
├── getUserPlans (训练计划)
└── getDashboardStatus (实时状态计算)

Extended (静默后台加载，无骨架屏)
├── getNutritionSettings
└── getTodayFoodLogs (饮食摘要)
```

这是一个值得保留的优化模式：优先展示用户最关心的数据，延迟加载重量数据。

### 4.3 核心架构模式：训练会话事件系统

训练期间的完整事件链路：

```
用户操作 → WorkoutTimer Store Action
           ├── set() 更新状态
           ├── _autoTicker() 管理全局计时器
           └── logAndEmit(event, sessionId)
                 ├── 写入 eventLog (持久化)
                 ├── emit() 到事件总线
                 └── useWorkoutEffects Hook 消费
                       ├── 音效反馈
                       ├── 触觉反馈 (vibration)
                       └── 通知提醒
```

这个架构将状态管理（Zustand）、事件记录（eventLog）和副作用（hooks）清晰分离。

### 4.4 核心架构模式：健康快照聚合

`src/lib/health/index.ts` 的 `getHealthSnapshot()` 将三个独立模型聚合为一个快照：

```
训练数据 ──► calculateFatigue()    ─→ fatigue (ACWR, monotony, strain)
            assessInjuryRisk()    ─→ injuryRisk (level, factors)
饮食数据 ──► analyzeNutrition()   ─→ nutrition (balance, issues)
                                       │
                                       ▼
                               HealthSnapshot
                                       │
                          ┌────────────┼────────────┐
                          ▼            ▼            ▼
                    AI 对话上下文  疲劳面板组件   受伤风险评估
```

这个设计减少了重复计算（ACWR 和 monotony 在 fatigue 和 injury-risk 之间共享）。

---

# 总结

## 项目优势
1. **技术栈现代**: Next.js 16 + React 19 + Prisma + TypeScript strict mode
2. **架构思考深入**: Dashboard 三级加载、事件总线、因果图引擎体现了架构设计能力
3. **业务覆盖全面**: 训练、饮食、AI 教练、数据分析四大模块
4. **PWA 支持**: Service Worker、离线页面、安装提示完备
5. **中文本地化**: 动作名称中英双语、提示词中文优化、知识库中文分词

## 需要关注的风险
1. **SQLite 生产限制** — 高并发场景下会成为瓶颈
2. **主题适配不完整** — 5 个组件/页面在亮色模式下显示异常（已知问题，有计划）
3. **认证方式不统一** — `auth()` 和 `getDbUserId()` 两种方式并存
4. **部分模块过度设计** — causal.ts 的事件系统在当前 MVP 阶段使用有限
5. **AI 返回值缺少运行时校验** — `completeJSON<T>()` 使用 `as T` 而非 Schema 验证
6. **生产缓存未实现** — KV 层标注了 `TODO: production`
7. **知识库未经专业审核** — RAG 的运动科学知识来自 AI 生成
