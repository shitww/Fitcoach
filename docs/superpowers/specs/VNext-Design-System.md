# FitCoach VNext Design System

## 1. 设计原则

- **语义优先**：所有颜色、间距、圆角必须通过 token 引用，禁止硬编码 hex/rgba/#111/text-black/text-white。
- **WCAG 对比**：dark 模式 muted-foreground ≥ 3:1 on card；light 模式 ≥ 4.5:1 on white。
- **四卡系统**：只允许 Primary / Secondary / Glass / Metric 四种卡片，禁止任意 border-radius 或 box-shadow。
- **五级排版**：Hero Number / Section Title / Metric Label / Secondary Text / Caption。
- **四钮系统**：只允许 primary / secondary / ghost / danger 四种按钮，禁止页面私有按钮样式。
- **五态色**：success / warning / danger / recovery / inactive。
- **统一图标**：全部使用 Lucide React，禁止 emoji 与随机图标混用。

---

## 2. Token 定义

### 2.1 核心 Token（CSS 变量）

文件：`src/app/globals.css`

| Token | Dark | Light | 用途 |
|-------|------|-------|------|
| `--background` | `0 0 0` | `250 250 250` | 页面背景 |
| `--foreground` | `245 245 245` | `18 18 22` | 主文本 |
| `--card` | `10 10 10` | `255 255 255` | 卡片背景 |
| `--card-foreground` | `235 235 235` | `18 18 22` | 卡片文本 |
| `--secondary` | `22 22 22` | `240 240 240` | 次级表面 |
| `--muted` | `32 32 32` | `228 228 231` | 输入/禁用表面 |
| `--muted-foreground` | `160 160 160` | `100 100 108` | 次级文本 |
| `--primary` | `204 255 0` | `0 0 0` | 品牌色（lime / black） |
| `--primary-foreground` | `0 0 0` | `255 255 255` | 品牌色上的文本 |
| `--accent` | `204 255 0` | `0 0 0` | 强调色（同 primary） |
| `--accent-foreground` | `0 0 0` | `255 255 255` | 强调色上的文本 |
| `--border` | `50 50 50` | `212 212 216` | 边框 |
| `--input` | `50 50 50` | `212 212 216` | 输入框边框 |
| `--ring` | `204 255 0` | `0 0 0` | focus ring |

### 2.2 状态色 Token

| Token | Dark | Light | 用途 |
|-------|------|-------|------|
| `--success` | `52 211 153` | `21 128 61` | 成功 |
| `--warning` | `251 191 36` | `180 83 9` | 警告 |
| `--danger` | `255 59 92` | `220 38 38` | 危险/错误 |
| `--recovery` | `52 211 153` | `21 128 61` | 恢复/健康 |
| `--inactive` | `120 120 120` | `150 150 150` | 未激活 |

### 2.3 半径 Token

| Token | 计算方式 | 值（默认 0.75rem） |
|-------|----------|-------------------|
| `--radius-sm` | `calc(var(--radius) - 4px)` | 0.5rem |
| `--radius-md` | `calc(var(--radius))` | 0.75rem |
| `--radius-lg` | `calc(var(--radius) + 4px)` | 1.0rem |
| `--radius-xl` | `calc(var(--radius) + 8px)` | 1.25rem |

### 2.4 排版 Token

| Token | 值 | 用途 |
|-------|-----|------|
| `--font-size-hero` | 2.5rem | 大数字/分数 |
| `--font-size-section` | 1.25rem | 区块标题 |
| `--font-size-metric` | 0.875rem | 数据标签 |
| `--font-size-secondary` | 0.8125rem | 正文/描述 |
| `--font-size-caption` | 0.6875rem | 标签/徽章 |

### 2.5 间距 Token

| Token | 值 | 用途 |
|-------|-----|------|
| `--space-page` | 1.5rem | 页面边距 |
| `--space-section` | 1rem | 区块间距 |
| `--space-card` | 1.25rem | 卡片内边距 |
| `--space-inner` | 0.75rem | 组件内部间距 |
| `--space-tight` | 0.5rem | 紧凑间距 |

---

## 3. 文件结构

