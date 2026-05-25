# XFITX UI 审查与修复计划

## 审查范围

对 `d:\FitCoach` 项目的 UI 进行三维度全面审查：
1. **响应式设计** — 桌面端与移动端适配
2. **主题切换** — 深色/浅色模式切换流畅性
3. **设计美学** — UI 设计模式的合理性与美观度

审查依据：Vercel Web Interface Guidelines（17 类 80+ 条规则）

---

## 当前状态分析

### 架构概况

- **框架**: Next.js 14 (App Router) + TypeScript
- **样式方案**：三种样式方式并存 —— CSS 变量 (`globals.css`)、内联 style、Tailwind 硬编码类 (`bg-zinc-950`, `text-white`)
- **主题系统**：`ThemeContext.tsx` 管理 dark/light 双主题，通过 `data-theme` 属性切换
- **已适配主题的页面**：`page.tsx`（首页）、`profile/page.tsx`（个人中心）—— 使用了 `useTheme()` Hook
- **未适配主题的页面**：`diet/page.tsx`、`settings/page.tsx` —— 直接使用硬编码 Tailwind 暗色类
- **未适配主题的组件**：`Toast.tsx`、`Skeleton.tsx`、`EmptyState.tsx` —— 颜色全部硬编码为暗色

### 核心问题

1. **主题适配不完整**：5 个文件中关键组件和页面未适配亮色主题，亮色模式下显示异常
2. **样式方法分裂**：同一个页面混用三种样式方式，维护困难
3. **globals.css 补丁泛滥**：63-149 行使用大量 `!important` + 属性选择器硬覆盖 Tailwind 类，脆弱且性能差
4. **`prefers-reduced-motion` 缺失**：所有动画未考虑无障碍偏好
5. **移动端交互细节不完善**：部分弹窗缺少安全区域处理、overscroll-behavior

---

## 修复计划

### 阶段一：主题切换核心修复（优先级最高）

#### 1.1 修复 Toast 组件亮色适配
- **文件**: `src/components/Toast.tsx`
- **问题**: 背景色硬编码 `rgba(15,15,15,0.97)`，文字硬编码 `text-white`
- **方案**: 引入 `useTheme()` Hook，将 Toast bubble 背景和文字改为 CSS 变量引用
- **改动**:
  - ToastBubble 背景: `var(--nav-bg)` 替代 `rgba(15,15,15,0.97)`
  - 文字颜色: `var(--foreground)` 替代 `text-white`
  - Undo 按钮颜色: `var(--accent)` 已正确使用 CSS 变量 ✅

#### 1.2 修复 Skeleton 组件亮色适配
- **文件**: `src/components/Skeleton.tsx`
- **问题**: 所有 Pulse 和卡片背景硬编码暗色（`#1a1a1a`, `#0a0a0a`, `#1e1e1e`）
- **方案**: 引入 `useTheme()` Hook，将硬编码颜色替换为 `t.surface`, `t.surface2`, `t.border` 等
- **改动**:
  - `Pulse` 背景：`#1a1a1a` → `t.surface3`
  - 卡片背景：`#0a0a0a` → `t.surface`
  - 边框：`#1e1e1e` → `t.border`
  - 分割线：`#1a1a1a` → `t.border`
- **注意**: Skeleton 组件目前是服务端/客户端皆可渲染的类型定义，需标记为 `"use client"`（已标记 ✅）

#### 1.3 修复 EmptyState 组件亮色适配
- **文件**: `src/components/EmptyState.tsx`
- **问题**: 文字白色硬编码、icon 容器暗色硬编码
- **方案**: 引入 `useTheme()` Hook
- **改动**:
  - 标题文字 `text-white` → `style={{ color: t.text }}`
  - 副标题 `color: 'rgba(255,255,255,0.3)'` → `style={{ color: t.textMuted }}`
  - Icon 容器 `background: 'rgba(255,255,255,0.04)'` → `style={{ background: t.surface2 }}`
  - Icon 容器边框 `rgba(255,255,255,0.08)` → `style={{ borderColor: t.border }}`
  - Icon 颜色 `rgba(255,255,255,0.2)` → `style={{ color: t.textFaint }}`
  - Secondary button 颜色 `rgba(255,255,255,0.45)` → `style={{ color: t.textMuted }}`

#### 1.4 修复饮食页面亮色适配
- **文件**: `src/app/diet/page.tsx`（约 800+ 行）
- **问题**: 整个页面使用 `bg-zinc-950 text-white` 等硬编码暗色类，依赖 globals.css 的 `!important` 补丁
- **方案**: 引入 `useTheme()` Hook，将根容器和关键元素切换到 CSS 变量
- **关键改动**:
  - 最外层 div `bg-zinc-950 text-white` → `style={{ background: t.bg, color: t.text }}`
  - 各卡片容器 `bg-zinc-900` → `bg-[var(--surface)]`
  - 按钮文字 `text-white` → `text-[var(--foreground)]`
  - RingProgress 组件：`text-white` → `style={{ color: t.text }}`，`text-zinc-500` → `style={{ color: t.textMuted }}`
  - 弹窗背景硬编码 → CSS 变量
