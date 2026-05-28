# FitCoach — 首次生产发布 Rollout Checklist (Vercel + Supabase)

> 目标：把 FitCoach 部署成 **长期可用** 的线上 Mobile PWA：HTTPS 域名、可安装、离线可用、数据持久、更新可达。  
> 约束：**不改变现有离线架构**（SW + IndexedDB/Dexie + sync engine 维持不动）；避免引入额外基础设施；尽量少改代码；优先稳定与可维护。

---

## 0) 发布策略（一次性对齐）

### 0.1 发布路径
1. Supabase 项目初始化（Postgres + Storage）
2. Prisma 迁移到 Postgres（最小变更）
3. 头像上传改为 Supabase Storage（替代文件系统写入）
4. Vercel Production 部署 + 域名 HTTPS
5. 生产 PWA 验证 + 手机真实设备验证

### 0.2 Go/No-Go Gate（阻塞条件）
若出现任一情况 → **No-Go（停止扩大分发）**
- 登录/注册不可用
- 训练记录存在丢失或无法同步
- PWA 安装后启动白屏/无限刷新
- 生产数据库写入失败（API 大面积 5xx）
- Service Worker 更新导致页面资源 404 / hydration 崩溃

---

## 1) 迁移前 Preflight Checklist

### 1.1 代码与仓库
- [ ] 主分支代码可构建（`pnpm build`）并能本地跑通关键路径（登录、开始训练、历史页）
- [ ] 明确本次发布的 commit hash：`__________`
- [ ] 冻结本次发布期间的功能开发（只允许修复部署阻塞问题）

### 1.2 Vercel 运行时
- [ ] Vercel Project Node.js 版本设为 **24.x**（匹配 `package.json engines >=24`）
- [ ] 确认部署类型：Production（不是 Preview）

> 参考：Vercel 支持 Node 24.x/22.x/20.x（官方文档）。

### 1.3 域名与 HTTPS
- [ ] 准备生产域名：`https://__________`
- [ ] DNS 可改（CNAME/ALIAS 到 Vercel）

---

## 2) Supabase — Postgres 初始化

### 2.1 创建 Supabase Project
- [ ] 新建 Supabase 项目（建议选择离团队更近的 Region）
- [ ] 记录项目标识与连接信息（**不要**提交到 git）：
  - [ ] `DATABASE_URL`（Supabase Postgres 连接串，优先使用 **Pooler** 版本）
  - [ ] Dashboard URL（管理后台地址）

### 2.2 数据库基础校验
- [ ] 数据库可连接（本地临时用 psql / Prisma 验证）
- [ ] 确认时区/字符集默认即可（UTF-8）
- [ ] 确认连接池模式与最大连接数（避免 serverless 多实例爆连接）

---

## 3) Prisma — 从 SQLite 迁移到 Postgres（最小变更）

> 目标：保持 Prisma model 结构不变，仅切换 datasource provider 与连接串。

### 3.1 代码变更（最小集合）
- [ ] `prisma/schema.prisma` datasource：
  - [ ] `provider = "sqlite"` → `provider = "postgresql"`
  - [ ] `url = env("DATABASE_URL")` 保持不变

### 3.2 迁移执行策略（首发推荐：手工可控）
> 首次上线建议“可控”，不要把 migrate deploy 放进 Vercel build，避免构建失败时留下半迁移状态。

- [ ] 在本地把 `DATABASE_URL` 临时指向 Supabase Postgres
- [ ] 生成/对齐迁移（如已有 migrations，优先复用）：  
  - [ ] `pnpm db:generate`
  - [ ] `pnpm prisma migrate deploy`（或在首次时使用 `migrate dev` 生成迁移后再 deploy）
- [ ] 运行种子（可选但建议，至少 demo 账号）：  
  - [ ] `pnpm db:seed`（会创建 `demo@fitcoach.com / demo123`，如果 seed 脚本未禁用）

### 3.3 数据迁移（是否需要）
选择其一：
- [ ] **不迁移历史数据**（首发最简单）：生产从空库开始，仅 seed demo / 运营账号
- [ ] **迁移现有 SQLite 数据**（如果要保留）：需要导出/导入方案（本 checklist 不默认执行，需单独计划）

---

## 4) Supabase Storage — 头像上传替换方案

### 4.1 Bucket 规划
建议创建 bucket：`avatars`
- [ ] Bucket 名称：`avatars`
- [ ] 是否 Public：**建议 Public（首发最稳，最少代码）**
  - Public 的含义：读取不需要签名 URL；头像直接用公开 URL 渲染

### 4.2 路径规范（避免冲突）
建议对象 key：
- `avatars/<userId>/<timestamp>.<ext>`

### 4.3 Bucket Policy（最小复杂度版本）
> 若上传全部走服务端（用 service role key），则不需要为“写”配置复杂 RLS；只需保证读策略符合预期。

- [ ] 读策略：
  - [ ] Public bucket：允许所有人读取（用于头像展示）
- [ ] 写策略：
  - [ ] 仅服务端写入（使用 `SUPABASE_SERVICE_ROLE_KEY`，只存在于 Vercel Server 端环境变量）

### 4.4 需要新增的生产环境变量（仅用于服务端）
- [ ] `SUPABASE_URL`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] （可选）`SUPABASE_ANON_KEY`（如果未来前端直传/获取公共资源需要）

