# FitCoach / XFITX — Profile Hub（个人/体测中心）UI 改造设计文档

日期：2026-05-28  
范围：移动端优先（PWA），页面：`/profile`（个人中心/我的）

---

## 1. 背景与问题

当前 `/profile` 页面偏“统计 + 设置”混合，缺少“体测/身体数据管理”的一等入口；同时信息密度与层级不够明确，不符合“快速训练记录为核心、体测作为辅助管理”的长期使用定位。

本次改造目标：把 Profile 调整为 **个人资料/体测中心（Card Hub）**，强调低噪音、强层级、单手可用，风格融合 Apple Fitness / Hevy / Strong / Linear，深色模式优先。

---

## 2. 目标（Goals）

1) Profile 首屏形成清晰的三层结构：**身份 → 体测（核心）→ 目标与偏好入口**  
2) “身体数据”支持 **全围度套装（MVP：使用现有 BodyData 字段）**，并保持录入足够快  
3) 交互上优先移动端：大点击目标、拇指区友好、底部安全区正确、弹层不滚穿  
4) 保持产品核心不偏航：训练记录仍以训练页为主；Profile 不做复杂计划系统

---

## 3. 非目标（Non-Goals）

1) 不做“身体示意图点部位录入”（避免概念稿与高维护成本）  
2) 不新增数据库字段（不做 Prisma 迁移）：先用现有 `BodyData` 字段集  
3) 不在 Profile 内做复杂的趋势图表与报表化分析（趋势可作为入口，后续迭代）

---

## 4. 当前可用数据与约束

### 4.1 现有 API

- `GET /api/body-data?limit=30`：获取最近记录
- `POST /api/body-data`：按 `userId + date` upsert（同一天覆盖更新）
- `PATCH /api/body-data/[id]`：更新单条
- `DELETE /api/body-data/[id]`

### 4.2 现有 BodyData 字段（用于 MVP）

`weight, bodyFat, chest, waist, hip, armLeft, armRight, thighLeft, thighRight, neck, notes`

> 若未来要扩展小腿/肩/前臂，需另起规格：Prisma schema + 迁移 + UI 扩展。

---

## 5. 信息架构（IA）与模块层级

### 5.1 首屏模块顺序（移动端）

1) **Header**：标题“我的”，右侧轻入口（后续可做“编辑”或“设置”）  
2) **身份卡（Identity Card）**：
   - 头像、昵称、邮箱（次级）
   - Chips：已验证 / 目标摘要 / 训练频率摘要（低噪音）
3) **身体数据主卡（Body KPI Card）**：
   - 主 KPI：体重（大数字）
   - 次 KPI：最近更新时间 / 7 天变化（若可计算）
   - 行级摘要：体脂、腰围等 1-2 项（可配置）
   - CTA：`记录身体数据`（进入“指标网格”编辑体验）/ `查看趋势`（仅入口）
4) **围度指标网格（Metrics Grid）**（核心交互）：
   - 2 列网格卡片：体脂、胸围、腰围、臀围、左臂/右臂、左腿/右腿、颈围（以及体重入口可重复或不重复）
   - 每卡显示：指标名 + 最新值 + 时间（很轻）
   - 点击卡片 → 单指标编辑弹层
5) **目标与偏好（Goals & Preferences Shortcuts）**：
   - 训练目标（跳 `/goals`）
   - 营养目标（跳 `/settings?tab=nutrition`）
   - 通知（跳 `/settings?tab=notifications`）
6) **设置收纳（Settings）**：
   - 主题切换（保留现有）
   - 账号安全（现有）
   - PWA 安装（条件显示：未安装时出现）
   - 退出登录（危险区样式）
7) **BottomTabBar**：保持 5 tab 固定（含 safe-area）

---

## 6. 核心交互：指标网格 → 单指标编辑

### 6.1 录入模式选择

用户已确认：**“点哪项改哪项”（B）**。

### 6.2 单指标编辑弹层（Modal / Sheet）