```
src/
├── app/
│   └── globals.css           # VNext token 定义（唯一真源）
├── lib/
│   └── themes.ts             # TypeScript token 接口 + 主题注册表
├── contexts/
│   └── ThemeContext.tsx      # 语义色计算 helpers（color-mix 基础）
├── components/
│   ├── ui/
│   │   ├── button.tsx        # 4-variant 按钮系统（primary/secondary/ghost/danger）
│   │   └── card.tsx          # shadcn 基础卡片（保持兼容）
│   └── design-system/        # VNext 统一组件（NEW）
│       ├── index.ts
│       ├── Card.tsx          # CardPrimary / CardSecondary / CardGlass / CardMetric
│       ├── Typography.tsx    # HeroNumber / SectionTitle / MetricLabel / SecondaryText / Caption
│       └── StateBadge.tsx    # StateBadge / StateDot / StateText
```

---

## 4. 组件系统

### 4.1 Card System（4 种卡片）

```tsx
import { Card, CardPrimary, CardSecondary, CardGlass, CardMetric } from "@/components/design-system";

// 快捷方式
<Card variant="primary">...</Card>   // bg-card + border-border + rounded-xl
<Card variant="secondary">...</Card> // bg-secondary + border-border + rounded-xl
<Card variant="glass">...</Card>     // bg-card/80 + backdrop-blur + rounded-xl
<Card variant="metric">...</Card>    // bg-card + border-border + rounded-lg
```

**禁止**：任意 `rounded-2xl`/`rounded-3xl` 覆盖、任意 `box-shadow`、任意 `bg-[#111]`。

### 4.2 Typography System（5 级文字）

```tsx
import { HeroNumber, SectionTitle, MetricLabel, SecondaryText, Caption } from "@/components/design-system";

<HeroNumber>142.5</HeroNumber>
<SectionTitle>今日训练</SectionTitle>
<MetricLabel>训练时长</MetricLabel>
<SecondaryText>这是一段描述文字</SecondaryText>
<Caption>标签文字</Caption>
```

**禁止**：`text-black`、`text-white`、任意 `text-[#hex]`、任意 `opacity-50`  on text。

### 4.3 Button System（4 种按钮）

```tsx
import { Button } from "@/components/ui/button";

<Button variant="primary">确认</Button>
<Button variant="secondary">取消</Button>
<Button variant="ghost">更多选项</Button>
<Button variant="danger">删除</Button>
```

**已删除**：`outline`、`muted`、`link` 变体。

### 4.4 State Colors（5 种状态）

```tsx
import { StateBadge, StateDot, StateText } from "@/components/design-system";

<StateBadge variant="success" dot>已完成</StateBadge>
<StateDot variant="warning" />
<StateText variant="danger">错误</StateText>
```

---

## 5. 重构组件清单

### 5.1 已重构组件

| 组件/页面 | 主要改动 |
|-----------|----------|
| `src/app/globals.css` | 删除 legacy tokens（surface-2/surface-3/accent-dim/accent-glow 等），新增状态色 token，新增 typography/spacing token |
| `src/lib/themes.ts` | 删除所有 hex/rgba legacy 字段，新增 warning/recovery/inactive 语义状态 |
| `src/contexts/ThemeContext.tsx` | `toLegacy` → `toSemantic`，全部改用 `color-mix()` 计算，移除硬编码 hex |
| `src/components/ui/button.tsx` | 删除 outline/muted/link 变体，保留 primary/secondary/ghost/danger |
| `src/components/design-system/Card.tsx` | **新建**：4 种严格卡片 |
| `src/components/design-system/Typography.tsx` | **新建**：5 级排版组件 |
| `src/components/design-system/StateBadge.tsx` | **新建**：5 种状态徽章 |
| `src/components/EmptyState.tsx` | 删除 `useTheme` 依赖，改用 Tailwind 语义类 |
| `src/app/_home/HomeShell.tsx` | 删除所有 inline style，改用 `bg-background text-foreground` 等 |
| `src/app/profile/page.tsx` | 删除 `text-black`、硬编码 rgba danger 色，改用 `bg-danger/10 text-danger` |
| `src/app/exercises/ExercisesContent.tsx` | 删除 `bg-white text-black`、`bg-amber-500 text-black` |
| `src/app/plans/page.tsx` | 删除 `bg-111`、`border-1e1e1e`、`#000`、`#fff` 等全部硬编码色 |
| `src/app/workout/[id]/edit/page.tsx` | 全面替换 `#111`/`#0a0a0a`/`rgba(255,255,255,0.x)` 为语义 token；删除 legacy CSS var 引用 |
| `src/app/workout/WorkoutController.tsx` | IntroOverlay 从 emoji string 重构为 ReactNode icon；训练类型卡片 emoji → Lucide 图标 |

### 5.2 待重构页面（按优先级）

