# Profile Hub（/profile）重构 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 `src/app/profile/page.tsx` 重构为“个人资料 + 身体数据中心（Profile Hub）”，支持 Metrics Grid + Bottom Sheet 单指标编辑，并按日期选择 PATCH/POST 保存，移动端体验优先。

**Architecture:** Profile 页面负责数据加载与路由入口；身体指标相关 UI 组件拆到 `src/app/profile/_components/*`；纯逻辑（日期匹配、指标配置、输入校验、格式化）拆到 `src/lib/body-metrics.ts`，便于复用与最小测试。

**Tech Stack:** Next.js App Router, React, TypeScript, TailwindCSS, shadcn/ui（Button/Card/Dialog/Input 等）, Vaul Drawer（Bottom Sheet）, Framer Motion（克制动效 + reduced motion）

---

## 0) 文件结构（本次将创建/修改哪些文件）

**Modify**
- `src/app/profile/page.tsx`：改为 Profile Hub 结构、加载 bodyData records、渲染 KPI + 网格 + 入口 + 设置收纳

**Create**
- `src/lib/body-metrics.ts`：指标配置、格式化、日期判断、输入校验/规范化
- `src/app/profile/_components/IdentityCard.tsx`
- `src/app/profile/_components/BodyKpiCard.tsx`
- `src/app/profile/_components/MetricCard.tsx`
- `src/app/profile/_components/MetricEditorSheet.tsx`
- `tests/body-metrics.test.ts`：最小单测（Node 内置 test runner）

**Potential Modify（仅在需要时）**
- `package.json`：添加 `test` script（不引入新依赖）

---

## 1) Task 1：补齐最小测试入口（不引入新依赖）

**Files:**
- Modify: `package.json`
- Create: `tests/body-metrics.test.ts`

- [ ] **Step 1: 在 package.json 添加 test 脚本**

将 scripts 增加一行：

```json
{
  "scripts": {
    "test": "node --test --import tsx"
  }
}
```

- [ ] **Step 2: 写一个最小可运行的测试文件（先让它失败）**

创建 `tests/body-metrics.test.ts`：

```ts
import test from "node:test";
import assert from "node:assert/strict";

import { isSameLocalDay } from "@/lib/body-metrics";

test("isSameLocalDay() should match the same day regardless of time", () => {
  const a = new Date("2026-05-28T01:00:00.000Z");
  const b = new Date("2026-05-28T23:00:00.000Z");
  assert.equal(isSameLocalDay(a, b), true);
});
```

- [ ] **Step 3: 运行测试确认失败**

Run:

```bash
pnpm test
```

Expected: FAIL（因为 `src/lib/body-metrics.ts` 还不存在 / 未导出 `isSameLocalDay`）

---

## 2) Task 2：实现纯逻辑层 `src/lib/body-metrics.ts`

**Files:**
- Create: `src/lib/body-metrics.ts`
- Test: `tests/body-metrics.test.ts`

- [ ] **Step 1: 实现 isSameLocalDay + startOfLocalDay（最小实现让测试通过）**

创建 `src/lib/body-metrics.ts`：

```ts
export function startOfLocalDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function isSameLocalDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
```

- [ ] **Step 2: 运行测试确认通过**

Run:

```bash
pnpm test
```

Expected: PASS

- [ ] **Step 3: 增加 “按日期查找今天记录” 的 helper，并补测试**

在 `src/lib/body-metrics.ts` 追加：

```ts
export type BodyDataRecord = {
  id: string;
  date: string; // API JSON: ISO string
  weight?: number | null;
  bodyFat?: number | null;
  chest?: number | null;
  waist?: number | null;
  hip?: number | null;
  armLeft?: number | null;
  armRight?: number | null;
  thighLeft?: number | null;
  thighRight?: number | null;
  neck?: number | null;
  notes?: string | null;
};

export function findRecordByLocalDay(records: BodyDataRecord[], day: Date) {
  const target = startOfLocalDay(day).getTime();
  return (
    records.find((r) => startOfLocalDay(new Date(r.date)).getTime() === target) ?? null
  );
}
```

并在 `tests/body-metrics.test.ts` 追加：

```ts
import { findRecordByLocalDay } from "@/lib/body-metrics";

test("findRecordByLocalDay() should find today's record without relying on index", () => {
  const records = [
    { id: "old", date: "2026-05-27T10:00:00.000Z", weight: 73 },
    { id: "today", date: "2026-05-28T00:10:00.000Z", weight: 72.4 },
  ];
  const hit = findRecordByLocalDay(records as any, new Date("2026-05-28T12:00:00.000Z"));
  assert.equal(hit?.id, "today");
});
```