- **注意**: 此页面代码量较大，需逐区域检查，确保无遗漏

#### 1.5 修复设置页面亮色适配
- **文件**: `src/app/settings/page.tsx`
- **问题**: 同样使用 `bg-black text-white` 硬编码，依赖补丁规则
- **方案**: 引入 `useTheme()` Hook，使用 CSS 变量
- **关键改动**:
  - 最外层 `bg-black text-white` → `style={{ background: t.bg, color: t.text }}`
  - Tab 按钮的 `#111`/`#0a0a0a` → `var(--surface)`/`var(--surface-2)`
  - 输入框背景 → `var(--surface-2)`
  - Notification toggle switch 的 inline style 改为 CSS 变量引用
  - Loading 状态页面背景 `bg-black` → `style={{ background: t.bg }}`
  - 文字颜色 `rgba(255,255,255,0.3)` → `style={{ color: t.textMuted }}`

#### 1.6 清理 globals.css 补丁规则
- **文件**: `src/app/globals.css`
- **操作**: 在以上 1.1-1.5 完成后，逐步移除不再需要的 `!important` 补丁规则（63-149 行），保留必要的 Tailwind class 覆盖
- **注意**: 此操作应在所有组件适配完成且验证通过后进行，避免回归

---

### 阶段二：响应式设计修复

#### 2.1 弹窗添加 overscroll-behavior
- **文件**: `src/app/diet/page.tsx`（弹窗相关部分）
- **问题**: Guidelines 要求模态框应设置 `overscroll-behavior: contain` 防止背景滚动穿透
- **改动**: 在弹窗容器上添加 `style={{ overscrollBehavior: 'contain' }}`

#### 2.2 底部导航安全区域
- **文件**: `src/app/page.tsx`（底部导航 483-523 行）
- **当前状态**: 已使用 `backdropFilter` 和 `position: fixed`，但缺少 `padding-bottom: env(safe-area-inset-bottom)`
- **改动**: 在 nav 元素上添加 `paddingBottom: 'env(safe-area-inset-bottom, 0px)'`，确保在 iPhone X+ 设备上不被系统手势栏遮挡

#### 2.3 训练选择页容器宽度
- **文件**: `src/app/workout/page.tsx`
- **问题**: 使用了 `max-w-sm`（384px），在平板横屏时可能过窄
- **改动**: 检查并适当放宽为 `max-w-md` 或根据断点使用 `sm:max-w-sm lg:max-w-md`

#### 2.4 检查全局 viewport meta
- **文件**: `src/app/layout.tsx`
- **当前状态**: `meta name="viewport" content="width=device-width, initial-scale=1"` ✅
- **验证**: 确认未使用 `user-scalable=no`（Guidelines 反模式）
- **建议**: 可考虑添加 `viewport-fit=cover` 以支持全面屏设备

#### 2.5 点击目标最小尺寸检查
- **文件**: `src/app/diet/page.tsx`、`src/components/Toast.tsx`
- **问题**: 部分关闭按钮 padding 为 `p-1`（36px 点击区域），在移动端可能偏小
- **改动**: 将交互关键按钮的 padding 提升至 `p-2` 以上（≥44px 点击区域）

---

### 阶段三：设计美学与规范修复

#### 3.1 替换 `transition: all` 反模式
- **文件**: `src/app/globals.css:199`
- **问题**: `.btn-accent { transition: all 0.2s; }` 违反 Guidelines
- **改动**: 改为明确的属性 `transition: background-color 0.2s, box-shadow 0.2s, transform 0.2s;`

#### 3.2 替换省略号 `...` → `…`
- **文件**: 全项目搜索替换
- **涉及位置**:
  - `src/app/settings/page.tsx`：`'退出中...'` → `'退出中…'`
  - `src/app/profile/page.tsx`：`'退出中...'` → `'退出中…'`
  - `src/app/diet/page.tsx`：`'保存中...'` → `'保存中…'`
  - 其他 placeholder 文本中的 `...`
- **注意**: 保留代码中的 `...`（spread operator），仅替换 UI 文案中的 `...`

#### 3.3 添加 `prefers-reduced-motion` 支持
- **文件**: 全部动画相关文件
- **目标**:
  1. 在 `globals.css` 中添加：
     ```css
     @media (prefers-reduced-motion: reduce) {
       .btn-accent { transition: none; }
       *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
     }
     ```
  2. 在 `FloatingTimer.tsx` 中使用 framer-motion 的 `useReducedMotion()` Hook
  3. 在 toast 动画的 keyframes 上添加 prefers-reduced-motion 媒体查询