### 4.5 代码改造目标（最小 churn）
- [ ] `src/app/api/auth/avatar/route.ts`：
  - [ ] 移除 `fs/promises` 写文件到 `public/uploads`
  - [ ] 改为上传到 Supabase Storage（avatars bucket）
  - [ ] 返回 `avatar` 字段为可访问 URL，并写回 Prisma User.avatar

---

## 5) Vercel — 环境变量（Production-safe）

### 5.1 必需（Required）
- [ ] `DATABASE_URL`：Supabase Postgres（生产）
- [ ] `AUTH_SECRET`：生产新生成（32+ bytes 随机）

### 5.2 NextAuth URL（强烈建议）
> 目标：避免回调 URL/Host 推断错误导致登录异常。
- [ ] `AUTH_URL` = `https://<your-domain>`
- [ ] `NEXTAUTH_URL` = `https://<your-domain>`（兼容旧写法，可同时设置）

### 5.3 可选（Feature gated）
- [ ] `DASHSCOPE_API_KEY`（如要开启拍照识别、AI 饮食分析等）

### 5.4 Supabase（服务端）
- [ ] `SUPABASE_URL`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`

### 5.5 环境变量分层
在 Vercel 中分别配置：
- [ ] Production
- [ ] Preview（建议先不启用 SW，见下方验证建议）

---

## 6) Rollback 策略（必须提前写清）

### 6.1 应用回滚（Vercel）
- [ ] 保留上一个 Production Deployment（Vercel 可一键回滚到旧版本）
- [ ] 回滚触发条件：
  - [ ] 登录不可用 / 大面积 5xx
  - [ ] 安装后白屏或无限刷新
  - [ ] 训练保存/同步出现数据丢失

### 6.2 数据库回滚（Supabase）
> DB 回滚是最难的，首发尽量避免“不可逆 schema 变更”。

- [ ] 首发只做 **向前兼容** 的迁移（不删除列/不重命名关键列）
- [ ] 若需要回滚 schema：
  - [ ] 先在 Supabase 做备份/快照（或启用 PITR，如套餐支持）
  - [ ] 回滚到上一迁移版本（Prisma migrate rollback 不推荐直接用于生产；更建议手工反向迁移 SQL）

### 6.3 Storage 回滚
- [ ] 头像 URL 保持兼容：即使回滚应用版本，也能继续显示头像（URL 不变）

---

## 7) 部署验证步骤（Deploy Validation）

### 7.1 上线前 smoke test（在 Vercel Production URL）
- [ ] 打开首页（未登录 → 登录页）
- [ ] 使用 demo 账号登录
- [ ] 首页 dashboard 正常渲染
- [ ] 训练页可进入，记录保存成功（在线）
- [ ] 历史页可加载
- [ ] 头像上传可用（若已改造）

### 7.2 PWA 生产验证（核心）
> 这些必须在 **HTTPS 生产域名** 下验证。

- [ ] `https://domain/manifest.webmanifest` 能访问
- [ ] `https://domain/sw.js`：
  - [ ] response header 包含 `no-cache`（确保更新可达）
- [ ] Chrome DevTools → Application：
  - [ ] Service Worker 已注册并控制页面
  - [ ] Cache Storage 有 `xfitx-sw-v3`
- [ ] Lighthouse / Application → Installability：
  - [ ] 可安装（Installable）

### 7.3 更新管线验证（必须）
- [ ] 部署一个可见 UI 改动（例如标题加 “vNext”）
- [ ] 手机已安装的 PWA 静置 2~3 分钟后再次打开
- [ ] 观察：
  - [ ] 新 SW 是否发现并激活（当前实现 60s poll）
  - [ ] 训练中是否会延迟 reload（不打断训练）
  - [ ] 更新后无白屏/无限 reload/资源 404

---

## 8) 上线后手机验证 Checklist（Android + iOS）

> 建议用 `docs/PWA-Real-Device-Validation-Plan.md` 全量执行；这里是“生产最小必测集”。

### 8.1 Android（Chrome）
- [ ] 打开生产 HTTPS URL → 出现安装入口（或“我的→添加到主屏幕”有效）
- [ ] 安装后从桌面启动（standalone，无地址栏）
- [ ] 断网 → 打开 App（至少 dashboard/history 有缓存可看）
- [ ] 训练中断网记录 → 完成训练 → 杀进程 → 离线重开 → 数据仍在
- [ ] 恢复网络 → 自动同步成功（顶部同步条消失）

### 8.2 iOS（Safari + Add to Home Screen）
- [ ] Safari 打开生产 URL → A2HS 引导可用
- [ ] 添加到主屏幕后启动全屏
- [ ] 安全区不遮挡（刘海/底部条）
- [ ] 挂起 1~5 分钟恢复无白屏
- [ ] 断网重开：能看到缓存内容（无空白页）

---

## 9) 发布后清理（Deployment Cleanup）

- [ ] 确认生产环境不依赖任何本地脚本（ngrok/LAN）
- [ ] 移除/降低生产环境的无意义 console 日志（若影响排查可保留少量关键日志）
- [ ] 在文档中记录：
  - [ ] 生产 URL
  - [ ] Demo 账号（如仍保留）
  - [ ] 回滚操作入口（Vercel/Supabase）

---

## Sources
- Vercel Node.js 版本支持列表：https://vercel.com/docs/functions/runtimes/node-js/node-js-versions

