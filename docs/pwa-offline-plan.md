# FitCoach 离线 PWA 实施计划

> 目标：让团队成员手机安装 PWA，无网络时也能训练记录，项目更新后自动无感知更新。

---

## 当前状态

| 能力 | 状态 |
|------|------|
| Manifest、SW、安装引导、启动画面、Shortcuts | ✅ 已完成 |
| 页面离线缓存（HTML/CSS/JS） | ✅ 已有（Cache-First + SWR + Network-First） |
| 训练/饮食/历史数据离线存储 | ❌ 无 — API 失败即不可用 |
| 离线提交训练记录 | ❌ 无 — 训练完成时 POST /api/workout 会失败 |
| 离线查看历史 | ❌ 无 — /api/workout-history 不缓存 |
| SW 自动更新（无用户点击） | ❌ 需点击 PWAUpdateBanner"刷新"按钮 |
| 团队成员分发 | ❌ 无统一入口 |

---

## 总体架构

```
┌─────────────────────────────────────────────────────────────┐
│                      用户操作层                               │
│  训练页 (workout)  饮食页 (diet)  历史页 (history)            │
└────────────┬────────────────────────────────┬───────────────┘
             │ write                         │ read
             ▼                               ▼
┌─────────────────────────┐     ┌──────────────────────────────┐
│   Zustand Store (内存)   │◄────│   Sync Engine (后台同步)       │
│  workoutTimer / UI state │     │  • 联网时 flush 本地队列       │
│                         │     │  • 拉取服务器最新数据           │
└────────────┬────────────┘     │  • 冲突解决（last-write-wins） │
             │                   └──────────────────────────────┘
             │ persist
             ▼
┌──────────────────────────────────────────────────────────────┐
│  IndexedDB (Dexie) — 唯一持久化层                              │
│  ├─ workouts      ← 训练记录（离线写入，后台同步）               │
│  ├─ workoutSets   ← 每组详情                                 │
│  ├─ exercises     ← 动作缓存（CommonExercises）                │
│  ├─ plans         ← 用户训练计划                             │
│  ├─ foodLogs      ← 饮食记录                                 │
│  ├─ syncQueue     ← 待同步操作队列                           │
│  └─ dashboardCache ← Dashboard 数据快照（14 天）               │
└──────────────────────────────────────────────────────────────┘
```

---

## 技术选型

| 层 | 选型 | 理由 |
|---|---|---|
| IndexedDB ORM | `dexie` (v4) | API 极简，支持 hooks，React 友好 |
| IndexedDB React | `dexie-react-hooks` | `useLiveQuery` 自动重渲染 |
| 状态管理 | Zustand + 已有的 `persist` | 内存层，与 Dexie 双向同步 |
| 后台同步 | 自定义 SyncEngine（定时轮询） | Background Sync API 支持率仅 ~75%，且 iOS 无 |
| 冲突策略 | last-write-wins + 用户提示 | 健身记录很少多设备冲突，简单优先 |

---

## Phase 1：Dexie + 离线数据层骨架（1.5 天）

### 1.1 安装依赖

```bash
pnpm add dexie dexie-react-hooks
```

### 1.2 新建 `src/lib/offline/db.ts`

定义 Schema + 单例：

