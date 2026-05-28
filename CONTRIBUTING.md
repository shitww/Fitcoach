# Contributing / 开发约束与规范（FitCoach）

> 目标：让任何人能在一致的工程约束下协作开发 FitCoach，减少风格分歧、架构漂移与生产风险。

## 0. TL;DR（你只需要记住这些）

- **只用 pnpm**（不要用 npm/yarn）；Node **>= 24**（见 `.node-version` / `package.json#engines`）。
- 开发前先跑：`pnpm install` → `pnpm dev`；提交前必须通过：`pnpm lint`、（如改动逻辑）`pnpm test`。
- **UI 禁止硬编码颜色**：Tailwind 颜色（`bg-zinc-*` / `text-gray-*` 等）与 inline style 的 `#fff/rgb(...)` 均禁止；统一使用语义化 token（如 `bg-background`、`text-foreground`、CSS 变量 `var(--foreground)` 等）。规则由 `eslint.config.mjs` 强制。
- **页面（page/layout）只负责编排**：尽量不要在 `src/app/**/page.tsx`、`layout.tsx` 写样式/复杂 UI 逻辑；抽到组件层（`src/components` 或 `src/app/<route>/_components`）。

---

## 1. 仓库结构（关键目录）

```
FitCoach/
├─ src/                       # Web 主应用源码（Next.js App Router）
├─ prisma/                    # Prisma schema、seed
├─ public/                    # 静态资源（注意：生产环境不要依赖可写文件系统）
├─ scripts/                   # 本地脚本（默认被 ESLint ignore）
├─ tests/                     # Node 内置 test runner 测试（TS 通过 tsx import）
├─ docs/                      # 规格/计划/审计/清单等文档
└─ fitcoach-miniprogram/      # 微信小程序（独立工程）
```

---

## 2. 环境与启动

### 2.1 环境要求

- Node.js：**>= 24**
- pnpm：**>= 10**（项目锁定 `packageManager`）
- 数据库：
  - 本地可使用 SQLite（`prisma/dev.db`）或按 README 使用 Postgres/Supabase
  - 生产部署请参考 `docs/Vercel-Deployment-Readiness-Audit-2026-05-27.md` 与 `docs/Vercel-Production-Rollout-Checklist.md`

### 2.2 安装与运行

```bash
pnpm install
pnpm dev
```

常用命令：

```bash
pnpm lint
pnpm test
pnpm build
```

> 小程序工程：进入 `fitcoach-miniprogram/` 后按其 README 运行。

---

## 3. 开发流程（建议）

1. **先写清楚需求/变更边界**
   - 功能型改动：在 `docs/` 写一份简短说明（目标、边界、验收），或补充到已有文档。
   - UI/交互重构：建议补一份 spec（参考 `docs/superpowers/specs/*`）。
2. **实现遵循最小可回滚原则**
   - 尽量小 PR、可读 diff、每次只解决一类问题。
3. **提交前自检**
   - `pnpm lint` 必过
   - 改动了纯逻辑/工具函数时：补 `tests/` 并跑 `pnpm test`

---

## 4. 代码规范（Web 主项目）

### 4.1 TypeScript / React 基本约定

- 默认使用 TypeScript，尽量避免 `any`；无法避免时写明原因与缩小范围。
- 组件命名使用 `PascalCase`，文件名同名（如 `MetricEditorSheet.tsx`）。
- 优先使用 `const` 与不可变数据结构；复杂状态优先拆分逻辑层（`src/lib/*`）以便测试。
- 避免在渲染路径中做昂贵计算；必要时 `useMemo` / 预计算。

### 4.2 Next.js App Router：Server/Client 边界

- **不要**在 Server Component 中使用仅 Client 可用的 API（如直接访问 `window`、`document`、localStorage）。
- 需要客户端能力的组件加 `"use client"`，并尽量把 client 边界下沉到最小组件。
- `next/dynamic` 的 `ssr: false` **只能放在 Client Component** 中（避免再次引入已知错误类型）。

### 4.3 UI 与样式规范（强约束）

这些约束由 `eslint.config.mjs` 强制执行（违规会直接 lint 失败）：

