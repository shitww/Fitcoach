# FitCoach — Vercel 部署就绪审计（Production Deployment + Mobile PWA Launch）

> 日期：2026-05-27  
> 目标：将 FitCoach 从“开发机依赖的本地测试”迁移到 **Vercel + HTTPS 域名 + 生产数据库**，确保手机可长期安装使用（PWA），并具备可靠更新与离线能力。  
> 约束：避免新增离线架构；只做生产部署所必需的调整。

---

## 1) 是否已可直接部署到 Vercel？

### 结论：**前端/路由层面基本可部署，但当前后端存储形态不满足 Vercel 的长期生产要求。**

**可部署的部分（✅）**
- Next.js 15 App Router 项目结构标准（`src/app` + `route.ts` API routes）。
- PWA 核心文件齐全：`manifest.ts`、`public/sw.js`、`public/offline.html`、iOS 启动画面（`/api/splash`）。
- Service Worker 注册逻辑在 `NODE_ENV === 'production'` 时启用（部署后会自动生效）。
- IndexedDB/Dexie 离线数据完全在客户端，与部署环境隔离（部署迁移不会破坏本地离线层）。

**必须先解决的阻塞项（🚫 Blockers）**
1. **数据库为 SQLite（本地文件）**
   - 当前 `.env` 为 `DATABASE_URL="file:./dev.db"`，属于本地磁盘文件数据库。
   - Vercel Serverless/Edge 环境不适合使用“写入本地文件”的数据库作为长期存储（实例无状态/可随时重建）。  
   - **结论：生产必须切换到托管数据库（Postgres）**。
2. **头像上传写入 `/public/uploads`（文件系统写入）**
   - `src/app/api/auth/avatar/route.ts` 使用 `fs/promises` 写文件到 `process.cwd()/public/uploads/avatars`。
   - Vercel 运行时不保证可写且不持久，且 `public/` 本质上是构建产物的一部分。  
   - **结论：生产必须改为对象存储（Vercel Blob / S3 / R2 等）或临时禁用此功能。**
3. **ESLint 配置导入路径问题导致 build 输出报错**
   - `eslint.config.mjs` 里：`import nextVitals from "eslint-config-next/core-web-vitals";`  
   - 在当前环境会报：`Cannot find module ... Did you mean ...core-web-vitals.js`  
   - 虽然构建未终止，但会污染 CI/部署输出，可能在 Vercel 环境中升级为 hard error（取决于安装方式与解析规则）。  
   - **结论：建议在部署前修复该 import。**

---

## 2) 必需环境变量（Vercel）

> 注意：不要把本地 `.env` 的 secret 直接搬到生产；生产需要重新生成。

### 必需（Required）
- `AUTH_SECRET`：NextAuth JWT/会话加密密钥（生产重新生成强随机值）
- `DATABASE_URL`：生产数据库连接串（将从 SQLite 迁移到 Postgres）

### 强烈建议（Recommended）
- `NEXTAUTH_URL` 或 `AUTH_URL`：设置为生产域名（例如 `https://fitcoach.yourdomain.com`）  
  > 当前 `trustHost: true`，理论上可自动信任 Host header，但生产仍建议显式配置 URL，避免回调/跨域边界问题。

### 可选（Feature-gated）
- `DASHSCOPE_API_KEY`：AI 图片识别/饮食分析等能力需要；未配置时相关 API 会返回“未配置”提示。

---

## 3) 哪些部分仍耦合 localhost / 开发机？

### 3.1 明确耦合项
- `DATABASE_URL=file:./dev.db`（本地文件）  
- 头像上传写到 `public/uploads`（本地文件系统）  
- `NEXTAUTH_URL=http://localhost:3000`（必须改为生产域名）

### 3.2 不耦合项（良好）
多数请求使用相对路径 `fetch('/api/...')`，不会硬编码域名与端口；迁移到生产域名后不会需要改代码。

---

## 4) Edge / Serverless 兼容性审计

### 4.1 Edge Runtime 使用点
发现 `src/app/api/splash/route.ts`：
- `export const runtime = 'edge'`
- 使用 `next/og` 生成 iOS 启动画面  
✅ 该路由不依赖 Prisma/Node-only API，适合 Edge。

### 4.2 Node-only API（需要确保运行在 Node Runtime）
发现 `src/app/api/auth/avatar/route.ts`：
- 使用 `fs/promises` 写文件 → **必须 Node runtime**，且在 Vercel 需要迁移为对象存储（见 Blocker #2）。

其余 API routes 大量依赖 Prisma（数据库），应保持 Node runtime（默认即可）。

---

## 5) 文件系统依赖审计（Filesystem Dependencies）

| 模块 | 依赖 | 生产风险 | 建议 |
|---|---|---|---|
| 头像上传 API | `fs/promises` 写入 `public/uploads` | 高（不可持久） | 迁移到对象存储 / 暂时禁用 |
| SQLite 数据库 | 写入本地 `dev.db` | 高（不可持久/不可扩展） | 切换 Postgres |