触发：点击任意指标卡  
展现：底部 sheet（优先）或居中 dialog（需移动端优化）

要求：
- 大号输入（数字优先，单位清晰）
- 快捷增减：±0.1 / ±0.5 / ±1（按指标可调整步进）
- 显示“上次值”和“上次日期”（减少思考）
- 保存后：轻量成功反馈（toast/微动效），并乐观更新 UI

### 6.3 保存策略（避免覆盖）

由于 `POST /api/body-data` 是按 `date` upsert：
- 当编辑某一项时，应在保存前先拿到“当日已有记录”（若存在），合并字段后再 POST  
- 或者走 `PATCH /api/body-data/[id]`（需要先定位当日记录的 id）

本次优先方案（推荐）：
1) 进入 `/profile` 时加载最近 `limit=30` 的 records  
2) 以“今天 date”为基准：
   - 若 records[0] 是今天（同日）→ 拿到该 record（含 id）→ 编辑单项走 `PATCH /api/body-data/[id]`
   - 若今天无记录 → 创建：`POST /api/body-data` 只包含 date + 当前编辑字段

> 这样可以保证“改单项不影响其他字段”，并减少合并逻辑。

---

## 7. 视觉规范（移动端）

### 7.1 风格原则

- 深色模式优先、低噪音、强层级
- 大圆角卡片（建议 20-24）
- 边框极细（`var(--border)`），阴影克制
- 强调大数字（体重 KPI）
- 渐变只用于身份/主 CTA 的“点睛”，避免廉价健身房风

### 7.2 组件规范（Profile 相关）

- Metric Card（网格）：
  - 触控区域 ≥ 44px
  - 文案 11-13px，数值 16-20px
- Primary CTA：
  - 高度 48-56
  - 圆角 16-20
- Modal/Sheet：
  - `overscroll-behavior: contain`
  - 安全区：`padding-bottom: env(safe-area-inset-bottom, 0px)`

---

## 8. 状态与边界场景

1) 未登录：保持现有“立即登录”引导  
2) 加载中：skeleton/loader（使用主题变量）  
3) 无身体记录：网格卡片显示“未记录”，CTA 引导“记录第一条”  
4) 离线：
   - 读取：可显示上次缓存（若已有缓存机制则利用；没有则至少处理 fetch 失败）
   - 写入：如果写入失败，提示“网络不可用，稍后重试”（本次可先做最小提示）
5) 数据非法：对输入做最小校验（非数字、负数、过大值）并提示

---

## 9. 无障碍与体验细节（Web Design Guidelines）

必须满足：
- 点击目标尺寸：关键按钮/卡片 ≥ 44×44
- `prefers-reduced-motion`：弹层/微动效尊重系统设置
- 对比度：文本与背景达到 AA（亮色主题也需可用）
- 弹层：`aria` label 完整，`Escape` 关闭，背景不可滚穿
- iOS 安全区：底部导航与弹层均正确处理 `safe-area-inset-bottom`

---

## 10. 实施边界（本规格的代码改动范围）

允许改动：
- `src/app/profile/page.tsx`：重构布局与交互（以本规格为准）
- 复用/轻改现有组件（如 BottomTabBar、Dialog/Sheet、Toast）
- 新增少量局部 UI 组件（如 MetricCard、MetricEditorSheet）

不在本规格内：
- 新建趋势页面的图表体系（仅保留入口）
- Prisma schema 变更

---

## 11. 验收标准（Definition of Done）

1) `/profile` 首屏符合“身份 → 体测（核心）→ 目标与偏好”的 Card Hub 结构  
2) 支持至少 9 个指标卡（体脂/胸/腰/臀/左臂/右臂/左腿/右腿/颈），点击可编辑并保存  
3) 保存后刷新页面仍显示最新值（来自 DB）  
4) iPhone 刘海机型：底部导航/弹层不遮挡；弹层不滚穿  
5) Reduced motion 打开时动效明显减弱或取消