| 页面 | 主要问题 |
|------|----------|
| `src/app/workout/WorkoutController.tsx` | 仍有大量 `var(--text-low)` / `var(--surface-2)` / `var(--surface)` 等 legacy 引用 |
| `src/app/workout/[id]/page.tsx` | 大量 inline style + 硬编码 rgba + emoji |
| `src/app/diet/page.tsx` | 大量 `t.surface` / `t.textMuted` + 硬编码 macro 颜色 + emoji-like text chars |
| `src/app/analytics/page.tsx` | `var(--surface)` / `var(--text-low)` / `#FFD700` / `#A855F7` 硬编码 |
| `src/app/history/page.tsx` | `var(--surface)` / `var(--text-low)` / emoji |
| `src/app/summary/page.tsx` | emoji + 硬编码颜色 |
| `src/app/intent/page.tsx` | emoji + 硬编码颜色 |
| `src/app/muscle-history/[muscle]/page.tsx` | emoji + 硬编码颜色 |
| `src/components/TrainingTypeModal.tsx` | emoji |
| `src/components/workout/ShareWorkoutCard.tsx` | emoji + 硬编码颜色 |
| `src/components/ai-coaching/ProgressiveOverloadPanel.tsx` | emoji |

---

## 6. 被删除/废弃清单

### 6.1 已删除的 CSS 变量

在 `globals.css` 与 `themes.ts` 中已移除：

- `--surface`, `--surface-2`, `--surface-3`
- `--accent-dim`, `--accent-glow`, `--accent-text`
- `--text-secondary`, `--text-muted`, `--text-high`, `--text-med`, `--text-low`, `--text-faint`
- `--nav-bg`, `--top-bg`
- `--bg-secondary`, `--bg-tertiary`, `--border-secondary`
- `--text-error`

### 6.2 已删除的 CSS 工具类

在 `globals.css` `@layer utilities` 中已移除：

- `.card`（硬编码 `border-radius: 1rem`）
- `.btn-accent`（硬编码阴影与颜色）
- `.text-glow` / `.glow-box` / `.border-glow`（使用 legacy tokens）

### 6.3 已删除的 Button 变体

在 `src/components/ui/button.tsx` 中已移除：

- `outline`
- `muted`
- `link`

### 6.4 废弃接口

`src/contexts/ThemeContext.tsx`：
- `LegacyColors` → `SemanticColors`
- `toLegacy()` → `toSemantic()`

---

## 7. 迁移检查清单

迁移任意页面/组件时，按此清单自查：

- [ ] 无 `text-black`、`text-white`、`bg-black`、`bg-white`
- [ ] 无 `#111`、`#0a0a0a`、`#1e1e1e`、`#000`、`#fff` 等硬编码色
- [ ] 无 `rgba(255,255,255,0.x)` 或 `rgba(0,0,0,0.x)` 文本/背景色
- [ ] 无 legacy CSS var：`var(--surface)`、`var(--surface-2)`、`var(--text-low)` 等
- [ ] 无 emoji 字符（`📝`、`🏃`、`💪`、`✅`、`⏱` 等）
- [ ] 无任意 `box-shadow`（除非是 token 定义的系统阴影）
- [ ] 无任意非 token 的 `border-radius`（只允许 `rounded-sm/md/lg/xl/full`）
- [ ] 无页面私有按钮样式（必须使用 `src/components/ui/button.tsx`）
- [ ] 无任意渐变（`bg-gradient-*`）
- [ ] 使用 Lucide 图标，不使用其他图标库或 Unicode symbol

---

## 8. 快速替换速查表

| 旧写法（禁止） | 新写法（推荐） |
|----------------|---------------|
| `style={{ background: '#111' }}` | `className="bg-secondary"` |
| `style={{ background: '#0a0a0a' }}` | `className="bg-card"` |
| `style={{ color: 'rgba(255,255,255,0.5)' }}` | `className="text-muted-foreground"` |
| `style={{ color: 'var(--text-low)' }}` | `className="text-muted-foreground"` |
| `style={{ background: 'var(--surface-2)' }}` | `className="bg-secondary"` |
| `style={{ border: '1px solid var(--border)' }}` | `className="border border-border"` |
| `text-black` | `text-primary-foreground`（在 primary/accent 背景上） |
| `text-white` | `text-foreground` |
| `bg-white` | `bg-card` |
| `📝` / `💪` / `🏃` | `<FileText />` / `<Dumbbell />` / `<Activity />` |
| `style={{ boxShadow: '0 0 20px var(--accent-glow)' }}` | 删除或改用 `ring` token |