---

## 6) Service Worker / 更新机制（生产安全性）

**当前实现（✅）**
- `public/sw.js`：skipWaiting + clients.claim + 版本化 cache（`xfitx-sw-v3`）
- `next.config.ts`：对 `/sw.js` 关闭缓存（`Cache-Control: no-cache, no-store...`），确保用户能尽快拿到新 SW
- `PWARegister.tsx`：每 60 秒 `reg.update()`，并处理 `controllerchange` 自动刷新（训练中可延迟）

**生产注意点（⚠️）**
- **Vercel Preview 部署**同样是 `NODE_ENV=production`，也会注册 SW。  
  建议未来加入 `VERCEL_ENV === 'production'` gating，避免预览环境 SW 影响测试（可选项，不是必须阻塞）。

---

## 7) Manifest / PWA 配置（生产安全性）

✅ `manifest.ts` 使用相对路径：
- `start_url: '/'`
- `scope: '/'`
- `display: 'standalone'`
对生产域名天然安全。

⚠️ 关键点：**要触发 Android 正式安装，必须 HTTPS**。  
Vercel + 自定义域名默认是 HTTPS，满足要求。

---

## 8) IndexedDB / 离线层是否受部署影响？

结论：**不会**。  
Dexie/IndexedDB 数据存在设备侧，部署只会改变“网络端”。

⚠️ 但生产上线后需要验证：
- 用户关闭开发机后，手机打开仍能访问生产域名
- 缓存/离线能力是否能在真实 HTTPS 域名下正常工作

---

## 9) API Routes 生产兼容性概览

### 9.1 认证
- NextAuth Credentials + Prisma 查询用户：生产可用，但必须：
  - `AUTH_SECRET` 配置正确
  - `NEXTAUTH_URL/AUTH_URL` 对齐生产域名
  - 数据库可用（Postgres）

### 9.2 AI 能力
- 多个 route 使用 `DASHSCOPE_API_KEY`，未配置时会返回提示；生产要么配置，要么在 UI 上隐藏入口。

### 9.3 上传
- 头像上传（文件系统写入）必须改造（Blocker）。

---

## 10) 部署前必做修复（最小集合）

1. ✅ **数据库迁移：SQLite → Postgres（必须）**
   - Prisma datasource 改为 `provider = "postgresql"`
   - 迁移数据（至少 demo/核心数据结构）
   - Vercel 环境变量设置 `DATABASE_URL`
2. ✅ **头像上传：public 文件写入 → 对象存储（必须）**
   - 推荐：Vercel Blob（最贴近 Vercel）
   - 或：S3 / Cloudflare R2
3. ✅ **修复 ESLint 导入（建议）**
   - 避免 build 日志报错与潜在 CI 阻塞
4. ✅ **生产域名配置（必须）**
   - 设置 `NEXTAUTH_URL`（或 NextAuth v5 对应的 `AUTH_URL`）
   - 重新生成 `AUTH_SECRET`

---

## 11) Vercel 部署步骤（建议流程）

1. 创建 Vercel Project，绑定 Git 仓库
2. 设置 Node.js 版本为 **24.x**（Vercel 当前支持 24.x / 22.x / 20.x）  
3. 配置环境变量：
   - `AUTH_SECRET`
   - `DATABASE_URL`
   - （可选）`DASHSCOPE_API_KEY`
   - `NEXTAUTH_URL`/`AUTH_URL`（生产域名）
4. 首次部署（Production）
5. 数据库迁移与种子（具体方式取决于选用的 Postgres 供应商）
6. 绑定自定义域名（Production HTTPS）

---

## 12) 部署后 PWA 验证清单（真实手机）

> 这部分建议按 `docs/PWA-Real-Device-Validation-Plan.md` 执行，但部署后至少跑一遍：

- Android（Chrome）
  - 地址栏出现“安装”入口
  - 安装后 standalone（无浏览器 UI）
  - 离线启动（访问过页面）可加载缓存
  - 训练离线保存 → 恢复网络自动同步
  - 发布新版本后，已安装 PWA 能自动更新（无 stale bundle）

- iOS（Safari + A2HS）
  - 添加到主屏幕后全屏
  - 安全区不遮挡
  - IndexedDB 不被清除（已加入 `storage.persist()`，仍需实测）

---

## 13) 推荐下一步（只选一个最高优先级）

### ✅ 推荐：**先确定“生产数据库 + 头像存储”方案**（这是上云的硬前置）

原因：
- PWA、SW、离线层基本已经到位；真正阻塞“脱离开发机长期使用”的是 **后端持久化与文件存储**。
- 一旦数据库与头像存储稳定，才能开始可信的“更新管线验证”和“开发机关闭仍可用”的关键场景测试。

---

## Sources
- Supported Node.js versions (Vercel docs): https://vercel.com/docs/functions/runtimes/node-js/node-js-versions