- [ ] **Step 4: 运行测试确认通过**

Run:

```bash
pnpm test
```

Expected: PASS

---

## 3) Task 3：定义 Metrics 配置、格式化与校验（继续在 lib 层）

**Files:**
- Modify: `src/lib/body-metrics.ts`
- Test: `tests/body-metrics.test.ts`

- [ ] **Step 1: 定义 MetricKey 与配置表（MVP 仅现有字段）**

在 `src/lib/body-metrics.ts` 追加：

```ts
export type MetricKey =
  | "bodyFat"
  | "chest"
  | "waist"
  | "hip"
  | "armLeft"
  | "armRight"
  | "thighLeft"
  | "thighRight"
  | "neck";

export type MetricConfig = {
  key: MetricKey;
  label: string;
  unit: string;
  // UI 快捷按钮步进（用于 -0.1/+0.1 等）
  steps: number[];
  // 合理范围（用于基础校验）
  min?: number;
  max?: number;
};

export const METRICS: MetricConfig[] = [
  { key: "bodyFat", label: "体脂", unit: "%", steps: [0.1, 0.5, 1], min: 1, max: 70 },
  { key: "chest", label: "胸围", unit: "cm", steps: [0.1, 0.5, 1], min: 30, max: 200 },
  { key: "waist", label: "腰围", unit: "cm", steps: [0.1, 0.5, 1], min: 30, max: 200 },
  { key: "hip", label: "臀围", unit: "cm", steps: [0.1, 0.5, 1], min: 30, max: 200 },
  { key: "armLeft", label: "左臂", unit: "cm", steps: [0.1, 0.5, 1], min: 10, max: 100 },
  { key: "armRight", label: "右臂", unit: "cm", steps: [0.1, 0.5, 1], min: 10, max: 100 },
  { key: "thighLeft", label: "左腿", unit: "cm", steps: [0.1, 0.5, 1], min: 20, max: 120 },
  { key: "thighRight", label: "右腿", unit: "cm", steps: [0.1, 0.5, 1], min: 20, max: 120 },
  { key: "neck", label: "颈围", unit: "cm", steps: [0.1, 0.5, 1], min: 10, max: 80 },
];
```

- [ ] **Step 2: 增加数字输入规范化/校验函数**

在 `src/lib/body-metrics.ts` 追加：

```ts
export function parseDecimalInput(raw: string) {
  const s = raw.trim().replace(/,/g, ".");
  if (!s) return null;
  const n = Number(s);
  if (Number.isNaN(n)) return null;
  return n;
}

export function validateMetricValue(cfg: MetricConfig, value: number) {
  if (!Number.isFinite(value)) return "请输入有效数字";
  if (cfg.min != null && value < cfg.min) return `不能小于 ${cfg.min}${cfg.unit}`;
  if (cfg.max != null && value > cfg.max) return `不能大于 ${cfg.max}${cfg.unit}`;
  return null;
}

export function formatMetricValue(value: number, unit: string) {
  const fixed = unit === "%" ? value.toFixed(1) : value.toFixed(1);
  // 去掉尾随 .0（保持干净）
  return fixed.replace(/\.0$/, "") + unit;
}
```

- [ ] **Step 3: 为 parseDecimalInput 增加测试**

在 `tests/body-metrics.test.ts` 追加：

```ts
import { parseDecimalInput } from "@/lib/body-metrics";

test("parseDecimalInput() should parse decimal strings", () => {
  assert.equal(parseDecimalInput("72.4"), 72.4);
  assert.equal(parseDecimalInput("72,4"), 72.4);
  assert.equal(parseDecimalInput(""), null);
  assert.equal(parseDecimalInput("abc"), null);
});
```

- [ ] **Step 4: 运行测试**

Run:

```bash
pnpm test
```

Expected: PASS

---

## 4) Task 4：实现 MetricCard（2 列网格、≥44px 点击区域）

**Files:**
- Create: `src/app/profile/_components/MetricCard.tsx`

- [ ] **Step 1: 创建组件 MetricCard（纯 presentational）**