```ts
import Dexie, { type EntityTable } from 'dexie'

interface OfflineWorkout {
  id: string          // 本地 UUID（offline 时生成）
  userId: string
  date: Date
  durationSec: number
  notes?: string
  syncStatus: 'pending' | 'synced' | 'conflict' | 'failed'
  serverId?: number   // 同步成功后回填
  createdAt: number
  updatedAt: number
}

interface OfflineWorkoutSet {
  id: string
  workoutId: string   // FK → OfflineWorkout.id
  exerciseId: string
  exerciseName: string
  weight: number
  reps: number
  rir: number
  type: 'W' | 'S'     // warmup / working
  order: number
  syncStatus: 'pending' | 'synced'
}

interface OfflineFoodLog {
  id: string
  userId: string
  date: Date
  foodName: string
  calories: number
  protein: number
  carbs: number
  fat: number
  syncStatus: 'pending' | 'synced'
  serverId?: number
}

interface SyncOperation {
  id: string          // auto-increment
  type: 'CREATE_WORKOUT' | 'CREATE_FOOD_LOG' | 'UPDATE_PLAN'
  payload: unknown
  createdAt: number
  retryCount: number
  lastError?: string
}

interface DashboardCache {
  userId: string
  data: unknown       // DashboardStatus JSON
  fetchedAt: number
  ttl: number        // 86400000 (1 day)
}

const db = new Dexie('FitCoachOffline') as Dexie & {
  workouts: EntityTable<OfflineWorkout, 'id'>
  workoutSets: EntityTable<OfflineWorkoutSet, 'id'>
  foodLogs: EntityTable<OfflineFoodLog, 'id'>
  syncQueue: EntityTable<SyncOperation, 'id'>
  dashboardCache: EntityTable<DashboardCache, 'userId'>
}

db.version(1).stores({
  workouts: 'id, [userId+date], syncStatus',
  workoutSets: 'id, workoutId, [workoutId+order]',
  foodLogs: 'id, [userId+date], syncStatus',
  syncQueue: '++id, createdAt',
  dashboardCache: 'userId',
})

export { db }
```

### 1.3 新建 `src/lib/offline/syncEngine.ts`

```ts
// 周期性轮询 flush syncQueue
// - 监听 online/offline 事件
// - 联网时立即 flush
// - 每 30 秒检查一次队列
// - 单例模式，避免多组件重复启动
```

### 1.4 新建 `src/hooks/useOfflineReady.ts`

```ts
// 暴露: isOnline, syncQueueLength, lastSyncAt, isSyncing
// 用于 UI: 离线提示条、同步状态 badge
```

---

## Phase 2：训练记录离线优先（2 天）

### 2.1 改造训练完成流程

**当前流程：**
```
用户点击"完成训练" → POST /api/workout → 成功 → 跳转
```

**离线优先流程：**
```
用户点击"完成训练" → 写 IndexedDB (workouts + workoutSets) → 入 syncQueue → 显示"已保存（待同步）" → 后台 flush → 成功回填 serverId
```

### 2.2 改造 workoutTimer.ts

当前 `workoutTimer.ts` 通过 `logAndEmit` 写 eventLog（内存）。需增加：

- `persistWorkoutToDB()` — 训练完成时将事件日志折叠为 `OfflineWorkout` + `OfflineWorkoutSet[]`
- `setCurrentSessionId` 时记录到 `db.workouts` 作为草稿（recoverable）

### 2.3 改造 `/api/workout` 创建接口

新增 `POST /api/workout/offline-sync` — 接收批量离线 workout 数组，幂等创建（按本地 UUID 去重）。

### 2.4 UI 适配

- 离线保存成功 → Toast："✓ 已离线保存，联网后自动同步"
- 同步完成 → 静默更新（或用 tiny badge）
- 同步失败 → 常驻提示条："X 条记录同步失败，点击重试"

---

## Phase 3：历史数据 + 计划离线缓存（1 天）

### 3.1 历史页改造

- 打开 `/history` 时，**优先**从 `db.workouts` 读取渲染
- 同时发 API `/api/workout-history` → 新数据写入 `db.workouts`（覆盖旧数据）→ UI 自动刷新（`useLiveQuery`）
- 用户离线时也能看到最近训练（因为有本地缓存）

### 3.2 Dashboard 数据缓存

- `/api/dashboard/status` 响应写入 `db.dashboardCache`
- 离线时 Dashboard 显示缓存数据 + "离线模式" 提示
- 进入 Dashboard 先读缓存 → 再请求 API 刷新

### 3.3 训练计划缓存

- 用户计划数据写入 `db.plans`（轻量，只有文本 + 日程结构）
- `/intent` 页面离线也能看到计划

---

## Phase 4：SW 无缝自动更新（0.5 天）

### 4.1 当前问题