#### 3.4 抽取环境光背景为共享组件
- **新建文件**: `src/components/AmbientGlow.tsx`
- **改动**: 将当前 5 个页面中重复的 `fixed inset-0` + `radial-gradient` 代码抽取为：
  ```tsx
  export function AmbientGlow() {
    return (
      <div className="fixed inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 60% 40% at 50% 0%, var(--accent-dim) 0%, transparent 60%)'
      }} />
    )
  }
  ```
- **涉及页面**: `page.tsx`, `profile/page.tsx`, `workout/page.tsx`, `settings/page.tsx` 等

#### 3.5 添加 heading `text-wrap: balance`
- **文件**: `globals.css`
- **改动**: 在 `@layer base` 中添加：
  ```css
  h1, h2, h3, h4 { text-wrap: balance; }
  ```

#### 3.6 亮色主题 accent 对比度优化
- **文件**: `src/contexts/ThemeContext.tsx`
- **问题**: 亮色主题 accent `#3B82F6`（蓝色）在 `#f4f4f5` 背景上对比度仅约 4.3:1，对普通文本可能不足
- **方案**: 将亮色 accent 加深至 `#2563EB`（对比度提升至约 5.9:1，满足 WCAG AA）

#### 3.7 中文字体栈优化
- **文件**: `src/app/globals.css` 或 `layout.tsx`
- **问题**: 仅指定了 Inter + Space Grotesk（拉丁字体），中文回退到系统默认
- **方案**: 在 body 的 font-family 中添加中文字体回退：
  ```css
  font-family: var(--font-inter), var(--font-space-grotesk), 'PingFang SC', 'Microsoft YaHei', 'Hiragino Sans GB', 'Noto Sans SC', sans-serif;
  ```

---

## 执行顺序

| 优先级 | 阶段 | 描述 | 涉及文件数 | 风险等级 |
|--------|------|------|-----------|---------|
| P0 | 1.1-1.5 | 主题适配：Toast/Skeleton/EmptyState/diet/settings | 5 | 中（需逐组件验证） |
| P0 | 3.1 | `transition: all` 反模式修复 | 1 | 低 |
| P1 | 2.1-2.2 | 弹窗 overscroll + 底部导航安全区 | 2 | 低 |
| P1 | 3.3 | `prefers-reduced-motion` 支持 | 3+ | 低 |
| P1 | 3.6 | 亮色 accent 对比度提升 | 1 | 低 |
| P2 | 1.6 | 清理 globals.css 补丁规则 | 1 | 中（依赖 P0 完成） |
| P2 | 3.2 | 省略号替换 | 3+ | 低 |
| P2 | 3.4 | 环境光组件抽取 | 4+ | 低 |
| P2 | 3.5 | heading text-wrap | 1 | 低 |
| P2 | 3.7 | 中文字体栈 | 1 | 低 |
| P3 | 2.3 | 训练页容器宽度 | 1 | 低 |
| P3 | 2.4-2.5 | Viewport meta + 点击目标 | 2 | 低 |

---

## 假设与决策

1. **保持暗色优先策略**：项目以暗色主题为默认并首先加载暗色背景（`html { background-color: var(--background) }`），亮色用户在 JS 执行前会短暂看到暗色背景。这是合理的性能权衡，不做修改。
2. **CSS 变量为主，逐步迁移**：不强制一次性全部迁移到 CSS 变量，P0 阶段优先让组件在亮色下"可用"，后续迭代中逐步统一。
3. **framer-motion 保留**：FloatingTimer 中的 framer-motion 依赖是已有依赖，不在本次审查中去掉，仅在其上添加 `useReducedMotion()` 支持。
4. **不重写整个页面**：diet/page.tsx 代码量巨大（800+ 行），本次仅修改亮色主题适配，不进行架构重构。

---

## 验证方式

每个阶段完成后执行以下验证：

1. **主题切换验证**:
   - 在浏览器 DevTools 中强制切换 `data-theme` 属性
   - 验证每个修复的组件在亮色/暗色下均正常显示
   - 重点检查 Toast、Skeleton 在加载状态下的颜色

2. **响应式验证**:
   - Chrome DevTools 设备模拟（iPhone SE 375px / iPad 768px / Desktop 1440px）
   - 验证底部导航不被系统手势栏遮挡
   - 验证弹窗滚动行为且不可穿透

3. **设计规范验证**:
   - DevTools Performance 面板检查 theme toggle 时的重绘
   - 检查 `prefers-reduced-motion: reduce` 下动画是否禁用
   - WAVE / axe DevTools 检查无障碍问题