```tsx
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  valueText: string;
  timeText?: string;
  onClick?: () => void;
};

export function MetricCard({ label, valueText, timeText, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full text-left rounded-2xl border",
        "px-4 py-4",
        "transition-colors",
        "active:scale-[0.99]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]",
      )}
      style={{
        background: "var(--surface)",
        borderColor: "var(--border)",
        minHeight: 88, // 确保移动端点击面积
      }}
      aria-label={`${label}，${valueText}`}
    >
      <div className="text-xs font-semibold" style={{ color: "var(--text-low)" }}>
        {label}
      </div>
      <div className="mt-2 text-lg font-black tracking-tight" style={{ color: "var(--foreground)" }}>
        {valueText}
      </div>
      {timeText ? (
        <div className="mt-2 text-[11px]" style={{ color: "var(--text-faint)" }}>
          {timeText}
        </div>
      ) : (
        <div className="mt-2 text-[11px]" style={{ color: "transparent" }}>
          .
        </div>
      )}
    </button>
  );
}
```

- [ ] **Step 2: 通过 TypeScript 编译检查**

Run:

```bash
pnpm lint
```

Expected: 无新增 TS/ESLint 报错

---

## 5) Task 5：实现 MetricEditorSheet（Vaul Bottom Sheet + inputMode decimal）

**Files:**
- Create: `src/app/profile/_components/MetricEditorSheet.tsx`

- [ ] **Step 1: 创建一个 Bottom Sheet（Vaul Drawer）并做 safe area & overscroll contain**

```tsx
"use client";

import * as React from "react";
import { Drawer } from "vaul";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { MetricConfig, parseDecimalInput, validateMetricValue } from "@/lib/body-metrics";
import { useToast } from "@/components/Toast";
import { useReducedMotion, motion } from "framer-motion";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  metric: MetricConfig;
  latestValue: number | null;
  latestDateText: string | null;
  onSave: (value: number) => Promise<void>;
};

export function MetricEditorSheet(props: Props) {
  const { open, onOpenChange, metric, latestValue, latestDateText, onSave } = props;
  const { toast } = useToast();
  const reduce = useReducedMotion();
  const [raw, setRaw] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    setRaw(latestValue == null ? "" : String(latestValue));
  }, [open, latestValue]);

  const commit = async () => {
    const n = parseDecimalInput(raw);
    if (n == null) {
      toast({ message: "请输入有效数字", type: "error" });
      return;
    }
    const err = validateMetricValue(metric, n);
    if (err) {
      toast({ message: err, type: "error" });
      return;
    }
    setSaving(true);
    try {
      await onSave(n);
      toast({ message: "已保存", type: "success" });
      onOpenChange(false);
    } catch {
      toast({ message: "保存失败，请检查网络", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const applyDelta = (delta: number) => {
    const n = parseDecimalInput(raw) ?? 0;
    const next = Math.round((n + delta) * 10) / 10;
    setRaw(String(next));
  };

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange} shouldScaleBackground={false}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50" style={{ background: "rgba(0,0,0,.55)" }} />
        <Drawer.Content
          className={cn("fixed inset-x-0 bottom-0 z-50 rounded-t-3xl border")}
          style={{
            background: "var(--surface)",
            borderColor: "var(--border)",
            paddingBottom: "env(safe-area-inset-bottom, 0px)",
            overscrollBehavior: "contain",
          }}
        >
          <div className="mx-auto max-w-5xl px-4 pb-6 pt-3">
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full" style={{ background: "rgba(255,255,255,.18)" }} />

            <motion.div
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={reduce ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.16 }}
            >
              <div className="text-sm font-black" style={{ color: "var(--foreground)" }}>
                {metric.label}
              </div>
              <div className="mt-1 text-xs" style={{ color: "var(--text-low)" }}>
                {latestValue == null ? "上次：未记录" : `上次：${latestValue}${metric.unit}`} {latestDateText ? `· ${latestDateText}` : ""}
              </div>

              <div className="mt-5 flex items-end gap-2">
                <Input
                  value={raw}
                  onChange={(e) => setRaw(e.target.value)}
                  inputMode="decimal"
                  autoFocus
                  onFocus={(e) => e.currentTarget.select()}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") commit();
                  }}
                  placeholder="输入数值"
                  className="h-14 rounded-2xl text-2xl font-black"
                />
                <div className="pb-2 text-sm font-bold" style={{ color: "var(--text-low)" }}>
                  {metric.unit}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2">
                {metric.steps.flatMap((s) => [-s, s]).map((d) => (
                  <Button
                    key={d}
                    variant="secondary"
                    className="h-11 rounded-2xl"
                    onClick={() => applyDelta(d)}
                  >
                    {d > 0 ? `+${d}` : `${d}`}
                  </Button>
                ))}
              </div>

              <div className="mt-5 grid grid-cols-2 gap-2">
                <Button variant="secondary" className="h-12 rounded-2xl" onClick={() => onOpenChange(false)}>
                  取消
                </Button>
                <Button className="h-12 rounded-2xl" onClick={commit} disabled={saving}>
                  {saving ? "保存中…" : "保存"}
                </Button>
              </div>
            </motion.div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
```