1. **禁止硬编码颜色**
   - 禁止 Tailwind 的硬编码色阶：`bg-zinc-*`、`text-gray-*`、`border-slate-*`、`bg-black/bg-white` 等。
   - 禁止在 inline style 中写 `#xxxxxx`、`rgb(...)`、`rgba(...)`、`hsl(...)` 等颜色字面量（用于 color/background/border 等属性）。
2. **统一使用语义化 token / CSS 变量**
   - Tailwind：`bg-background`、`text-foreground`、`border-border`、`text-muted-foreground` 等
   - CSS：`var(--foreground)`、`var(--border)` 等

### 4.4 页面（page/layout）职责边界（强约束）

- `src/app/**/page.tsx` / `layout.tsx`：以 **数据加载 + 布局编排 + 组件组合** 为主。
- 复杂 UI、交互与样式应下沉到：
  - 路由内组件：`src/app/<route>/_components/*`
  - 通用组件：`src/components/*`
  - 纯逻辑：`src/lib/*`（并尽量补测试）

---

## 5. Lint / 测试 / 质量门槛

### 5.1 ESLint

- 运行：`pnpm lint`
- 配置：`eslint.config.mjs`
- 注意：`scripts/**` 默认被 eslint ignore（见配置里的 `globalIgnores`）

### 5.2 测试（最小但有用）

- 测试框架：Node 内置 test runner（`node --test`）+ `tsx` 作为 TS loader
- 运行：`pnpm test`
- 建议：把日期处理、格式化、校验、选择器等**纯函数**放到 `src/lib/*`，并补 `tests/*`

---

## 6. Git / 分支 / Commit 规范

### 6.1 分支建议

- `main`：可部署/可回滚（尽量保持绿色）
- 功能分支：`feat/<topic>`、修复分支：`fix/<topic>`、重构分支：`refactor/<topic>`

### 6.2 Commit Message（建议采用 Conventional Commits）

格式：

```
<type>(optional-scope): <subject>
```

常用 type：
- `feat`：新功能
- `fix`：修复 bug
- `refactor`：重构（无功能变更）
- `perf`：性能优化
- `test`：测试
- `docs`：文档
- `chore`：工程杂项（锁文件、脚本等）

示例：
- `feat(profile): add metric editor sheet`
- `fix(auth): prevent html redirect in api responses`
- `refactor(ui): extract profile components`

---

## 7. PR 规范（合并前检查）

PR 描述至少包含：

- **目的**：解决什么问题
- **变更范围**：改了哪些模块/路由/接口
- **验证方式**：如何验证（命令 + 关键路径）
- **风险与回滚**：是否影响数据/认证/离线/PWA

合并前自检清单：

- [ ] `pnpm lint` 通过
- [ ] `pnpm test` 通过（若改了 `src/lib/*` / 关键逻辑）
- [ ] 关键路径手测：登录 → 首页 → 训练/饮食/历史/我的（受影响部分）
- [ ] 无新增硬编码颜色、无在 page/layout 写复杂样式逻辑
- [ ] 未提交 `.env*`、密钥、真实用户数据

---

## 8. 安全与配置（必须遵守）

- **禁止提交 secrets**：`.env.local`、生产密钥、DashScope key、Supabase key 等一律不得进仓库。
- 与生产相关的变更（数据库 provider、上传存储、NextAuth URL 等）请先阅读：
  - `docs/Vercel-Deployment-Readiness-Audit-2026-05-27.md`
  - `docs/Vercel-Production-Rollout-Checklist.md`

---

## 9. 小程序（fitcoach-miniprogram）协作说明

- 小程序是独立工程：依赖、构建与 lint 不与 Web 共用。
- 开发请按 `fitcoach-miniprogram/README.md`；提交时避免把其 `dist/` 当作源代码修改（除非你明确在提交构建产物）。

---

## 10. 需要帮助？

如果你不确定某个改动应放在哪一层（page / 组件 / lib），或不确定是否会触发 eslint 的“主题 token 约束”，建议先开一个小 PR/草稿 PR 讨论，避免大范围返工。