`PWAUpdateBanner` 需要用户点击"刷新"。对团队分发场景来说，每次更新都要手动点，体验不好。

### 4.2 目标：无感知更新

**策略：新版本 SW 安装完成后，静默接管，下次导航时自动刷新。**

**修改 `public/sw.js`：**

```js
// 原有：等待 SKIP_WAITING 消息
// 新增：安装完成后，如果当前页面处于空闲状态，立即 skipWaiting
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting()) // ← 新增：立即激活
  )
})
```

**修改 `PWARegister.tsx`：**

```ts
// 监听 controllerchange → 检测到新 SW 接管时，优雅刷新（不丢状态）
navigator.serviceWorker.addEventListener('controllerchange', () => {
  // 如果当前不在训练进行中，直接 reload
  // 如果训练中，标记"更新待应用"，训练完成后再 reload
})
```

**修改 `PWAUpdateBanner.tsx`：**

降级为可选提示：新版本已自动更新，用户无需操作。但如果用户正在训练中，提示"训练完成后自动刷新更新"。

---

## Phase 5：团队分发方案（0.5 天）

### 5.1 局域网快速分发（团队同 WiFi）

```powershell
# build + start on LAN
pnpm build
pnpm start --hostname 0.0.0.0
# 显示 http://192.168.x.x:3000
```

手机连同一 WiFi → 浏览器打开 IP → 添加到主屏幕。

### 5.2 公网分发（团队成员不在同地）

**方案 A：ngrok（临时）**
```powershell
npx ngrok http 3000
# 生成 https://xxxx.ngrok-free.app
# 手机扫码即可安装 PWA
```

**方案 B：Cloudflare Tunnel（推荐，免费+固定域名）**
```powershell
# 1. 注册 cloudflare，创建 tunnel
# 2. 下载 cloudflared
cloudflared tunnel --url http://localhost:3000
# 3. 固定子域名（如 fitcoach.liangyuhao.workers.dev）
```

**方案 C：内网穿透 / 公司服务器（长期）**
部署到团队内部服务器或 VPS，绑定域名 + HTTPS 证书。

### 5.3 成员 onboarding

1. 发链接到微信群
2. 点击链接 → Safari/Chrome 打开
3. 浏览器菜单 → "添加到主屏幕"
4. 以后从桌面图标打开（standalone 模式）

---

## 实施优先级与工作量

| 优先级 | Phase | 内容 | 预估工时 |
|--------|-------|------|---------|
| 🔴 P0 | Phase 1 | Dexie 数据库 + syncEngine 骨架 | 1 天 |
| 🔴 P0 | Phase 4 | SW 无感知自动更新 | 0.5 天 |
| 🟡 P1 | Phase 2 | 训练记录离线优先 + 后台同步 | 2 天 |
| 🟡 P1 | Phase 3 | 历史数据 + Dashboard 离线缓存 | 1 天 |
| 🟢 P2 | Phase 5 | 团队分发脚本 + ngrok/CF tunnel | 0.5 天 |
| **总计** | | | **~5 天** |

---

## 风险与应对

| 风险 | 应对 |
|------|------|
| iOS 不支持 Background Sync API | 用 Visibility API + 定时轮询代替 |
| IndexedDB 存储上限 (~50MB) | 训练记录压缩（只存最近 90 天），超出提示清理 |
| 多设备冲突（同账号手机+平板） | last-write-wins，冲突时在 UI 提示用户选择 |
| SW 更新导致训练中页面刷新 | controllerchange 时检查训练状态，延迟刷新 |

---

## 验证清单

- [ ] 手机断网后打开 PWA，Dashboard 显示缓存数据
- [ ] 断网时开始训练 → 记录组数 → 完成训练 → 提示"已离线保存"
- [ ] 恢复网络 → 同步完成 → 服务器有数据
- [ ] 断网时打开历史页 → 显示最近训练
- [ ] 代码更新 build 后 → 手机端自动刷新（无用户点击）
- [ ] 新团队成员扫码安装 → 添加到主屏幕 → 正常使用