- [ ] **Step 2: eslint/ts 检查**

Run:

```bash
pnpm lint
```

Expected: 无新增报错

---

## 6) Task 6：实现 IdentityCard 与 BodyKpiCard（强层级、克制渐变）

**Files:**
- Create: `src/app/profile/_components/IdentityCard.tsx`
- Create: `src/app/profile/_components/BodyKpiCard.tsx`

- [ ] **Step 1: IdentityCard（头像/昵称/邮箱 + chips）**

（组件略，按现有 `ThemeContext` 的 `t` / CSS 变量系统实现：卡片用 `var(--surface)`、边框 `var(--border)`，头像区域允许轻渐变。）

- [ ] **Step 2: BodyKpiCard（体重超大数字 + 本周变化 + CTA）**

要求：
- 主 KPI：体重（`text-5xl font-black tracking-tight`）
- 次级：更新时间、变化（`↓ 0.6kg 本周`）
- 辅助：体脂 + 腰围（只展示 1-2 项）
- CTA：记录身体数据（主按钮）/ 查看趋势（次按钮，仅入口）

- [ ] **Step 3: lint**

Run:

```bash
pnpm lint
```

---

## 7) Task 7：重构 `src/app/profile/page.tsx`（数据加载 + 日期选择 PATCH/POST + 结构落地）

**Files:**
- Modify: `src/app/profile/page.tsx`

- [ ] **Step 1: 加载 body-data records（limit=30），显式处理 loading/empty/error**

实现要点：
- `useEffect`：在 `status === "authenticated"` 时 `fetch("/api/body-data?limit=30")`
- 解析 `records` 保存到 state
- error：用 toast 提示，不崩页面
- empty：网格显示“未记录”

- [ ] **Step 2: 严格按日期匹配“今天记录”（不依赖 records[0]）**

使用 `findRecordByLocalDay(records, new Date())`

- [ ] **Step 3: 保存逻辑**

当用户保存某指标：
- 若存在今天记录（有 id）→ `PATCH /api/body-data/[id]`，body 仅包含 `{ [metricKey]: value }`
- 若今天无记录 → `POST /api/body-data`，body 包含 `{ date: todayISO, [metricKey]: value }`

保存成功后：
- 重新拉取 records 或本地乐观更新（推荐：乐观更新今日记录，随后后台再刷新一次）

- [ ] **Step 4: 页面结构按要求落地（Header → Identity → KPI → Grid → Shortcuts → Settings → Logout → BottomTabBar）**

网格布局：
- `grid grid-cols-2 gap-3`
- 每个 MetricCard 点击打开 MetricEditorSheet

移动端 padding：
- 主容器 `pb-28`（避免 BottomTabBar 遮挡）
- BottomTabBar 已内置 safe-area padding

- [ ] **Step 5: reduced motion**

- Framer Motion 动画全部用 `useReducedMotion()` 分支，reduce 时关闭 `initial/animate`

- [ ] **Step 6: 构建验证**

Run:

```bash
pnpm lint
pnpm build
```

Expected: build 通过

---

## 8) Task 8：提交代码（小步提交，便于回滚）

- [ ] **Step 1: commit 组件引入**

```bash
git add src/lib/body-metrics.ts tests/body-metrics.test.ts package.json
git commit -m "feat(profile): add body metrics helpers and tests"
```

- [ ] **Step 2: commit Profile Hub UI（组件 + 页面）**

```bash
git add src/app/profile/page.tsx src/app/profile/_components
git commit -m "feat(profile): refactor profile page into Profile Hub with metrics sheet"
```

---

## 9) 自检清单（对照需求）

- [ ] 点击区域 ≥ 44px（MetricCard、CTA、Sheet 按钮）
- [ ] safe-area-inset-bottom：BottomTabBar 与 Sheet 都不遮挡
- [ ] Sheet 不滚穿（overscrollBehavior contain）
- [ ] respects reduced motion（useReducedMotion 分支）
- [ ] 不把 Profile 做成第二训练页（仅入口）
- [ ] 保存策略：按日期找“今天”，今天有 → PATCH；无 → POST；只发当前字段避免覆盖

