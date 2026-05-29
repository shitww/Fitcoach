# FitCoach Theme Violations Report

**Generated:** 2026-05-29T06:16:56.460Z

## Summary

- **Total violations:** 1175
- **Critical:** 0
- **High:** 952
- **Medium:** 223
- **Files affected:** 125

## Severity Legend

- **Critical:** Will break one or both themes (text-white, bg-zinc-950, etc.)
- **High:** Hardcoded colors in CSS or inline styles that don't adapt
- **Medium:** Potential theme escape — verify context

## Quick Fixes

| Hardcoded | → Semantic Token |
|-----------|------------------|
| `text-white` | `text-foreground` or `text-primary-foreground` |
| `text-black` | `text-foreground` (light) or `text-primary-foreground` |
| `bg-black` | `bg-background` |
| `bg-white` | `bg-card` or `bg-background` |
| `bg-zinc-900/950` | `bg-card` or `bg-secondary` |
| `border-zinc-800` | `border-border` |
| `text-gray-400` | `text-muted-foreground` |
| `text-zinc-400` | `text-muted-foreground` |

## Violations by File

### src\app\_home\ConsistencyRhythmCard.tsx

- **[HIGH]** Line 23: `#22c55e`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...    excellent: '#22c55e',...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 24: `#CCFF00`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...    good:      '#CCFF00',...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 25: `#94a3b8`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...    building:  '#94a3b8',...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 26: `#60A5FA`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...    returning: '#60A5FA',...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 37: `#22c55e`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `... if (done && isToday) return '#22c55e'...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 65: `rgba(34,197,94,0.12)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...             ? { background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 65: `rgba(34,197,94,0.2)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...94,0.12)', border: '1px solid rgba(34,197,94,0.2)' }...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 71: `#22c55e`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...e={{ background: todayDone ? '#22c55e' : t.textFaint }}...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 75: `#22c55e`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `... style={{ color: todayDone ? '#22c55e' : t.textFaint }}...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[MEDIUM]** Line 51: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...     className="text-2xl font-black tabular-nums leading-none"...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

### src\app\_home\ProgressNarrativeSurface.tsx

- **[HIGH]** Line 18: `#22c55e`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...rative.tone === 'positive' ? '#22c55e' :...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 84: `#22c55e`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...    trend.trend === 'up' ? '#22c55e' :...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 85: `#F59E0B`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...    trend.trend === 'down' ? '#F59E0B' :...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

### src\app\_home\QuickWorkoutEntry.tsx

- **[HIGH]** Line 15: `rgba(204,255,0,0.1)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `... "状态良好", dot: "#CCFF00", bg: "rgba(204,255,0,0.1)", text: "#CCFF00" },...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 15: `#CCFF00`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...TRAIN: { label: "状态良好", dot: "#CCFF00", bg: "rgba(204,255,0,0.1)", ...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 15: `#CCFF00`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `..."rgba(204,255,0,0.1)", text: "#CCFF00" },...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 16: `rgba(245,158,11,0.1)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `... "注意疲劳", dot: "#F59E0B", bg: "rgba(245,158,11,0.1)", text: "#F59E0B" },...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 16: `#F59E0B`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...       { label: "注意疲劳", dot: "#F59E0B", bg: "rgba(245,158,11,0.1)",...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 16: `#F59E0B`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...rgba(245,158,11,0.1)", text: "#F59E0B" },...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 17: `rgba(34,197,94,0.1)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `... "充分恢复", dot: "#22c55e", bg: "rgba(34,197,94,0.1)", text: "#22c55e" },...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 17: `#22c55e`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...:      { label: "充分恢复", dot: "#22c55e", bg: "rgba(34,197,94,0.1)", ...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 17: `#22c55e`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `..."rgba(34,197,94,0.1)", text: "#22c55e" },...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 18: `rgba(96,165,250,0.1)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `... "今日休息", dot: "#60A5FA", bg: "rgba(96,165,250,0.1)", text: "#60A5FA" },...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 18: `#60A5FA`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...       { label: "今日休息", dot: "#60A5FA", bg: "rgba(96,165,250,0.1)",...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 18: `#60A5FA`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...rgba(96,165,250,0.1)", text: "#60A5FA" },...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 87: `rgba(34,197,94,0.25)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...t.surface, border: "1px solid rgba(34,197,94,0.25)" }}...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 92: `style={{ background: "rgb`
  - *Pattern:* inline-style-color
  - *Context:* `...            style={{ background: "rgba(34,197,94,0.12)" }}...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 92: `rgba(34,197,94,0.12)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...        style={{ background: "rgba(34,197,94,0.12)" }}...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 108: `rgba(34,197,94,0.1)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...              background: "rgba(34,197,94,0.1)",...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 109: `#22c55e`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...              color: "#22c55e",...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 110: `rgba(34,197,94,0.2)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...           border: "1px solid rgba(34,197,94,0.2)",...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

### src\app\_home\RecoveryStatus.tsx

- **[HIGH]** Line 12: `rgba(204,255,0,0.12)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...状态良好", color: "#CCFF00", bg: "rgba(204,255,0,0.12)" },...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 12: `#CCFF00`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...AIN: { label: "状态良好", color: "#CCFF00", bg: "rgba(204,255,0,0.12)" ...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 13: `rgba(245,158,11,0.12)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...注意疲劳", color: "#F59E0B", bg: "rgba(245,158,11,0.12)" },...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 13: `#F59E0B`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...     { label: "注意疲劳", color: "#F59E0B", bg: "rgba(245,158,11,0.12)"...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 14: `rgba(34,197,94,0.12)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...充分恢复", color: "#22c55e", bg: "rgba(34,197,94,0.12)" },...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 14: `#22c55e`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...     { label: "充分恢复", color: "#22c55e", bg: "rgba(34,197,94,0.12)" ...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 15: `rgba(96,165,250,0.12)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...今日休息", color: "#60A5FA", bg: "rgba(96,165,250,0.12)" },...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 15: `#60A5FA`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...     { label: "今日休息", color: "#60A5FA", bg: "rgba(96,165,250,0.12)"...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

### src\app\_home\TodayProgressRing.tsx

- **[HIGH]** Line 42: `#22c55e`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...         stroke={todayDone ? "#22c55e" : t.accent}...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

### src\app\_home\UnauthenticatedContent.tsx

- **[HIGH]** Line 31: `#FFFFFF`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `... <tspan>X</tspan><tspan fill="#FFFFFF" letterSpacing="0.05em" fontW...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[MEDIUM]** Line 34: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `... <h2 className="text-3xl font-black mb-3" style={{ fontFamily: "S...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

### src\app\analytics\health\page.tsx

- **[HIGH]** Line 59: `#22c55e`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...  low: '#22c55e',...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 60: `#eab308`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...  moderate: '#eab308',...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 61: `#f97316`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...  high: '#f97316',...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 62: `#ef4444`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...  very_high: '#ef4444',...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 66: `#22c55e`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...  low: '#22c55e',...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 67: `#eab308`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...  moderate: '#eab308',...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 68: `#f97316`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...  high: '#f97316',...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 69: `#ef4444`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...  critical: '#ef4444',...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 73: `#22c55e`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...  excellent: '#22c55e',...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 74: `#84cc16`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...  good: '#84cc16',...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 75: `#eab308`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...  fair: '#eab308',...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 76: `#ef4444`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...  poor: '#ef4444',...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 113: `#374151`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...        fill="none" stroke="#374151" strokeWidth="10" strokeLinec...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 126: `#9ca3af`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...14} textAnchor="middle" fill="#9ca3af" fontSize="9">...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 246: `#9ca3af`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...IGUE_COLOR[fatigue.level] ?? '#9ca3af') : '#9ca3af';...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 246: `#9ca3af`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...tigue.level] ?? '#9ca3af') : '#9ca3af';...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 247: `#9ca3af`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...K_COLOR[injuryRisk.level] ?? '#9ca3af') : '#9ca3af';...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 247: `#9ca3af`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...yRisk.level] ?? '#9ca3af') : '#9ca3af';...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 248: `#9ca3af`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...R[nutrition.macroBalance] ?? '#9ca3af') : '#9ca3af';...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 248: `#9ca3af`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...acroBalance] ?? '#9ca3af') : '#9ca3af';...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 398: `#22c55e`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...tion.proteinAdequacy >= 80 ? '#22c55e' : nutrition.proteinAdequacy ...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 398: `#eab308`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...tion.proteinAdequacy >= 60 ? '#eab308' : '#ef4444'} />...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 398: `#ef4444`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...Adequacy >= 60 ? '#eab308' : '#ef4444'} />...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 399: `#22c55e`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...trition.carbAdequacy >= 80 ? '#22c55e' : nutrition.carbAdequacy >= ...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 399: `#eab308`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...trition.carbAdequacy >= 60 ? '#eab308' : '#ef4444'} />...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 399: `#ef4444`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...Adequacy >= 60 ? '#eab308' : '#ef4444'} />...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 400: `#22c55e`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...utrition.fatAdequacy >= 80 ? '#22c55e' : nutrition.fatAdequacy >= 6...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 400: `#eab308`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...utrition.fatAdequacy >= 60 ? '#eab308' : '#ef4444'} />...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 400: `#ef4444`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...Adequacy >= 60 ? '#eab308' : '#ef4444'} />...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[MEDIUM]** Line 123: `white`
  - *Pattern:* theme-escape-white-black
  - *Context:* `... 4} textAnchor="middle" fill="white" fontSize="22" fontWeight="70...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 207: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...<div className="text-2xl font-black text-foreground">{value}</div...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 277: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...<div className="text-5xl font-black leading-none" style={{ color:...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

### src\app\analytics\strength\page.tsx

- **[HIGH]** Line 145: `rgba(255,255,255,0.06)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 146: `rgba(255,255,255,0.25)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...<XAxis dataKey="date" stroke="rgba(255,255,255,0.25)" tick={{ fontSize: 10 }} />...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 147: `rgba(255,255,255,0.25)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...               <YAxis stroke="rgba(255,255,255,0.25)" tick={{ fontSize: 11 }} />...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 149: `#111`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `... contentStyle={{ background: '#111', border: '1px solid #333', b...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 149: `#333`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...d: '#111', border: '1px solid #333', borderRadius: 12 }}...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 150: `#fff`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...        labelStyle={{ color: '#fff' }}...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 151: `rgba(255,255,255,0.7)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...         itemStyle={{ color: 'rgba(255,255,255,0.7)' }}...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 155: `#A855F7`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...axWeight" name="最大重量" stroke="#A855F7" strokeWidth={2} dot={{ r: 3 ...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[MEDIUM]** Line 120: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...  <p className="text-2xl font-black text-primary">...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 126: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...  <p className="text-2xl font-black text-purple-400">...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

### src\app\analytics\volume\page.tsx

- **[HIGH]** Line 156: `rgba(255,255,255,0.06)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 157: `rgba(255,255,255,0.25)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...<XAxis dataKey="week" stroke="rgba(255,255,255,0.25)" tick={{ fontSize: 11 }} />...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 158: `rgba(255,255,255,0.25)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...               <YAxis stroke="rgba(255,255,255,0.25)" tick={{ fontSize: 11 }} />...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 160: `#111`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `... contentStyle={{ background: '#111', border: '1px solid #333', b...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 160: `#333`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...d: '#111', border: '1px solid #333', borderRadius: 12 }}...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 161: `#fff`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...        labelStyle={{ color: '#fff' }}...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 162: `rgba(255,255,255,0.7)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...         itemStyle={{ color: 'rgba(255,255,255,0.7)' }}...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 166: `#A855F7`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...y="trend" name="3周均线" stroke="#A855F7" strokeWidth={2} dot={false} ...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[MEDIUM]** Line 131: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...  <p className="text-2xl font-black text-primary">...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 137: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...  <p className="text-2xl font-black text-purple-400">...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

### src\app\api\splash\route.ts

- **[HIGH]** Line 28: `#000000`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...        background: '#000000',...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 39: `#CCFF00`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...'span', { style: letterStyle('#CCFF00') }, 'X'),...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 40: `#ffffff`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...'span', { style: letterStyle('#ffffff') }, 'FIT'),...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 41: `#CCFF00`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...'span', { style: letterStyle('#CCFF00') }, 'X'),...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 45: `rgba(255,255,255,0.30)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...          color: 'rgba(255,255,255,0.30)',...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

### src\app\apple-icon.tsx

- **[HIGH]** Line 11: `#000000`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...          background: '#000000',...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 21: `#CCFF00`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...            color: '#CCFF00',...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

### src\app\auth\signin\page.tsx

- **[HIGH]** Line 53: `style={{ color: 'rgb`
  - *Pattern:* inline-style-color
  - *Context:* `...gap-2 mb-8 transition-colors" style={{ color: 'rgba(255,255,255,0.35)' }}>...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 53: `rgba(255,255,255,0.35)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...tion-colors" style={{ color: 'rgba(255,255,255,0.35)' }}>...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 63: `#FFFFFF`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `... <tspan>X</tspan><tspan fill="#FFFFFF" letterSpacing="0.05em" fontW...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 66: `style={{ color: 'rgb`
  - *Pattern:* inline-style-color
  - *Context:* `...          <p className="mt-1" style={{ color: 'rgba(255,255,255,0.25)', letterSp...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 66: `rgba(255,255,255,0.25)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...sName="mt-1" style={{ color: 'rgba(255,255,255,0.25)', letterSpacing: '0.3em', fon...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 80: `style={{ background: '#`
  - *Pattern:* inline-style-color
  - *Context:* `...v className="rounded-2xl p-8" style={{ background: '#0a0a0a', border: '1px solid #1...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 80: `#0a0a0a`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...xl p-8" style={{ background: '#0a0a0a', border: '1px solid #1e1e1e'...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 80: `#1e1e1e`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...'#0a0a0a', border: '1px solid #1e1e1e' }}>...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 85: `style={{ color: 'rgb`
  - *Pattern:* inline-style-color
  - *Context:* `...k text-sm font-semibold mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>邮箱地址</l...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 85: `rgba(255,255,255,0.4)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...mibold mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>邮箱地址</label>...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 87: `style={{ color: 'rgb`
  - *Pattern:* inline-style-color
  - *Context:* `...1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'rgba(255,255,255,0.2)' }} />...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 87: `rgba(255,255,255,0.2)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...1/2 w-5 h-5" style={{ color: 'rgba(255,255,255,0.2)' }} />...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 91: `style={{ background: '#`
  - *Pattern:* inline-style-color
  - *Context:* `...                  style={{ background: '#111', border: '1px solid #1e1e...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 91: `#111`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...        style={{ background: '#111', border: '1px solid #1e1e1e'...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 91: `#1e1e1e`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...d: '#111', border: '1px solid #1e1e1e' }}...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 97: `style={{ color: 'rgb`
  - *Pattern:* inline-style-color
  - *Context:* `...k text-sm font-semibold mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>密码</lab...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 97: `rgba(255,255,255,0.4)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...mibold mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>密码</label>...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 99: `style={{ color: 'rgb`
  - *Pattern:* inline-style-color
  - *Context:* `...1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'rgba(255,255,255,0.2)' }} />...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 99: `rgba(255,255,255,0.2)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...1/2 w-5 h-5" style={{ color: 'rgba(255,255,255,0.2)' }} />...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 103: `style={{ background: '#`
  - *Pattern:* inline-style-color
  - *Context:* `...                  style={{ background: '#111', border: '1px solid #1e1e...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 103: `#111`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...        style={{ background: '#111', border: '1px solid #1e1e1e'...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 103: `#1e1e1e`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...d: '#111', border: '1px solid #1e1e1e' }}...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 121: `style={{ color: 'rgb`
  - *Pattern:* inline-style-color
  - *Context:* `... className="text-center mt-6" style={{ color: 'rgba(255,255,255,0.35)' }}>...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 121: `rgba(255,255,255,0.35)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...center mt-6" style={{ color: 'rgba(255,255,255,0.35)' }}>...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 128: `style={{ background: '#`
  - *Pattern:* inline-style-color
  - *Context:* `...assName="mt-6 p-4 rounded-xl" style={{ background: '#0a0a0a', border: '1px solid #1...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 128: `#0a0a0a`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...ded-xl" style={{ background: '#0a0a0a', border: '1px solid #1e1e1e'...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 128: `#1e1e1e`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...'#0a0a0a', border: '1px solid #1e1e1e' }}>...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 129: `style={{ color: 'rgb`
  - *Pattern:* inline-style-color
  - *Context:* `...me="text-xs text-center mb-3" style={{ color: 'rgba(255,255,255,0.2)' }}>演示账号快速登...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 129: `rgba(255,255,255,0.2)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...center mb-3" style={{ color: 'rgba(255,255,255,0.2)' }}>演示账号快速登录</p>...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 132: `style={{ background: '#111', color: 'rgb`
  - *Pattern:* inline-style-color
  - *Context:* `...            style={{ background: '#111', color: 'rgba(255,255,255,0.5)' }}>...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 132: `rgba(255,255,255,0.5)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...{ background: '#111', color: 'rgba(255,255,255,0.5)' }}>...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 132: `#111`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...        style={{ background: '#111', color: 'rgba(255,255,255,0....`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 135: `style={{ color: 'rgb`
  - *Pattern:* inline-style-color
  - *Context:* `...me="text-xs text-center mt-2" style={{ color: 'rgba(255,255,255,0.15)' }}>...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 135: `rgba(255,255,255,0.15)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...center mt-2" style={{ color: 'rgba(255,255,255,0.15)' }}>...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[MEDIUM]** Line 81: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `... <h2 className="text-2xl font-black mb-6">登录账号</h2>...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

### src\app\auth\signup\page.tsx

- **[HIGH]** Line 47: `#FFFFFF`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `... <tspan>X</tspan><tspan fill="#FFFFFF" letterSpacing="0.05em" fontW...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 50: `style={{ color: 'rgb`
  - *Pattern:* inline-style-color
  - *Context:* `...          <p className="mt-1" style={{ color: 'rgba(255,255,255,0.25)', letterSp...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 50: `rgba(255,255,255,0.25)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...sName="mt-1" style={{ color: 'rgba(255,255,255,0.25)', letterSpacing: '0.3em', fon...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 56: `style={{ background: '#`
  - *Pattern:* inline-style-color
  - *Context:* `...v className="rounded-2xl p-8" style={{ background: '#0a0a0a', border: '1px solid #1...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 56: `#0a0a0a`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...xl p-8" style={{ background: '#0a0a0a', border: '1px solid #1e1e1e'...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 56: `#1e1e1e`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...'#0a0a0a', border: '1px solid #1e1e1e' }}>...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 61: `style={{ color: 'rgb`
  - *Pattern:* inline-style-color
  - *Context:* `...k text-sm font-semibold mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>姓名</lab...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 61: `rgba(255,255,255,0.4)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...mibold mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>姓名</label>...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 63: `style={{ color: 'rgb`
  - *Pattern:* inline-style-color
  - *Context:* `...1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'rgba(255,255,255,0.2)' }} />...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 63: `rgba(255,255,255,0.2)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...1/2 w-5 h-5" style={{ color: 'rgba(255,255,255,0.2)' }} />...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 67: `style={{ background: '#`
  - *Pattern:* inline-style-color
  - *Context:* `...                  style={{ background: '#111', border: '1px solid #1e1e...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 67: `#111`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...        style={{ background: '#111', border: '1px solid #1e1e1e'...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 67: `#1e1e1e`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...d: '#111', border: '1px solid #1e1e1e' }}...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 73: `style={{ color: 'rgb`
  - *Pattern:* inline-style-color
  - *Context:* `...k text-sm font-semibold mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>邮箱</lab...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 73: `rgba(255,255,255,0.4)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...mibold mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>邮箱</label>...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 75: `style={{ color: 'rgb`
  - *Pattern:* inline-style-color
  - *Context:* `...1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'rgba(255,255,255,0.2)' }} />...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 75: `rgba(255,255,255,0.2)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...1/2 w-5 h-5" style={{ color: 'rgba(255,255,255,0.2)' }} />...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 79: `style={{ background: '#`
  - *Pattern:* inline-style-color
  - *Context:* `...                  style={{ background: '#111', border: '1px solid #1e1e...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 79: `#111`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...        style={{ background: '#111', border: '1px solid #1e1e1e'...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 79: `#1e1e1e`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...d: '#111', border: '1px solid #1e1e1e' }}...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 85: `style={{ color: 'rgb`
  - *Pattern:* inline-style-color
  - *Context:* `...k text-sm font-semibold mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>密码</lab...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 85: `rgba(255,255,255,0.4)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...mibold mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>密码</label>...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 87: `style={{ color: 'rgb`
  - *Pattern:* inline-style-color
  - *Context:* `...1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'rgba(255,255,255,0.2)' }} />...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 87: `rgba(255,255,255,0.2)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...1/2 w-5 h-5" style={{ color: 'rgba(255,255,255,0.2)' }} />...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 91: `style={{ background: '#`
  - *Pattern:* inline-style-color
  - *Context:* `...                  style={{ background: '#111', border: '1px solid #1e1e...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 91: `#111`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...        style={{ background: '#111', border: '1px solid #1e1e1e'...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 91: `#1e1e1e`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...d: '#111', border: '1px solid #1e1e1e' }}...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 97: `style={{ color: 'rgb`
  - *Pattern:* inline-style-color
  - *Context:* `...k text-sm font-semibold mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>确认密码</l...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 97: `rgba(255,255,255,0.4)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...mibold mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>确认密码</label>...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 99: `style={{ color: 'rgb`
  - *Pattern:* inline-style-color
  - *Context:* `...1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'rgba(255,255,255,0.2)' }} />...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 99: `rgba(255,255,255,0.2)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...1/2 w-5 h-5" style={{ color: 'rgba(255,255,255,0.2)' }} />...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 103: `style={{ background: '#`
  - *Pattern:* inline-style-color
  - *Context:* `...                  style={{ background: '#111', border: '1px solid #1e1e...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 103: `#111`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...        style={{ background: '#111', border: '1px solid #1e1e1e'...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 103: `#1e1e1e`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...d: '#111', border: '1px solid #1e1e1e' }}...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 121: `style={{ color: 'rgb`
  - *Pattern:* inline-style-color
  - *Context:* `... className="text-center mt-6" style={{ color: 'rgba(255,255,255,0.35)' }}>...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 121: `rgba(255,255,255,0.35)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...center mt-6" style={{ color: 'rgba(255,255,255,0.35)' }}>...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 127: `style={{ color: 'rgb`
  - *Pattern:* inline-style-color
  - *Context:* `...me="text-center mt-6 text-xs" style={{ color: 'rgba(255,255,255,0.15)' }}>...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 127: `rgba(255,255,255,0.15)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...t-6 text-xs" style={{ color: 'rgba(255,255,255,0.15)' }}>...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[MEDIUM]** Line 57: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `... <h2 className="text-2xl font-black mb-6">注册账号</h2>...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

### src\app\calendar\page.tsx

- **[HIGH]** Line 39: `#60A5FA`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...  chest: "#60A5FA", back: "#A78BFA", legs: "#34...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 39: `#A78BFA`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...  chest: "#60A5FA", back: "#A78BFA", legs: "#34D399",...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 39: `#34D399`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...5FA", back: "#A78BFA", legs: "#34D399",...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 40: `#FBBF24`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...  shoulders: "#FBBF24", arms: "#F87171",...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 40: `#F87171`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `... shoulders: "#FBBF24", arms: "#F87171",...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 169: `style={{ background: "rgb`
  - *Pattern:* inline-style-color
  - *Context:* `...              style={{ background: "rgba(251,146,60,0.15)", border: "...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 169: `rgba(251,146,60,0.15)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...        style={{ background: "rgba(251,146,60,0.15)", border: "1px solid rgba(251...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 169: `rgba(251,146,60,0.3)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...60,0.15)", border: "1px solid rgba(251,146,60,0.3)" }}>...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 170: `style={{ color: "#`
  - *Pattern:* inline-style-color
  - *Context:* `...Flame className="w-3.5 h-3.5" style={{ color: "#FB923C" }} />...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 170: `#FB923C`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...w-3.5 h-3.5" style={{ color: "#FB923C" }} />...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 171: `style={{ color: "#`
  - *Pattern:* inline-style-color
  - *Context:* `...lassName="text-xs font-black" style={{ color: "#FB923C" }}>{data.streak.curren...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 171: `#FB923C`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `... font-black" style={{ color: "#FB923C" }}>{data.streak.current}天</s...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 265: `#000`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `... "var(--accent)"; numColor = "#000"; }...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 267: `#60A5FA`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...         if (edge) { numBg = "#60A5FA"; numColor = "#fff"; }...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 267: `#fff`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...umBg = "#60A5FA"; numColor = "#fff"; }...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 268: `#60A5FA`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...         if (inR) numColor = "#60A5FA";...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 276: `rgba(96,165,250,0.12)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...  style={{ background: inR ? "rgba(96,165,250,0.12)" : "transparent" }}>...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 287: `style={{ background: "#`
  - *Pattern:* inline-style-color
  - *Context:* `...me="w-1.5 h-1.5 rounded-full" style={{ background: "#FB923C" }} />}...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 287: `#FB923C`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...d-full" style={{ background: "#FB923C" }} />}...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 288: `style={{ background: "#`
  - *Pattern:* inline-style-color
  - *Context:* `...me="w-1.5 h-1.5 rounded-full" style={{ background: "#94a3b8" }} />}...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 288: `#94a3b8`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...d-full" style={{ background: "#94a3b8" }} />}...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 290: `#888`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...kground: MUSCLE_COLOR[mg] || "#888" }} />...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 299: `style={{ background: "#`
  - *Pattern:* inline-style-color
  - *Context:* `...me="w-1.5 h-1.5 rounded-full" style={{ background: "#F59E0B" }} />...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 299: `#F59E0B`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...d-full" style={{ background: "#F59E0B" }} />...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 300: `style={{ background: "#`
  - *Pattern:* inline-style-color
  - *Context:* `...me="w-1.5 h-1.5 rounded-full" style={{ background: "#3B82F6" }} />...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 300: `#3B82F6`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...d-full" style={{ background: "#3B82F6" }} />...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 301: `style={{ background: "#`
  - *Pattern:* inline-style-color
  - *Context:* `...me="w-1.5 h-1.5 rounded-full" style={{ background: "#EF4444" }} />...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 301: `#EF4444`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...d-full" style={{ background: "#EF4444" }} />...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 315: `#60A5FA`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...            {[["#60A5FA","胸"],["#A78BFA","背"],["#34D3...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 315: `#A78BFA`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...          {[["#60A5FA","胸"],["#A78BFA","背"],["#34D399","腿"],["#FBBF...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 315: `#34D399`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...0A5FA","胸"],["#A78BFA","背"],["#34D399","腿"],["#FBBF24","肩"],["#F871...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 315: `#FBBF24`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...78BFA","背"],["#34D399","腿"],["#FBBF24","肩"],["#F87171","臂"],["#FB92...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 315: `#F87171`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...4D399","腿"],["#FBBF24","肩"],["#F87171","臂"],["#FB923C","有氧"],["#94a...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 315: `#FB923C`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...BBF24","肩"],["#F87171","臂"],["#FB923C","有氧"],["#94a3b8","自由"]].map(...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 315: `#94a3b8`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...7171","臂"],["#FB923C","有氧"],["#94a3b8","自由"]].map(([c,l]) => (...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 325: `#F59E0B`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...              {[["#F59E0B","碳水化合物"],["#3B82F6","蛋白质"],[...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 325: `#3B82F6`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...      {[["#F59E0B","碳水化合物"],["#3B82F6","蛋白质"],["#EF4444","脂肪"]].map...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 325: `#EF4444`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...,"碳水化合物"],["#3B82F6","蛋白质"],["#EF4444","脂肪"]].map(([c,l]) => (...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 336: `#F59E0B`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...nthStats.avgCarbs,unit:'g',c:'#F59E0B'},...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 337: `#3B82F6`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...hStats.avgProtein,unit:'g',c:'#3B82F6'}].map(it => (...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 356: `rgba(0,0,0,0.3)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...r)", boxShadow: "0 -16px 48px rgba(0,0,0,0.3)" }}>...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 376: `#F59E0B`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...kcal: diet.carbs * 4, color: '#F59E0B' },...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 377: `#3B82F6`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...al: diet.protein * 4, color: '#3B82F6' },...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 378: `#EF4444`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `..., kcal: diet.fat * 9, color: '#EF4444' },...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 412: `rgba(0,0,0,0.3)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...r)", boxShadow: "0 -16px 48px rgba(0,0,0,0.3)" }}>...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 455: `style={{ background: "rgba(251,146,60,0.15)", color: "#`
  - *Pattern:* inline-style-color
  - *Context:* `...                        style={{ background: "rgba(251,146,60,0.15)", color: "#FB923C" }}>有氧</span>...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 455: `rgba(251,146,60,0.15)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...        style={{ background: "rgba(251,146,60,0.15)", color: "#FB923C" }}>有氧</spa...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 455: `#FB923C`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...ba(251,146,60,0.15)", color: "#FB923C" }}>有氧</span>...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 489: `rgba(0,0,0,0.3)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...r)", boxShadow: "0 -16px 48px rgba(0,0,0,0.3)" }}>...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 493: `style={{ color: "#`
  - *Pattern:* inline-style-color
  - *Context:* `...BarChart2 className="w-4 h-4" style={{ color: "#60A5FA" }} />...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 493: `#60A5FA`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...me="w-4 h-4" style={{ color: "#60A5FA" }} />...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 494: `style={{ color: "#`
  - *Pattern:* inline-style-color
  - *Context:* `...lassName="text-sm font-black" style={{ color: "#60A5FA" }}>区间分析</span>...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 494: `#60A5FA`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `... font-black" style={{ color: "#60A5FA" }}>区间分析</span>...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 506: `style={{ background: "#60A5FA", color: "#`
  - *Pattern:* inline-style-color
  - *Context:* `...              style={{ background: "#60A5FA", color: "#000" }}>...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 506: `#60A5FA`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...        style={{ background: "#60A5FA", color: "#000" }}>...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 506: `#000`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...ackground: "#60A5FA", color: "#000" }}>...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[MEDIUM]** Line 171: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...<span className="text-xs font-black" style={{ color: "#FB923C" }}...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 185: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...<div className="text-2xl font-black leading-tight">{month}月...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 339: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `... <div className="text-lg font-black" style={{ color: it.c }}>{it....`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 361: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...div className="text-base font-black" style={{ color: 'var(--foreg...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 371: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...<div className="text-4xl font-black" style={{ color: 'var(--foreg...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 419: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...div className="text-base font-black" style={{ color: 'var(--foreg...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 438: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `... <div className="text-xs font-black" style={{ color: 'var(--foreg...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 471: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...py-3 rounded-2xl text-sm font-black flex items-center justify-cen...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 494: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...<span className="text-sm font-black" style={{ color: "#60A5FA" }}...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 496: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...div className="text-base font-black" style={{ color: 'var(--foreg...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 505: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...-3.5 rounded-2xl text-sm font-black flex items-center justify-cen...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

### src\app\chat\page.tsx

- **[HIGH]** Line 24: `style={{ background: 'rgb`
  - *Pattern:* inline-style-color
  - *Context:* `...ssName="px-1 rounded text-xs" style={{ background: 'rgba(0,0,0,0.25)' }}>{p.slice(1, ...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 24: `rgba(0,0,0,0.25)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...ext-xs" style={{ background: 'rgba(0,0,0,0.25)' }}>{p.slice(1, -1)}</code>;...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[MEDIUM]** Line 153: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `... <div className="text-sm font-black text-primary">XFITX Coach</di...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

### src\app\diet\page.tsx

- **[HIGH]** Line 50: `#ef4444`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...}%`, backgroundColor: over ? '#ef4444' : color }} />...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 359: `#e4e4e7`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...} max={goals.calories} color="#e4e4e7" />...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 360: `#22d3ee`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...rbs} max={goals.carbs} color="#22d3ee" />...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 361: `#34d399`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...n} max={goals.protein} color="#34d399" />...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 362: `#fb923c`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...y.fat} max={goals.fat} color="#fb923c" />...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

### src\app\error.tsx

- **[HIGH]** Line 24: `#000000`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...        background: '#000000',...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 25: `#ffffff`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...        color: '#ffffff',...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 36: `#CCFF00`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...          color: '#CCFF00',...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 39: `rgba(204,255,0,0.4)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...        textShadow: '0 0 20px rgba(204,255,0,0.4)',...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 60: `rgba(255,255,255,0.45)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...          color: 'rgba(255,255,255,0.45)',...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 72: `#CCFF00`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...          background: '#CCFF00',...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 73: `#000`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...          color: '#000',...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

### src\app\exercises\ExercisesContent.tsx

- **[HIGH]** Line 32: `#94A3B8`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...SCLE_GROUP_COLORS[v]?.hex ?? '#94A3B8',...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 38: `#94A3B8`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...E_CATEGORY_COLORS[v]?.hex ?? '#94A3B8',...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 169: `#999`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...return found ? found.color : '#999';...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 179: `#34D399`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...    '初级': '#34D399', '中级': '#FBBF24', '高级': '#F8...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 179: `#FBBF24`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...    '初级': '#34D399', '中级': '#FBBF24', '高级': '#F87171',...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 179: `#F87171`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...399', '中级': '#FBBF24', '高级': '#F87171',...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 180: `#34D399`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...    beginner: '#34D399', intermediate: '#FBBF24', ex...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 180: `#FBBF24`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...er: '#34D399', intermediate: '#FBBF24', expert: '#F87171',...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 180: `#F87171`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...rmediate: '#FBBF24', expert: '#F87171',...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 417: `style={{ background: 'rgba(204,255,0,0.12)', color: '#`
  - *Pattern:* inline-style-color
  - *Context:* `...                              style={{ background: 'rgba(204,255,0,0.12)', color: '#CCFF00' }}>常用</span>...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 417: `rgba(204,255,0,0.12)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...        style={{ background: 'rgba(204,255,0,0.12)', color: '#CCFF00' }}>常用</spa...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 417: `#CCFF00`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...gba(204,255,0,0.12)', color: '#CCFF00' }}>常用</span>...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 455: `#999`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...lors[exercise.difficulty] || '#999'}18`, color: difficultyColors...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 455: `#999`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...lors[exercise.difficulty] || '#999' }}>...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 491: `#999`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...ectedExercise.difficulty] || '#999'}}>· {translateDifficulty(sel...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[MEDIUM]** Line 269: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `... justify-center shrink-0 font-black text-sm"...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 408: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `... justify-center shrink-0 font-black text-base"...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 483: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...ms-center justify-center font-black text-base"...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

### src\app\icon.tsx

- **[HIGH]** Line 11: `#000000`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...          background: '#000000',...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 21: `#CCFF00`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...            color: '#CCFF00',...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

### src\app\layout.tsx

- **[HIGH]** Line 39: `#000000`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...color-scheme: dark)", color: "#000000" }, { media: "(prefers-color-...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 39: `#ffffff`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...olor-scheme: light)", color: "#ffffff" }],...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[MEDIUM]** Line 30: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...    statusBarStyle: "black-translucent",...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

### src\app\manifest.ts

- **[HIGH]** Line 12: `#000000`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...    background_color: '#000000',...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 13: `#000000`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...    theme_color: '#000000',...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

### src\app\muscle-history\[muscle]\page.tsx

- **[HIGH]** Line 12: `#60A5FA`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...  chest: "#60A5FA", back: "#A78BFA", legs: "#34...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 12: `#A78BFA`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...  chest: "#60A5FA", back: "#A78BFA", legs: "#34D399", shoulders:...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 12: `#34D399`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...5FA", back: "#A78BFA", legs: "#34D399", shoulders: "#FBBF24", arms:...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 12: `#FBBF24`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `... legs: "#34D399", shoulders: "#FBBF24", arms: "#F87171",...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 12: `#F87171`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `... shoulders: "#FBBF24", arms: "#F87171",...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[MEDIUM]** Line 89: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...  <h1 className="text-lg font-black" style={{ color: accent }}>{l...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 128: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `... <div className="text-sm font-black" style={{ color: accent }}>{v...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 140: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...<span className="text-sm font-black" style={{ color: accent }}>{h...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

### src\app\plans\page.tsx

- **[HIGH]** Line 606: `style={{ background: 'rgb`
  - *Pattern:* inline-style-color
  - *Context:* `...iv className="rounded-xl p-4" style={{ background: 'rgba(251,146,60,0.08)', border: '...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 606: `rgba(251,146,60,0.08)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...xl p-4" style={{ background: 'rgba(251,146,60,0.08)', border: '1px solid rgba(251...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 606: `rgba(251,146,60,0.2)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...60,0.08)', border: '1px solid rgba(251,146,60,0.2)' }}>...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 711: `style={{ color: 'rgb`
  - *Pattern:* inline-style-color
  - *Context:* `...  <p className="text-sm mb-3" style={{ color: 'rgba(255,255,255,0.4)' }}>{plan.d...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 711: `rgba(255,255,255,0.4)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...ext-sm mb-3" style={{ color: 'rgba(255,255,255,0.4)' }}>{plan.desc}</p>...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 716: `style={{ color: 'rgb`
  - *Pattern:* inline-style-color
  - *Context:* `...className="space-y-1 text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 716: `rgba(255,255,255,0.5)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...y-1 text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 731: `style={{ background: 'rgb`
  - *Pattern:* inline-style-color
  - *Context:* `..."mb-3 p-2 rounded-lg text-xs" style={{ background: 'rgba(255,255,255,0.05)' }}>...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 731: `rgba(255,255,255,0.05)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...ext-xs" style={{ background: 'rgba(255,255,255,0.05)' }}>...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 739: `style={{ color: 'rgb`
  - *Pattern:* inline-style-color
  - *Context:* `... items-start gap-1.5 text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 739: `rgba(255,255,255,0.3)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...1.5 text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 744: `style={{ color: 'rgb`
  - *Pattern:* inline-style-color
  - *Context:* `...lassName="block mt-1 text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>主项，越往后越...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 744: `rgba(255,255,255,0.2)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...t-1 text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>主项，越往后越重，不力竭</span>}...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 745: `style={{ color: 'rgb`
  - *Pattern:* inline-style-color
  - *Context:* `...lassName="block mt-1 text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>上胸主练，保持...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 745: `rgba(255,255,255,0.2)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...t-1 text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>上胸主练，保持持续张力</span>}...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 746: `style={{ color: 'rgb`
  - *Pattern:* inline-style-color
  - *Context:* `...lassName="block mt-1 text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>偏下胸做法，做...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 746: `rgba(255,255,255,0.2)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...t-1 text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>偏下胸做法，做不了就退阶</span>}...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 747: `style={{ color: 'rgb`
  - *Pattern:* inline-style-color
  - *Context:* `...lassName="block mt-1 text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>背阔主练，顺着...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 747: `rgba(255,255,255,0.2)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...t-1 text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>背阔主练，顺着肌纤维方向拉，优先对握</span>...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 748: `style={{ color: 'rgb`
  - *Pattern:* inline-style-color
  - *Context:* `...lassName="block mt-1 text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>背阔主练，幅度...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 748: `rgba(255,255,255,0.2)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...t-1 text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>背阔主练，幅度不用贪大，保持张力</span>}...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 749: `style={{ color: 'rgb`
  - *Pattern:* inline-style-color
  - *Context:* `...lassName="block mt-1 text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>建立单腿稳定、...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 749: `rgba(255,255,255,0.2)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...t-1 text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>建立单腿稳定、髋控制和后侧链发力</span>}...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 750: `style={{ color: 'rgb`
  - *Pattern:* inline-style-color
  - *Context:* `...lassName="block mt-1 text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>前腿主导，后腿...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 750: `rgba(255,255,255,0.2)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...t-1 text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>前腿主导，后腿尽量放松</span>}...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[MEDIUM]** Line 527: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...  <h2 className="text-xl font-black text-primary">{generatedPlan....`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 566: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...r justify-center text-xs font-black bg-primary/10 text-primary">{...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

### src\app\profile\_components\BodyKpiCard.tsx

- **[HIGH]** Line 58: `style={{ color: "#`
  - *Pattern:* inline-style-color
  - *Context:* `...ndingDown className="w-4 h-4" style={{ color: "#4ade80" }} />...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 58: `#4ade80`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...me="w-4 h-4" style={{ color: "#4ade80" }} />...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 60: `style={{ color: "#`
  - *Pattern:* inline-style-color
  - *Context:* `...rendingUp className="w-4 h-4" style={{ color: "#f87171" }} />...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 60: `#f87171`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...me="w-4 h-4" style={{ color: "#f87171" }} />...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 66: `#4ade80`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...         color: isNegative ? "#4ade80" : isPositive ? "#f87171" : "...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 66: `#f87171`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...e ? "#4ade80" : isPositive ? "#f87171" : "var(--text-low)",...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[MEDIUM]** Line 49: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...className="mt-1 text-5xl font-black tracking-tight" style={{ colo...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

### src\app\profile\_components\MetricEditorSheet.tsx

- **[HIGH]** Line 65: `style={{ background: "rgb`
  - *Pattern:* inline-style-color
  - *Context:* `...lassName="fixed inset-0 z-50" style={{ background: "rgba(0,0,0,.55)" }} />...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 65: `rgba(0,0,0,.55)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...0 z-50" style={{ background: "rgba(0,0,0,.55)" }} />...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 76: `style={{ background: "rgb`
  - *Pattern:* inline-style-color
  - *Context:* `...mb-4 h-1.5 w-12 rounded-full" style={{ background: "rgba(255,255,255,.18)" }} />...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 76: `rgba(255,255,255,.18)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...d-full" style={{ background: "rgba(255,255,255,.18)" }} />...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[MEDIUM]** Line 83: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `... <div className="text-sm font-black" style={{ color: "var(--foreg...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 101: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...-14 rounded-2xl text-2xl font-black"...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

### src\app\summary\page.tsx

- **[HIGH]** Line 349: `#000`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...e="36" fontWeight="900" fill="#000">...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[MEDIUM]** Line 353: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `... <h1 className="text-2xl font-black mb-4">没有找到训练记录</h1>...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 461: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...div className={`text-2xl font-black ${stat.colorClass}`}>{stat.va...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 503: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...  <h3 className="text-lg font-black text-primary">...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 546: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...  <h3 className="text-lg font-black text-primary">训练心得</h3>...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 565: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...<h3 className="text-base font-black mb-3 flex items-center gap-2 ...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

### src\app\workout\components\WarmupPanel.tsx

- **[HIGH]** Line 50: `style={{ background: 'rgb`
  - *Pattern:* inline-style-color
  - *Context:* `...        style={{ background: 'rgba(52,211,153,0.08)', border: '...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 50: `rgba(52,211,153,0.08)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...        style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 50: `rgba(52,211,153,0.2)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...53,0.08)', border: '1px solid rgba(52,211,153,0.2)' }}>...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 51: `style={{ color: '#`
  - *Pattern:* inline-style-color
  - *Context:* `...Check className="w-3.5 h-3.5" style={{ color: '#34D399' }} />...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 51: `#34D399`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...w-3.5 h-3.5" style={{ color: '#34D399' }} />...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 52: `style={{ color: '#`
  - *Pattern:* inline-style-color
  - *Context:* `...className="text-xs font-bold" style={{ color: '#34D399' }}>热身已完成</span>...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 52: `#34D399`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...s font-bold" style={{ color: '#34D399' }}>热身已完成</span>...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 72: `style={{ background: 'rgba(251,146,60,0.1)', color: '#`
  - *Pattern:* inline-style-color
  - *Context:* `...            style={{ background: 'rgba(251,146,60,0.1)', color: '#fb923c' }}>...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 72: `rgba(251,146,60,0.1)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...        style={{ background: 'rgba(251,146,60,0.1)', color: '#fb923c' }}>...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 72: `#fb923c`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...gba(251,146,60,0.1)', color: '#fb923c' }}>...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 84: `rgba(52,211,153,0.08)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...e={{ background: item.done ? 'rgba(52,211,153,0.08)' : 'var(--surface-2)' }}...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 88: `#34D399`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...     background: item.done ? '#34D399' : 'var(--surface-3)',...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 92: `style={{ color: '#`
  - *Pattern:* inline-style-color
  - *Context:* `... ? <Check className="w-3 h-3" style={{ color: '#000' }} />...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 92: `#000`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...me="w-3 h-3" style={{ color: '#000' }} />...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 97: `#34D399`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `... style={{ color: item.done ? '#34D399' : 'var(--text-med)' }}>...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 117: `style={{ background: 'rgb`
  - *Pattern:* inline-style-color
  - *Context:* `...              style={{ background: 'rgb(var(--accent))', color: 'var(...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[MEDIUM]** Line 70: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...<span className="text-sm font-black">训练准备</span>...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 93: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...<span className="text-xs font-black" style={{ color: 'var(--text-...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 116: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `... py-3 rounded-xl text-sm font-black"...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 125: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `... py-3 rounded-xl text-sm font-black transition-all"...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

### src\app\workout\HeroExerciseSurface.tsx

- **[HIGH]** Line 116: `style={{ background: 'rgba(251,191,36,0.12)', color: '#`
  - *Pattern:* inline-style-color
  - *Context:* `...            style={{ background: 'rgba(251,191,36,0.12)', color: '#fbbf24' }}...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 116: `rgba(251,191,36,0.12)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...        style={{ background: 'rgba(251,191,36,0.12)', color: '#fbbf24' }}...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 116: `#fbbf24`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...ba(251,191,36,0.12)', color: '#fbbf24' }}...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[MEDIUM]** Line 97: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...     className="text-4xl font-black leading-tight tracking-tight"...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 137: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...      className="text-sm font-black tabular-nums"...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 181: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...     className="text-3xl font-black tabular-nums leading-none"...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 223: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...     className="text-3xl font-black tabular-nums leading-none"...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 246: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `..."w-full py-5 rounded-2xl font-black text-lg flex items-center jus...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

### src\app\workout\page.tsx

- **[HIGH]** Line 17: `rgba(184,255,43,0.04)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...t(ellipse 80% 50% at 50% 30%, rgba(184,255,43,0.04) 0%, transparent 70%), linear-...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 17: `#0C0C0E`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...70%), linear-gradient(180deg, #0C0C0E 0%, #08080A 100%)",...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 17: `#08080A`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...-gradient(180deg, #0C0C0E 0%, #08080A 100%)",...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

### src\app\workout\RuntimeQueueRail.tsx

- **[HIGH]** Line 78: `rgba(34,197,94,0.12)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...                      ? 'rgba(34,197,94,0.12)'...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 83: `rgba(34,197,94,0.4)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...                 ? '2px solid rgba(34,197,94,0.4)'...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 90: `style={{ color: '#`
  - *Pattern:* inline-style-color
  - *Context:* `...   <Check className="w-4 h-4" style={{ color: '#22c55e' }} />...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 90: `#22c55e`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...me="w-4 h-4" style={{ color: '#22c55e' }} />...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 113: `#22c55e`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...    style={{ color: isDone ? '#22c55e' : t.accent }}...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[MEDIUM]** Line 93: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...      className="text-xs font-black tabular-nums"...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

### src\app\workout\WorkoutController.tsx

- **[HIGH]** Line 192: `#6b7280`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `..." style={{ color: isPaused ? '#6b7280' : 'var(--accent)' }}>...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 197: `style={{ color: 'rgb`
  - *Pattern:* inline-style-color
  - *Context:* `...          <span style={{ color: 'rgba(255,255,255,0.25)' }}>·</spa...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 197: `rgba(255,255,255,0.25)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...       <span style={{ color: 'rgba(255,255,255,0.25)' }}>·</span>...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 198: `#ef4444`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...e={{ color: restSecs <= 10 ? '#ef4444' : '#f59e0b' }} />...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 198: `#f59e0b`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...restSecs <= 10 ? '#ef4444' : '#f59e0b' }} />...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 199: `#ef4444`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...e={{ color: restSecs <= 10 ? '#ef4444' : '#f59e0b', fontVariantNume...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 199: `#f59e0b`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...restSecs <= 10 ? '#ef4444' : '#f59e0b', fontVariantNumeric: 'tabula...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 285: `rgba(96,165,250,0.12)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...rface-2)', border: '1px solid rgba(96,165,250,0.12)' }}>...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 286: `style={{ color: '#`
  - *Pattern:* inline-style-color
  - *Context:* `...t-xl font-black tabular-nums" style={{ color: '#60A5FA' }}>{isTreadmill ? spee...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 286: `#60A5FA`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...abular-nums" style={{ color: '#60A5FA' }}>{isTreadmill ? speed.toFi...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 289: `rgba(96,165,250,0.12)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...rface-2)', border: '1px solid rgba(96,165,250,0.12)' }}>...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 290: `style={{ color: '#`
  - *Pattern:* inline-style-color
  - *Context:* `...t-xl font-black tabular-nums" style={{ color: '#60A5FA' }}>{isTreadmill ? `${i...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 290: `#60A5FA`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...abular-nums" style={{ color: '#60A5FA' }}>{isTreadmill ? `${incline...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 294: `rgba(96,165,250,0.12)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...rface-2)', border: '1px solid rgba(96,165,250,0.12)' }}>...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 295: `style={{ color: '#`
  - *Pattern:* inline-style-color
  - *Context:* `...t-xl font-black tabular-nums" style={{ color: '#60A5FA' }}>{dist.toFixed(2)}</...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 295: `#60A5FA`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...abular-nums" style={{ color: '#60A5FA' }}>{dist.toFixed(2)}</p>...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 299: `rgba(249,115,22,0.12)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...rface-2)', border: '1px solid rgba(249,115,22,0.12)' }}>...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 300: `style={{ color: '#`
  - *Pattern:* inline-style-color
  - *Context:* `...t-xl font-black tabular-nums" style={{ color: '#f97316' }}>{cals}</p>...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 300: `#f97316`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...abular-nums" style={{ color: '#f97316' }}>{cals}</p>...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 318: `style={{ background: '#60A5FA', color: '#`
  - *Pattern:* inline-style-color
  - *Context:* `...      style={{ background: '#60A5FA', color: '#000', opacity: isLoading ? 0.6...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 318: `rgba(96,165,250,0.35)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...0.6 : 1, boxShadow: '0 0 28px rgba(96,165,250,0.35)' }}>...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 318: `#60A5FA`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...      style={{ background: '#60A5FA', color: '#000', opacity: isL...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 318: `#000`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...ackground: '#60A5FA', color: '#000', opacity: isLoading ? 0.6 : ...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 333: `style={{ background: 'rgb`
  - *Pattern:* inline-style-color
  - *Context:* `...      style={{ background: 'rgba(0,0,0,0.94)', backdropFilter...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 333: `rgba(0,0,0,0.94)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...      style={{ background: 'rgba(0,0,0,0.94)', backdropFilter: 'blur(16px)...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 339: `style={{ color: 'rgb`
  - *Pattern:* inline-style-color
  - *Context:* `...i} className="text-sm mb-1.5" style={{ color: 'rgba(255,255,255,0.48)' }}>{line}...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 339: `rgba(255,255,255,0.48)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...t-sm mb-1.5" style={{ color: 'rgba(255,255,255,0.48)' }}>{line}</p>...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 344: `style={{ background: '#fff', color: '#`
  - *Pattern:* inline-style-color
  - *Context:* `...            style={{ background: '#fff', color: '#000', touchAction: 'manipulati...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 344: `#fff`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...        style={{ background: '#fff', color: '#000', touchAction:...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 344: `#000`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...{ background: '#fff', color: '#000', touchAction: 'manipulation'...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 1654: `rgba(52,211,153,0.2)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...surface)', border: '1px solid rgba(52,211,153,0.2)' }}>...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 1660: `style={{ color: '#`
  - *Pattern:* inline-style-color
  - *Context:* `...sName="text-sm font-semibold" style={{ color: '#34D399' }}>...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 1660: `#34D399`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...nt-semibold" style={{ color: '#34D399' }}>...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 1670: `rgba(52,211,153,0.04)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...                 background: 'rgba(52,211,153,0.04)',...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 1671: `rgba(52,211,153,0.08)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...        borderTop: '1px solid rgba(52,211,153,0.08)',...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 1672: `rgba(52,211,153,0.08)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...     borderBottom: '1px solid rgba(52,211,153,0.08)',...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 1676: `style={{ color: '#`
  - *Pattern:* inline-style-color
  - *Context:* `...                      style={{ color: '#34D399', fontSize: '2rem' }}>...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 1676: `#34D399`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...             style={{ color: '#34D399', fontSize: '2rem' }}>...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 1681: `style={{ background: 'rgba(52,211,153,0.12)', color: '#`
  - *Pattern:* inline-style-color
  - *Context:* `...                        style={{ background: 'rgba(52,211,153,0.12)', color: '#34D399' }}>...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 1681: `rgba(52,211,153,0.12)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...        style={{ background: 'rgba(52,211,153,0.12)', color: '#34D399' }}>...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 1681: `#34D399`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...ba(52,211,153,0.12)', color: '#34D399' }}>...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 1696: `rgba(52,211,153,0.06)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...                 background: 'rgba(52,211,153,0.06)',...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 1697: `rgba(52,211,153,0.18)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...           border: '1px solid rgba(52,211,153,0.18)',...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 1711: `rgba(52,211,153,0.4)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...                           ? 'rgba(52,211,153,0.4)'...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 1713: `#34D399`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...                           ? '#34D399'...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 1730: `style={{ background: '#34D399', color: '#`
  - *Pattern:* inline-style-color
  - *Context:* `...                        style={{ background: '#34D399', color: '#000', opacity: isLoading ? 0.6...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 1730: `rgba(52,211,153,0.25)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...0.6 : 1, boxShadow: '0 0 24px rgba(52,211,153,0.25)' }}>...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 1730: `#34D399`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...        style={{ background: '#34D399', color: '#000', opacity: isL...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 1730: `#000`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...ackground: '#34D399', color: '#000', opacity: isLoading ? 0.6 : ...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 1738: `style={{ background: 'rgba(52,211,153,0.1)', color: '#`
  - *Pattern:* inline-style-color
  - *Context:* `...                        style={{ background: 'rgba(52,211,153,0.1)', color: '#34D399', border: '1px solid rg...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 1738: `rgba(52,211,153,0.1)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...        style={{ background: 'rgba(52,211,153,0.1)', color: '#34D399', border: '...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 1738: `rgba(52,211,153,0.25)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...'#34D399', border: '1px solid rgba(52,211,153,0.25)' }}>...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 1738: `#34D399`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...gba(52,211,153,0.1)', color: '#34D399', border: '1px solid rgba(52,...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 1750: `rgba(168,85,247,0.25)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...surface)', border: '1px solid rgba(168,85,247,0.25)' }}>...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 1760: `style={{ color: '#`
  - *Pattern:* inline-style-color
  - *Context:* `...-3xl font-black tabular-nums" style={{ color: '#A855F7' }} />...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 1760: `#A855F7`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...abular-nums" style={{ color: '#A855F7' }} />...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 1770: `style={{ background: 'rgba(168,85,247,0.12)', color: '#`
  - *Pattern:* inline-style-color
  - *Context:* `...                      style={{ background: 'rgba(168,85,247,0.12)', color: '#A855F7', border: '1px solid rg...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 1770: `rgba(168,85,247,0.12)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...        style={{ background: 'rgba(168,85,247,0.12)', color: '#A855F7', border: '...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 1770: `rgba(168,85,247,0.2)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...'#A855F7', border: '1px solid rgba(168,85,247,0.2)' }}>...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 1770: `#A855F7`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...ba(168,85,247,0.12)', color: '#A855F7', border: '1px solid rgba(168...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 1782: `rgba(168,85,247,0.2)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...rface-2)', border: '1px solid rgba(168,85,247,0.2)', color: 'var(--foreground)' ...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 1787: `style={{ background: '#A855F7', color: '#`
  - *Pattern:* inline-style-color
  - *Context:* `...                  style={{ background: '#A855F7', color: '#fff', opacity: isLoading ? 0.6...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 1787: `#A855F7`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...        style={{ background: '#A855F7', color: '#fff', opacity: isL...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 1787: `#fff`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...ackground: '#A855F7', color: '#fff', opacity: isLoading ? 0.6 : ...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 1797: `#60A5FA`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `... accentColor = isTreadmill ? '#60A5FA' : '#FBBF24';...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 1797: `#FBBF24`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `... = isTreadmill ? '#60A5FA' : '#FBBF24';...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 1963: `style={{ background: 'rgb`
  - *Pattern:* inline-style-color
  - *Context:* `...                style={{ background: 'rgba(204,255,0,0.08)', border: '1...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 1963: `rgba(204,255,0,0.08)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...        style={{ background: 'rgba(204,255,0,0.08)', border: '1px solid rgba(204...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 1963: `rgba(204,255,0,0.2)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...,0,0.08)', border: '1px solid rgba(204,255,0,0.2)' }}>...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 2059: `style={{ background: 'rgb`
  - *Pattern:* inline-style-color
  - *Context:* `...                            style={{ background: 'rgba(52,211,153,0.12)' }}>...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 2059: `rgba(52,211,153,0.12)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...        style={{ background: 'rgba(52,211,153,0.12)' }}>...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 2060: `style={{ color: '#`
  - *Pattern:* inline-style-color
  - *Context:* `...    <span className="text-xs" style={{ color: '#34D399' }}>✓</span>...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 2060: `#34D399`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...me="text-xs" style={{ color: '#34D399' }}>✓</span>...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 2074: `style={{ background: 'rgba(52,211,153,0.1)', color: '#`
  - *Pattern:* inline-style-color
  - *Context:* `...                              style={{ background: 'rgba(52,211,153,0.1)', color: '#34D399' }}>...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 2074: `rgba(52,211,153,0.1)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...        style={{ background: 'rgba(52,211,153,0.1)', color: '#34D399' }}>...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 2074: `#34D399`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...gba(52,211,153,0.1)', color: '#34D399' }}>...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 2191: `style={{ background: '#`
  - *Pattern:* inline-style-color
  - *Context:* `...                style={{ background: '#0d0d0d', border: '1px solid #1...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 2191: `#0d0d0d`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...        style={{ background: '#0d0d0d', border: '1px solid #1f1f1f'...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 2191: `#1f1f1f`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...'#0d0d0d', border: '1px solid #1f1f1f', maxHeight: '88vh', overflow...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 2195: `style={{ background: '#`
  - *Pattern:* inline-style-color
  - *Context:* `...                  style={{ background: '#0d0d0d', borderBottom: '1px so...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 2195: `#0d0d0d`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...        style={{ background: '#0d0d0d', borderBottom: '1px solid #1...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 2195: `#1f1f1f`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...0d', borderBottom: '1px solid #1f1f1f' }}>...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 2199: `style={{ color: 'rgb`
  - *Pattern:* inline-style-color
  - *Context:* `...<p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{summa...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 2199: `rgba(255,255,255,0.35)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...t-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{summary}</p>...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 2204: `style={{ background: '#`
  - *Pattern:* inline-style-color
  - *Context:* `...                    style={{ background: '#1a1a1a' }}>...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 2204: `#1a1a1a`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...        style={{ background: '#1a1a1a' }}>...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 2226: `style={{ color: 'rgb`
  - *Pattern:* inline-style-color
  - *Context:* `...ame="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}>{step.t...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 2226: `rgba(255,255,255,0.7)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...ing-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}>{step.trim()}</span>...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 2242: `style={{ background: 'rgba(251,146,60,0.1)', color: '#`
  - *Pattern:* inline-style-color
  - *Context:* `...                            style={{ background: 'rgba(251,146,60,0.1)', color: '#fb923c' }}>...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 2242: `rgba(251,146,60,0.1)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...        style={{ background: 'rgba(251,146,60,0.1)', color: '#fb923c' }}>...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 2242: `#fb923c`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...gba(251,146,60,0.1)', color: '#fb923c' }}>...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 2258: `style={{ color: '#`
  - *Pattern:* inline-style-color
  - *Context:* `...                        <span style={{ color: '#f59e0b' }} className="shrink-0...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 2258: `#f59e0b`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...       <span style={{ color: '#f59e0b' }} className="shrink-0 mt-0....`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 2290: `style={{ background: 'rgb`
  - *Pattern:* inline-style-color
  - *Context:* `...          style={{ background: 'rgba(0,0,0,0.45)', backdropFilter...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 2290: `rgba(0,0,0,0.45)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...        style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)'...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 2317: `style={{ background: 'rgba(239,68,68,0.1)', color: '#`
  - *Pattern:* inline-style-color
  - *Context:* `...                style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', touchAction: 'manipul...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 2317: `rgba(239,68,68,0.1)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...        style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', touchActi...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 2317: `#ef4444`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...rgba(239,68,68,0.1)', color: '#ef4444', touchAction: 'manipulation'...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 2341: `style={{ background: 'rgb`
  - *Pattern:* inline-style-color
  - *Context:* `...          style={{ background: 'rgba(0,0,0,0.55)', backdropFilter...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 2341: `rgba(0,0,0,0.55)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...        style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)'...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 2385: `style={{ background: 'rgba(239,68,68,0.08)', color: '#`
  - *Pattern:* inline-style-color
  - *Context:* `...              style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1px solid rg...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 2385: `rgba(239,68,68,0.08)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...        style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 2385: `rgba(239,68,68,0.2)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...'#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 2385: `#ef4444`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...gba(239,68,68,0.08)', color: '#ef4444', border: '1px solid rgba(239...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[MEDIUM]** Line 255: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...         <div className="font-black tabular-nums leading-none"...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 286: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...   <p className="text-xl font-black tabular-nums" style={{ color:...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 290: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...   <p className="text-xl font-black tabular-nums" style={{ color:...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 295: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...   <p className="text-xl font-black tabular-nums" style={{ color:...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 300: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...   <p className="text-xl font-black tabular-nums" style={{ color:...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 317: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...r gap-3 rounded-2xl py-5 font-black text-lg transition-all active...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 337: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `... <h2 className="text-2xl font-black text-foreground mb-4">{headin...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 343: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `... w-full rounded-2xl py-4 font-black text-base transition-all acti...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 1512: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `... <h1 className="text-2xl font-black">训练中</h1>...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 1675: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...           <p className="font-black leading-tight mb-3"...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 1729: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...r gap-2 rounded-2xl py-4 font-black text-base transition-all"...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 1737: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...r gap-2 rounded-2xl py-4 font-black text-base transition-all acti...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 1755: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...div className="text-base font-black">自由记录</div>...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 1760: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...tion className="text-3xl font-black tabular-nums" style={{ color:...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 1786: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...er gap-2 rounded-xl py-4 font-black text-base transition-all"...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 1805: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `... justify-center text-2xl font-black transition-all active:scale-9...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 1818: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...pan className="text-base font-black">{CARDIO_LABELS[trainingType]...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 1850: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...        <span className="font-black text-3xl tabular-nums" style=...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 1865: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...        <span className="font-black text-3xl tabular-nums" style=...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 1883: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...        <span className="font-black text-3xl tabular-nums" style=...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 1954: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...<span className="text-sm font-black">{exerciseTransition.prev} 完成...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 1964: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...<span className="text-sm font-black" style={{ color: 'var(--accen...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 2197: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...<h2 className="text-base font-black text-foreground">{detailExerc...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 2224: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...r justify-center text-xs font-black shrink-0 mt-0.5"...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 2272: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...unded-2xl py-3.5 text-sm font-black text-accent-foreground"...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 2300: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...           <p className="font-black text-base" style={{ color: 'v...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

### src\components\ai-coaching\MuscleHeatmap.tsx

- **[HIGH]** Line 30: `rgba(163,230,53,0.12)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...< 1000) return { background: 'rgba(163,230,53,0.12)', borderColor: 'rgba(163,230,...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 30: `rgba(163,230,53,0.3)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...,230,53,0.12)', borderColor: 'rgba(163,230,53,0.3)' };...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 31: `rgba(163,230,53,0.28)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...< 5000) return { background: 'rgba(163,230,53,0.28)', borderColor: 'rgba(163,230,...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 31: `rgba(163,230,53,0.5)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...,230,53,0.28)', borderColor: 'rgba(163,230,53,0.5)' };...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 32: `rgba(239,68,68,0.22)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...    return { background: 'rgba(239,68,68,0.22)', borderColor: 'rgba(239,68,6...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 32: `rgba(239,68,68,0.5)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...9,68,68,0.22)', borderColor: 'rgba(239,68,68,0.5)' };...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 36: `#a3e635`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...ted-foreground' : v < 1000 ? '#a3e635' : v < 5000 ? '#84cc16' : '#e...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 36: `#84cc16`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...000 ? '#a3e635' : v < 5000 ? '#84cc16' : '#ef4444';...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 36: `#ef4444`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...35' : v < 5000 ? '#84cc16' : '#ef4444';...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 67: `rgba(163,230,53,0.4)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...'var(--surface-3)', '未训练'], ['rgba(163,230,53,0.4)', '<1000kg'], ['rgba(132,204,...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 67: `rgba(132,204,22,0.6)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...3,230,53,0.4)', '<1000kg'], ['rgba(132,204,22,0.6)', '<5000kg'], ['rgba(239,68,6...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 67: `rgba(239,68,68,0.5)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...2,204,22,0.6)', '<5000kg'], ['rgba(239,68,68,0.5)', '≥5000kg']] as [string, str...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

### src\components\DashboardMeta.tsx

- **[HIGH]** Line 39: `style={{ background: "#`
  - *Pattern:* inline-style-color
  - *Context:* `...        style={{ background: "#F59E0B" }}...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 39: `#F59E0B`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...        style={{ background: "#F59E0B" }}...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

### src\components\ExercisePicker.tsx

- **[HIGH]** Line 275: `style={{ background: '#`
  - *Pattern:* inline-style-color
  - *Context:* `...        style={{ background: '#0a0a0a', borderTop: '1px solid...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 275: `#0a0a0a`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...        style={{ background: '#0a0a0a', borderTop: '1px solid #1e1e...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 275: `#1e1e1e`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...a0a0a', borderTop: '1px solid #1e1e1e', height: '88vh' }}...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 279: `style={{ background: '#`
  - *Pattern:* inline-style-color
  - *Context:* `...sName="w-10 h-1 rounded-full" style={{ background: '#2a2a2a' }} />...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 279: `#2a2a2a`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...d-full" style={{ background: '#2a2a2a' }} />...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 288: `style={{ background: '#`
  - *Pattern:* inline-style-color
  - *Context:* `...            style={{ background: '#1a1a1a', touchAction: 'manipul...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 288: `#1a1a1a`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...        style={{ background: '#1a1a1a', touchAction: 'manipulation'...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 304: `style={{ background: '#`
  - *Pattern:* inline-style-color
  - *Context:* `...              style={{ background: '#151515', border: '1px solid #1...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 304: `#151515`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...        style={{ background: '#151515', border: '1px solid #1e1e1e'...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 304: `#1e1e1e`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...'#151515', border: '1px solid #1e1e1e' }}...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 367: `style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#`
  - *Pattern:* inline-style-color
  - *Context:* `...            style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#10B981' }}...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 367: `rgba(16,185,129,0.1)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...        style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 367: `rgba(16,185,129,0.2)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#10B981' }}...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 367: `#10B981`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...gba(16,185,129,0.2)', color: '#10B981' }}...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 380: `style={{ color: 'rgb`
  - *Pattern:* inline-style-color
  - *Context:* `...percase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.2)' }}>最近使用</p...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 380: `rgba(255,255,255,0.2)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...widest mb-3" style={{ color: 'rgba(255,255,255,0.2)' }}>最近使用</p>...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 387: `style={{ background: '#151515', border: '1px solid #1e1e1e', color: 'rgb`
  - *Pattern:* inline-style-color
  - *Context:* `...                    style={{ background: '#151515', border: '1px solid #1e1e1e', color: 'rgba(255,255,255,0.65)', touchAct...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 387: `rgba(255,255,255,0.65)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `... '1px solid #1e1e1e', color: 'rgba(255,255,255,0.65)', touchAction: 'manipulation'...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 387: `#151515`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...        style={{ background: '#151515', border: '1px solid #1e1e1e'...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 387: `#1e1e1e`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...'#151515', border: '1px solid #1e1e1e', color: 'rgba(255,255,255,0....`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 399: `style={{ color: 'rgb`
  - *Pattern:* inline-style-color
  - *Context:* `...percase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.2)' }}>...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 399: `rgba(255,255,255,0.2)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...widest mb-3" style={{ color: 'rgba(255,255,255,0.2)' }}>...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 412: `style={{ background: '#`
  - *Pattern:* inline-style-color
  - *Context:* `...                      style={{ background: '#111', border: '1px solid #1e1e...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 412: `#111`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...        style={{ background: '#111', border: '1px solid #1e1e1e'...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 412: `#1e1e1e`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...d: '#111', border: '1px solid #1e1e1e', touchAction: 'manipulation'...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 419: `style={{ color: 'rgb`
  - *Pattern:* inline-style-color
  - *Context:* `...ame="text-xs mt-0.5 truncate" style={{ color: 'rgba(255,255,255,0.3)' }}>{type}{...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 419: `rgba(255,255,255,0.3)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `....5 truncate" style={{ color: 'rgba(255,255,255,0.3)' }}>{type}{group ? ` · ${grou...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 452: `style={{ color: 'rgb`
  - *Pattern:* inline-style-color
  - *Context:* `...ssName="w-5 h-5 animate-spin" style={{ color: 'rgba(255,255,255,0.2)' }} />...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 452: `rgba(255,255,255,0.2)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...nimate-spin" style={{ color: 'rgba(255,255,255,0.2)' }} />...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 453: `style={{ color: 'rgb`
  - *Pattern:* inline-style-color
  - *Context:* `...    <span className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>加载中...<...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 453: `rgba(255,255,255,0.3)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...me="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>加载中...</span>...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 464: `style={{ background: '#`
  - *Pattern:* inline-style-color
  - *Context:* `...                          style={{ background: '#111', border: '1px solid #1e1e...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 464: `#111`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...        style={{ background: '#111', border: '1px solid #1e1e1e'...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 464: `#1e1e1e`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...d: '#111', border: '1px solid #1e1e1e', touchAction: 'manipulation'...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 471: `style={{ color: 'rgb`
  - *Pattern:* inline-style-color
  - *Context:* `...ame="text-xs mt-0.5 truncate" style={{ color: 'rgba(255,255,255,0.3)' }}>{MUSCLE...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 471: `rgba(255,255,255,0.3)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `....5 truncate" style={{ color: 'rgba(255,255,255,0.3)' }}>{MUSCLE_GROUP_MAP[exercis...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 487: `rgba(255,59,92,0.3)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...DeleteExId === exercise.id ? 'rgba(255,59,92,0.3)' : 'rgba(255,59,92,0.12)',...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 487: `rgba(255,59,92,0.12)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...id ? 'rgba(255,59,92,0.3)' : 'rgba(255,59,92,0.12)',...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 493: `style={{ color: '#`
  - *Pattern:* inline-style-color
  - *Context:* `... ? <Check className="w-3 h-3" style={{ color: '#FF3B5C' }} />...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 493: `#FF3B5C`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...me="w-3 h-3" style={{ color: '#FF3B5C' }} />...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 494: `style={{ color: '#`
  - *Pattern:* inline-style-color
  - *Context:* `...: <Trash2 className="w-3 h-3" style={{ color: '#FF3B5C' }} />}...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 494: `#FF3B5C`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...me="w-3 h-3" style={{ color: '#FF3B5C' }} />}...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 502: `style={{ background: '#`
  - *Pattern:* inline-style-color
  - *Context:* `...s-center justify-center mb-4" style={{ background: '#151515', border: '1px solid #1...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 502: `#151515`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...r mb-4" style={{ background: '#151515', border: '1px solid #1e1e1e'...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 502: `#1e1e1e`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...'#151515', border: '1px solid #1e1e1e' }}>...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 503: `style={{ color: 'rgb`
  - *Pattern:* inline-style-color
  - *Context:* `...    <User className="w-6 h-6" style={{ color: 'rgba(255,255,255,0.2)' }} />...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 503: `rgba(255,255,255,0.2)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...me="w-6 h-6" style={{ color: 'rgba(255,255,255,0.2)' }} />...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 506: `style={{ color: 'rgb`
  - *Pattern:* inline-style-color
  - *Context:* `...me="text-xs mb-5 text-center" style={{ color: 'rgba(255,255,255,0.3)' }}>搜索不存在的动...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 506: `rgba(255,255,255,0.3)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...text-center" style={{ color: 'rgba(255,255,255,0.3)' }}>搜索不存在的动作名即可创建</p>...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 510: `style={{ background: '#1a1a1a', color: 'rgb`
  - *Pattern:* inline-style-color
  - *Context:* `...                    style={{ background: '#1a1a1a', color: 'rgba(255,255,255,0.6)', touchActi...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 510: `rgba(255,255,255,0.6)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...ackground: '#1a1a1a', color: 'rgba(255,255,255,0.6)', touchAction: 'manipulation'...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 510: `#1a1a1a`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...        style={{ background: '#1a1a1a', color: 'rgba(255,255,255,0....`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 529: `style={{ background: '#`
  - *Pattern:* inline-style-color
  - *Context:* `...                    style={{ background: '#111', border: '1px solid #1e1e...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 529: `#111`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...        style={{ background: '#111', border: '1px solid #1e1e1e'...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 529: `#1e1e1e`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...d: '#111', border: '1px solid #1e1e1e', touchAction: 'manipulation'...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 536: `style={{ color: 'rgb`
  - *Pattern:* inline-style-color
  - *Context:* `...ame="text-xs mt-0.5 truncate" style={{ color: 'rgba(255,255,255,0.3)' }}>{item.t...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 536: `rgba(255,255,255,0.3)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `....5 truncate" style={{ color: 'rgba(255,255,255,0.3)' }}>{item.type}</div>...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 548: `style={{ background: '#`
  - *Pattern:* inline-style-color
  - *Context:* `...                      style={{ background: '#111', border: '1px solid #1e1e...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 548: `#111`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...        style={{ background: '#111', border: '1px solid #1e1e1e'...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 548: `#1e1e1e`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...d: '#111', border: '1px solid #1e1e1e', touchAction: 'manipulation'...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 555: `style={{ color: 'rgb`
  - *Pattern:* inline-style-color
  - *Context:* `...iv className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>自定义</di...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 555: `rgba(255,255,255,0.3)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...t-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>自定义</div>...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 571: `rgba(255,59,92,0.3)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...DeleteExId === exercise.id ? 'rgba(255,59,92,0.3)' : 'rgba(255,59,92,0.12)',...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 571: `rgba(255,59,92,0.12)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...id ? 'rgba(255,59,92,0.3)' : 'rgba(255,59,92,0.12)',...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 577: `style={{ color: '#`
  - *Pattern:* inline-style-color
  - *Context:* `... ? <Check className="w-3 h-3" style={{ color: '#FF3B5C' }} />...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 577: `#FF3B5C`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...me="w-3 h-3" style={{ color: '#FF3B5C' }} />...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 578: `style={{ color: '#`
  - *Pattern:* inline-style-color
  - *Context:* `...: <Trash2 className="w-3 h-3" style={{ color: '#FF3B5C' }} />}...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 578: `#FF3B5C`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...me="w-3 h-3" style={{ color: '#FF3B5C' }} />}...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 602: `style={{ color: 'rgb`
  - *Pattern:* inline-style-color
  - *Context:* `...    <span className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>{items....`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 602: `rgba(255,255,255,0.2)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...me="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>{items.length} 个</span>...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 604: `style={{ color: 'rgb`
  - *Pattern:* inline-style-color
  - *Context:* `...ame="flex items-center gap-1" style={{ color: 'rgba(255,255,255,0.3)' }}>...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 604: `rgba(255,255,255,0.3)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...enter gap-1" style={{ color: 'rgba(255,255,255,0.3)' }}>...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 615: `style={{ background: '#`
  - *Pattern:* inline-style-color
  - *Context:* `...                          style={{ background: '#111', border: '1px solid #1e1e...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 615: `#111`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...        style={{ background: '#111', border: '1px solid #1e1e1e'...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 615: `#1e1e1e`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...d: '#111', border: '1px solid #1e1e1e', touchAction: 'manipulation'...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 622: `style={{ color: 'rgb`
  - *Pattern:* inline-style-color
  - *Context:* `..."text-[10px] mt-0.5 truncate" style={{ color: 'rgba(255,255,255,0.3)' }}>{item.t...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 622: `rgba(255,255,255,0.3)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `....5 truncate" style={{ color: 'rgba(255,255,255,0.3)' }}>{item.type}</div>}...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 639: `style={{ background: 'rgba(255,255,255,0.08)', color: 'rgb`
  - *Pattern:* inline-style-color
  - *Context:* `....5 py-1 rounded-lg font-bold" style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }}>我的</spa...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 639: `rgba(255,255,255,0.08)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...t-bold" style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0....`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 639: `rgba(255,255,255,0.5)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...a(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }}>我的</span>...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 640: `style={{ color: 'rgb`
  - *Pattern:* inline-style-color
  - *Context:* `...    <span className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>{dbCust...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 640: `rgba(255,255,255,0.2)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...me="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>{dbCustomExercises.length...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 642: `style={{ color: 'rgb`
  - *Pattern:* inline-style-color
  - *Context:* `...ame="flex items-center gap-1" style={{ color: 'rgba(255,255,255,0.3)' }}>...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 642: `rgba(255,255,255,0.3)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...enter gap-1" style={{ color: 'rgba(255,255,255,0.3)' }}>...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 655: `style={{ background: '#`
  - *Pattern:* inline-style-color
  - *Context:* `...                          style={{ background: '#111', border: '1px solid #1e1e...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 655: `#111`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...        style={{ background: '#111', border: '1px solid #1e1e1e'...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 655: `#1e1e1e`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...d: '#111', border: '1px solid #1e1e1e', touchAction: 'manipulation'...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 675: `style={{ background: '#`
  - *Pattern:* inline-style-color
  - *Context:* `...ounded-t-3xl overflow-hidden" style={{ background: '#0a0a0a', border: '1px solid #1...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 675: `#0a0a0a`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...hidden" style={{ background: '#0a0a0a', border: '1px solid #1e1e1e'...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 675: `#1e1e1e`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...'#0a0a0a', border: '1px solid #1e1e1e' }}>...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 676: `#1e1e1e`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...e={{ borderBottom: '1px solid #1e1e1e' }}>...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 678: `style={{ background: '#`
  - *Pattern:* inline-style-color
  - *Context:* `... items-center justify-center" style={{ background: '#1a1a1a' }}>...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 678: `#1a1a1a`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...center" style={{ background: '#1a1a1a' }}>...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 684: `style={{ color: 'rgb`
  - *Pattern:* inline-style-color
  - *Context:* `...Name="text-xs font-bold mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>动作名称</p...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 684: `rgba(255,255,255,0.4)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...t-bold mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>动作名称</p>...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 685: `style={{ background: '#`
  - *Pattern:* inline-style-color
  - *Context:* `...ground text-sm font-semibold" style={{ background: '#151515', border: '1px solid #1...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 685: `#151515`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...mibold" style={{ background: '#151515', border: '1px solid #1e1e1e'...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 685: `#1e1e1e`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...'#151515', border: '1px solid #1e1e1e' }}>...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 690: `style={{ color: 'rgb`
  - *Pattern:* inline-style-color
  - *Context:* `...Name="text-xs font-bold mb-3" style={{ color: 'rgba(255,255,255,0.4)' }}>选择关联部位<...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 690: `rgba(255,255,255,0.4)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...t-bold mb-3" style={{ color: 'rgba(255,255,255,0.4)' }}>选择关联部位</p>...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 700: `#1e1e1e`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...  style={{ border: '1px solid #1e1e1e', touchAction: 'manipulation'...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 716: `style={{ background: '#`
  - *Pattern:* inline-style-color
  - *Context:* `...ounded-t-3xl overflow-hidden" style={{ background: '#0a0a0a', border: '1px solid #1...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 716: `#0a0a0a`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...hidden" style={{ background: '#0a0a0a', border: '1px solid #1e1e1e'...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 716: `#1e1e1e`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...'#0a0a0a', border: '1px solid #1e1e1e', maxHeight: '80vh', overflow...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 717: `style={{ background: '#`
  - *Pattern:* inline-style-color
  - *Context:* `... px-5 pt-5 pb-4 sticky top-0" style={{ background: '#0a0a0a', borderBottom: '1px so...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 717: `#0a0a0a`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `... top-0" style={{ background: '#0a0a0a', borderBottom: '1px solid #1...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 717: `#1e1e1e`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...0a', borderBottom: '1px solid #1e1e1e' }}>...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 719: `style={{ background: '#`
  - *Pattern:* inline-style-color
  - *Context:* `... items-center justify-center" style={{ background: '#1a1a1a' }}>...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 719: `#1a1a1a`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...center" style={{ background: '#1a1a1a' }}>...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 731: `style={{ background: '#1a1a1a', color: 'rgb`
  - *Pattern:* inline-style-color
  - *Context:* `...0.5 rounded-lg font-semibold" style={{ background: '#1a1a1a', color: 'rgba(255,255,255,0.4)' }}>{select...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 731: `rgba(255,255,255,0.4)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...ackground: '#1a1a1a', color: 'rgba(255,255,255,0.4)' }}>{selectedExerciseDetail.g...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 731: `#1a1a1a`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...mibold" style={{ background: '#1a1a1a', color: 'rgba(255,255,255,0....`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 732: `style={{ background: '#1a1a1a', color: 'rgb`
  - *Pattern:* inline-style-color
  - *Context:* `...0.5 rounded-lg font-semibold" style={{ background: '#1a1a1a', color: 'rgba(255,255,255,0.4)' }}>{select...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 732: `rgba(255,255,255,0.4)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...ackground: '#1a1a1a', color: 'rgba(255,255,255,0.4)' }}>{selectedExerciseDetail.t...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 732: `#1a1a1a`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...mibold" style={{ background: '#1a1a1a', color: 'rgba(255,255,255,0....`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 738: `style={{ color: 'rgb`
  - *Pattern:* inline-style-color
  - *Context:* `...Name="text-xs font-bold mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>动作说明</h...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 738: `rgba(255,255,255,0.4)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...t-bold mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>动作说明</h4>...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 739: `style={{ color: 'rgb`
  - *Pattern:* inline-style-color
  - *Context:* `...       <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>{select...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 739: `rgba(255,255,255,0.6)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...me="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>{selectedExerciseDetail.d...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 744: `style={{ color: 'rgb`
  - *Pattern:* inline-style-color
  - *Context:* `...Name="text-xs font-bold mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>训练建议</h...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 744: `rgba(255,255,255,0.4)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...t-bold mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>训练建议</h4>...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 747: `style={{ color: 'rgb`
  - *Pattern:* inline-style-color
  - *Context:* `...ex items-start gap-2 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 747: `rgba(255,255,255,0.6)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...p-2 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 748: `style={{ color: '#`
  - *Pattern:* inline-style-color
  - *Context:* `...                        <span style={{ color: '#10B981' }} className="mt-0.5">...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 748: `#10B981`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...       <span style={{ color: '#10B981' }} className="mt-0.5">•</spa...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 757: `style={{ color: 'rgb`
  - *Pattern:* inline-style-color
  - *Context:* `...Name="text-xs font-bold mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>常见错误</h...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 757: `rgba(255,255,255,0.4)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...t-bold mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>常见错误</h4>...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 760: `style={{ color: 'rgb`
  - *Pattern:* inline-style-color
  - *Context:* `...ex items-start gap-2 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 760: `rgba(255,255,255,0.6)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...p-2 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 761: `style={{ color: '#`
  - *Pattern:* inline-style-color
  - *Context:* `...                        <span style={{ color: '#F59E0B' }} className="mt-0.5">...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 761: `#F59E0B`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...       <span style={{ color: '#F59E0B' }} className="mt-0.5">•</spa...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[MEDIUM]** Line 284: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...  <h2 className="text-lg font-black text-foreground">选择动作</h2>...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 414: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `... justify-center shrink-0 font-black text-sm`}>...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 531: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `... justify-center shrink-0 font-black text-sm`}>...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 617: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `... justify-center shrink-0 font-black text-sm`}>...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 677: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...<h2 className="text-base font-black text-foreground">创建新动作</h2>...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 718: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...<h2 className="text-base font-black text-foreground">动作详情</h2>...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 725: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `... justify-center shrink-0 font-black text-xl`}>...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 729: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...<h3 className="text-base font-black text-foreground">{selectedExe...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 771: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...r gap-2 rounded-2xl py-4 font-black text-sm text-accent-foregroun...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

### src\components\FloatingTimer.tsx

- **[HIGH]** Line 120: `#4b5563`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...    ? <Pause size={12} color="#4b5563" strokeWidth={2.5} />...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 127: `#4b5563`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...           color: isPaused ? '#4b5563' : 'var(--color-accent)',...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 140: `#f59e0b`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...      <Clock size={10} color="#f59e0b" strokeWidth={2.5} />...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 144: `#ef4444`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...     color: restSecs <= 10 ? '#ef4444' : '#f59e0b',...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 144: `#f59e0b`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...restSecs <= 10 ? '#ef4444' : '#f59e0b',...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 174: `style={{ fontSize: 10, color: '#`
  - *Pattern:* inline-style-color
  - *Context:* `...                <span style={{ fontSize: 10, color: '#4b5563', fontWeight: 600 }}>已暂...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 174: `#4b5563`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...tyle={{ fontSize: 10, color: '#4b5563', fontWeight: 600 }}>已暂停</spa...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 193: `rgba(0,0,0,0.5)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...                background: 'rgba(0,0,0,0.5)',...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 228: `#2d3748`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...           color: isPaused ? '#2d3748' : 'var(--color-accent)',...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 242: `style={{ fontSize: 13, color: '#`
  - *Pattern:* inline-style-color
  - *Context:* `...                  <div style={{ fontSize: 13, color: '#f59e0b', marginTop: 8, fontWei...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 242: `#f59e0b`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...tyle={{ fontSize: 13, color: '#f59e0b', marginTop: 8, fontWeight: 6...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 300: `style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: 'rgb`
  - *Pattern:* inline-style-color
  - *Context:* `...                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: 'rgba(239,68,68,0.15)' }}>...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 300: `rgba(239,68,68,0.15)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...fr 1fr', gap: 1, background: 'rgba(239,68,68,0.15)' }}>...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 306: `style={{ padding: '13px', border: 'none', background: 'var(--surface-2)', color: '#`
  - *Pattern:* inline-style-color
  - *Context:* `...                        style={{ padding: '13px', border: 'none', background: 'var(--surface-2)', color: '#60A5FA', fontSize: 14, fontWei...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 306: `#60A5FA`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...: 'var(--surface-2)', color: '#60A5FA', fontSize: 14, fontWeight: 7...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 317: `rgba(239,68,68,0.07)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...                 background: 'rgba(239,68,68,0.07)',...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 318: `#ef4444`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...                      color: '#ef4444',...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

### src\components\FoodSearch.tsx

- **[HIGH]** Line 486: `#4ADE80`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...cros.protein,  u: 'g',    c: '#4ADE80' },...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 487: `#22D3EE`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...cros.carbs,    u: 'g',    c: '#22D3EE' },...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 488: `#FB923C`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...cros.fat,      u: 'g',    c: '#FB923C' },...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 964: `rgba(255,255,255,0.4)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...--accent-text)' } : { color: 'rgba(255,255,255,0.4)' }}...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 971: `rgba(255,255,255,0.4)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...--accent-text)' } : { color: 'rgba(255,255,255,0.4)' }}...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[MEDIUM]** Line 492: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `... <div className="text-sm font-black" style={{ color: m.c }}>{m.v}...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

### src\components\OfflineStatusBar.tsx

- **[HIGH]** Line 45: `rgba(245,158,11,0.12)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...        bg: 'rgba(245,158,11,0.12)',...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 46: `rgba(245,158,11,0.30)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...        border: 'rgba(245,158,11,0.30)',...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 47: `#F59E0B`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...        color: '#F59E0B',...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 53: `rgba(34,197,94,0.10)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...          bg: 'rgba(34,197,94,0.10)',...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 54: `rgba(34,197,94,0.25)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...          border: 'rgba(34,197,94,0.25)',...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 55: `#22c55e`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...          color: '#22c55e',...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 60: `rgba(239,68,68,0.10)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...          bg: 'rgba(239,68,68,0.10)',...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 61: `rgba(239,68,68,0.25)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...          border: 'rgba(239,68,68,0.25)',...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 62: `#ef4444`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...          color: '#ef4444',...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

### src\components\OfflineToast.tsx

- **[HIGH]** Line 34: `#111`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...background: 'var(--surface-2, #111)',...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 44: `style={{ color: 'rgb`
  - *Pattern:* inline-style-color
  - *Context:* `...      <WifiOff size={15} style={{ color: 'rgb(var(--destructive))', flexShr...`
  - *Suggestion:* Use CSS variables via className or theme tokens

### src\components\PageSkeleton.tsx

- **[HIGH]** Line 6: `#000`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...        background: '#000',...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 12: `style={{ height: 28, width: 120, borderRadius: 8, background: 'rgb`
  - *Pattern:* inline-style-color
  - *Context:* `...      <div style={{ height: 28, width: 120, borderRadius: 8, background: 'rgba(255,255,255,0.08)', marginBo...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 12: `rgba(255,255,255,0.08)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...borderRadius: 8, background: 'rgba(255,255,255,0.08)', marginBottom: 24 }} />...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 21: `rgba(255,255,255,0.06)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...            background: 'rgba(255,255,255,0.06)',...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 31: `style={{ width: 44, height: 44, borderRadius: 12, background: 'rgb`
  - *Pattern:* inline-style-color
  - *Context:* `...          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.06)', flexShri...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 31: `rgba(255,255,255,0.06)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...orderRadius: 12, background: 'rgba(255,255,255,0.06)', flexShrink: 0 }} />...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 33: `style={{ height: 14, width: '60%', borderRadius: 6, background: 'rgb`
  - *Pattern:* inline-style-color
  - *Context:* `...            <div style={{ height: 14, width: '60%', borderRadius: 6, background: 'rgba(255,255,255,0.08)', marginBo...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 33: `rgba(255,255,255,0.08)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...borderRadius: 6, background: 'rgba(255,255,255,0.08)', marginBottom: 8 }} />...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 34: `style={{ height: 11, width: '40%', borderRadius: 6, background: 'rgb`
  - *Pattern:* inline-style-color
  - *Context:* `...            <div style={{ height: 11, width: '40%', borderRadius: 6, background: 'rgba(255,255,255,0.05)' }} />...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 34: `rgba(255,255,255,0.05)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...borderRadius: 6, background: 'rgba(255,255,255,0.05)' }} />...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

### src\components\PullToRefresh.tsx

- **[HIGH]** Line 106: `#CCFF00`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...>= threshold ? 'var(--accent, #CCFF00)' : 'var(--text-faint, #666)'...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 106: `#666`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...CCFF00)' : 'var(--text-faint, #666)',...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

### src\components\PWAInstallPrompt.tsx

- **[HIGH]** Line 138: `#111111`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...background: 'var(--surface-2, #111111)',...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 139: `rgba(204,255,0,0.25)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...        border: '1px solid rgba(204,255,0,0.25)',...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 141: `rgba(204,255,0,0.10)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...          '0 0 32px rgba(204,255,0,0.10), 0 16px 48px rgba(0,0,0,0.6)'...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 141: `rgba(0,0,0,0.6)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...(204,255,0,0.10), 0 16px 48px rgba(0,0,0,0.6)',...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 157: `rgba(204,255,0,0.08)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...          background: 'rgba(204,255,0,0.08)',...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 158: `rgba(204,255,0,0.2)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...          border: '1px solid rgba(204,255,0,0.2)',...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 164: `#CCFF00`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...          color: '#CCFF00',...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 178: `#fff`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...    color: 'var(--foreground, #fff)',...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 190: `rgba(255,255,255,0.45)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...color: 'var(--text-secondary, rgba(255,255,255,0.45))',...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 200: `style={{ color: '#`
  - *Pattern:* inline-style-color
  - *Context:* `...              style={{ color: '#007AFF', flexShrink: 0 }}...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 200: `#007AFF`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...             style={{ color: '#007AFF', flexShrink: 0 }}...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 209: `rgba(255,255,255,0.45)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...color: 'var(--text-secondary, rgba(255,255,255,0.45))',...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 225: `#CCFF00`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...            background: '#CCFF00',...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 226: `#000`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...            color: '#000',...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 250: `rgba(255,255,255,0.35)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...          color: 'rgba(255,255,255,0.35)',...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

### src\components\PWAUpdateBanner.tsx

- **[HIGH]** Line 55: `#111111`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...background: 'var(--surface-2, #111111)',...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 56: `rgba(204,255,0,0.25)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...        border: '1px solid rgba(204,255,0,0.25)',...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 58: `rgba(204,255,0,0.10)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...          '0 0 32px rgba(204,255,0,0.10), 0 16px 48px rgba(0,0,0,0.6)'...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 58: `rgba(0,0,0,0.6)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...(204,255,0,0.10), 0 16px 48px rgba(0,0,0,0.6)',...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 68: `style={{ color: '#`
  - *Pattern:* inline-style-color
  - *Context:* `...        style={{ color: '#CCFF00', flexShrink: 0 }}...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 68: `#CCFF00`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...        style={{ color: '#CCFF00', flexShrink: 0 }}...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 77: `#fff`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...    color: 'var(--foreground, #fff)',...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 85: `rgba(255,255,255,0.45)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...color: 'var(--text-secondary, rgba(255,255,255,0.45))',...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 104: `rgba(255,255,255,0.35)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...          color: 'rgba(255,255,255,0.35)',...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

### src\components\runtime-analytics\FatigueTrend.tsx

- **[HIGH]** Line 28: `style={{ height: (d.recovery / max * 100) + '%', background: '#`
  - *Pattern:* inline-style-color
  - *Context:* `... rounded-t-sm transition-all" style={{ height: (d.recovery / max * 100) + '%', background: '#34D399', opacity: 0.5 }} />...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 28: `#34D399`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...ax * 100) + '%', background: '#34D399', opacity: 0.5 }} />...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 29: `style={{ height: (d.fatigue / max * 100) + '%', background: '#`
  - *Pattern:* inline-style-color
  - *Context:* `... rounded-t-sm transition-all" style={{ height: (d.fatigue / max * 100) + '%', background: '#F87171', opacity: 0.5 }} />...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 29: `#F87171`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...ax * 100) + '%', background: '#F87171', opacity: 0.5 }} />...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 35: `style={{ background: '#`
  - *Pattern:* inline-style-color
  - *Context:* `...ssName="w-2 h-2 rounded-full" style={{ background: '#34D399', opacity: 0.5 }} />...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 35: `#34D399`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...d-full" style={{ background: '#34D399', opacity: 0.5 }} />...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 39: `style={{ background: '#`
  - *Pattern:* inline-style-color
  - *Context:* `...ssName="w-2 h-2 rounded-full" style={{ background: '#F87171', opacity: 0.5 }} />...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 39: `#F87171`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...d-full" style={{ background: '#F87171', opacity: 0.5 }} />...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

### src\components\runtime-home\AdaptiveCTA.tsx

- **[HIGH]** Line 22: `style={{ background: 'var(--accent)', color: '#`
  - *Pattern:* inline-style-color
  - *Context:* `...        style={{ background: 'var(--accent)', color: '#000', boxShadow: '0 0 28px var...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 22: `#000`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...und: 'var(--accent)', color: '#000', boxShadow: '0 0 28px var(--...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[MEDIUM]** Line 21: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...r gap-2 rounded-2xl py-5 font-black text-lg transition-all active...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

### src\components\runtime-ui\RuntimeCTA.tsx

- **[HIGH]** Line 17: `#000`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...{ background: accent, color: '#000', boxShadow: '0 0 28px ' + ac...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[MEDIUM]** Line 26: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...r gap-2 rounded-2xl py-5 font-black text-lg transition-all active...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

### src\components\runtime-ui\RuntimeProjection.tsx

- **[HIGH]** Line 15: `#34D399`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...  up: { color: '#34D399', arrow: '↑' },...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 16: `#F87171`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...  down: { color: '#F87171', arrow: '↓' },...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[MEDIUM]** Line 33: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...<span className="text-lg font-black tabular-nums">{value}</span>...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 35: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...<span className="text-xs font-black ml-auto" style={{ color: tm.c...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

### src\components\StreakCard.tsx

- **[HIGH]** Line 46: `#FF6B35`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...{ color: currentStreak > 0 ? '#FF6B35' : t.textFaint }}...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 51: `#FF6B35`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...{ color: currentStreak > 0 ? '#FF6B35' : t.textMuted }}...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 62: `style={{ background: 'rgb`
  - *Pattern:* inline-style-color
  - *Context:* `...            style={{ background: 'rgba(34,197,94,0.12)', border: '1...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 62: `rgba(34,197,94,0.12)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...        style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 62: `rgba(34,197,94,0.2)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...94,0.12)', border: '1px solid rgba(34,197,94,0.2)' }}...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 90: `#22c55e`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...                    ? '#22c55e'...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[MEDIUM]** Line 50: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...     className="text-2xl font-black tabular-nums leading-none"...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

### src\components\TodayWorkoutCard.tsx

- **[HIGH]** Line 50: `rgba(204,255,0,0.1)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `... '状态良好', dot: '#CCFF00', bg: 'rgba(204,255,0,0.1)' },...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 50: `#CCFF00`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...TRAIN: { label: '状态良好', dot: '#CCFF00', bg: 'rgba(204,255,0,0.1)' }...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 51: `rgba(245,158,11,0.1)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `... '注意疲劳', dot: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 51: `#F59E0B`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...       { label: '注意疲劳', dot: '#F59E0B', bg: 'rgba(245,158,11,0.1)' ...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 52: `rgba(34,197,94,0.1)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `... '充分恢复', dot: '#22c55e', bg: 'rgba(34,197,94,0.1)' },...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 52: `#22c55e`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...:      { label: '充分恢复', dot: '#22c55e', bg: 'rgba(34,197,94,0.1)' }...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 53: `rgba(96,165,250,0.1)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `... '今日休息', dot: '#60A5FA', bg: 'rgba(96,165,250,0.1)' },...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 53: `#60A5FA`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...       { label: '今日休息', dot: '#60A5FA', bg: 'rgba(96,165,250,0.1)' ...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 99: `rgba(34,197,94,0.25)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...t.surface, border: '1px solid rgba(34,197,94,0.25)' }}...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 104: `style={{ background: 'rgb`
  - *Pattern:* inline-style-color
  - *Context:* `...            style={{ background: 'rgba(34,197,94,0.12)' }}...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 104: `rgba(34,197,94,0.12)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...        style={{ background: 'rgba(34,197,94,0.12)' }}...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 119: `style={{ background: 'rgba(34,197,94,0.1)', color: '#`
  - *Pattern:* inline-style-color
  - *Context:* `...            style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rg...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 119: `rgba(34,197,94,0.1)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...        style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 119: `rgba(34,197,94,0.2)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...'#22c55e', border: '1px solid rgba(34,197,94,0.2)' }}...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 119: `#22c55e`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

### src\components\training-timeline\FatigueCycle.tsx

- **[HIGH]** Line 22: `style={{ height: (d.fatigue / max * 100) + '%', background: '#`
  - *Pattern:* inline-style-color
  - *Context:* `...assName="w-full rounded-t-sm" style={{ height: (d.fatigue / max * 100) + '%', background: '#F87171', opacity: 0.6 }} />...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 22: `#F87171`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...ax * 100) + '%', background: '#F87171', opacity: 0.6 }} />...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 23: `style={{ height: (d.recovery / max * 100) + '%', background: '#`
  - *Pattern:* inline-style-color
  - *Context:* `...assName="w-full rounded-t-sm" style={{ height: (d.recovery / max * 100) + '%', background: '#34D399', opacity: 0.6 }} />...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 23: `#34D399`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...ax * 100) + '%', background: '#34D399', opacity: 0.6 }} />...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

### src\components\workout\ActiveExerciseCard.tsx

- **[HIGH]** Line 277: `style={{ color: 'rgb`
  - *Pattern:* inline-style-color
  - *Context:* `...                  style={{ color: 'rgb(var(--accent))', animation: '...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 307: `style={{ background: 'rgb`
  - *Pattern:* inline-style-color
  - *Context:* `...            style={{ background: 'rgba(0,0,0,0.45)', backdropFilter...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 307: `rgba(0,0,0,0.45)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...        style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)'...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 330: `style={{ background: 'rgba(239,68,68,0.1)', color: '#`
  - *Pattern:* inline-style-color
  - *Context:* `...                  style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', touchAction: 'manipul...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 330: `rgba(239,68,68,0.1)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...        style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', touchActi...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 330: `#ef4444`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...rgba(239,68,68,0.1)', color: '#ef4444', touchAction: 'manipulation'...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 361: `rgba(248,113,113,0.1)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...kground: fatigueScore > 50 ? 'rgba(248,113,113,0.1)' : 'rgba(251,191,36,0.08)',...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 361: `rgba(251,191,36,0.08)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `... ? 'rgba(248,113,113,0.1)' : 'rgba(251,191,36,0.08)',...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 362: `#F87171`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...  color: fatigueScore > 50 ? '#F87171' : '#FBBF24',...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 362: `#FBBF24`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...igueScore > 50 ? '#F87171' : '#FBBF24',...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 483: `rgba(251,191,36,0.08)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...                 background: 'rgba(251,191,36,0.08)',...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 484: `rgba(251,191,36,0.2)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...           border: '1px solid rgba(251,191,36,0.2)',...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 488: `style={{ color: '#`
  - *Pattern:* inline-style-color
  - *Context:* `...lassName="text-xs font-black" style={{ color: '#fbbf24' }}>...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 488: `#fbbf24`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `... font-black" style={{ color: '#fbbf24' }}>...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[MEDIUM]** Line 276: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...      className="text-xs font-black"...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 285: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...    className="text-base font-black truncate"...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 317: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...           <p className="font-black text-base" style={{ color: 'v...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 352: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...    建议: <span className="font-black" style={{ color: 'var(--accen...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 404: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...        <span className="font-black tabular-nums" style={{ fontSi...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 435: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...              className="font-black tabular-nums leading-none tex...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 440: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...              className="font-black tabular-nums leading-none cur...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 488: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...<span className="text-xs font-black" style={{ color: '#fbbf24' }}...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 531: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...              className="font-black tabular-nums leading-none tex...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 536: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...              className="font-black tabular-nums leading-none cur...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 574: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...              className="font-black tabular-nums leading-none tex...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 579: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...              className="font-black tabular-nums leading-none cur...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 679: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `... <div className="text-sm font-black leading-none">{opt.value}</di...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 724: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...r gap-2 rounded-2xl py-4 font-black text-base transition-all acti...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 740: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...r gap-2 rounded-2xl py-4 font-black text-base transition-all acti...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

### src\components\workout\ChapterCompletionSurface.tsx

- **[HIGH]** Line 71: `rgba(0,0,0,0.88)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...        background: 'rgba(0,0,0,0.88)',...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 177: `style={{ color: '#`
  - *Pattern:* inline-style-color
  - *Context:* `...ingUp className="w-3.5 h-3.5" style={{ color: '#22c55e' }} />...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 177: `#22c55e`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...w-3.5 h-3.5" style={{ color: '#22c55e' }} />...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 181: `#22c55e`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...{ color: trend.deltaKg > 0 ? '#22c55e' : t.textFaint }}...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 208: `style={{ background: 'rgb`
  - *Pattern:* inline-style-color
  - *Context:* `...              style={{ background: 'rgba(204,255,0,0.04)', border: `1...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 208: `rgba(204,255,0,0.04)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...        style={{ background: 'rgba(204,255,0,0.04)', border: `1px solid rgba(204...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 208: `rgba(204,255,0,0.12)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...,0,0.04)', border: `1px solid rgba(204,255,0,0.12)` }}...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[MEDIUM]** Line 101: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...     className="text-2xl font-black leading-snug"...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 121: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `... <div className="text-lg font-black" style={{ color: t.text }}>...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 131: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `... <div className="text-lg font-black" style={{ color: t.text }}>...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

### src\components\workout\intelligence\ContextualTipPill.tsx

- **[HIGH]** Line 17: `rgba(239,68,68,0.08)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...ircle, color: '#ef4444', bg: 'rgba(239,68,68,0.08)' },...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 17: `#ef4444`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `... { icon: AlertCircle, color: '#ef4444', bg: 'rgba(239,68,68,0.08)' ...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

### src\components\workout\intelligence\FatigueBanner.tsx

- **[HIGH]** Line 16: `rgba(245,158,11,0.06)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `... Info, color: '#f59e0b', bg: 'rgba(245,158,11,0.06)' },...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 16: `#f59e0b`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...  mild: { icon: Info, color: '#f59e0b', bg: 'rgba(245,158,11,0.06)'...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 17: `rgba(245,158,11,0.08)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...ircle, color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 17: `#f59e0b`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `... { icon: AlertCircle, color: '#f59e0b', bg: 'rgba(245,158,11,0.08)'...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 18: `rgba(239,68,68,0.08)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...angle, color: '#ef4444', bg: 'rgba(239,68,68,0.08)' },...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 18: `#ef4444`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `... icon: AlertTriangle, color: '#ef4444', bg: 'rgba(239,68,68,0.08)' ...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

### src\components\workout\intelligence\InsightRow.tsx

- **[HIGH]** Line 16: `#fbbf24`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...tone: { icon: Trophy, color: '#fbbf24' },...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 18: `#ef4444`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...lity: { icon: Shield, color: '#ef4444' },...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 29: `rgba(239,68,68,0.06)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...  attention: { bg: 'rgba(239,68,68,0.06)' },...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

### src\components\workout\intelligence\IntelligenceFeed.tsx

- **[HIGH]** Line 9: `style={{ color: '#`
  - *Pattern:* inline-style-color
  - *Context:* `...ingUp className="w-3.5 h-3.5" style={{ color: '#34D399' }} />, bg: 'rgba(52,21...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 9: `rgba(52,211,153,0.08)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `... color: '#34D399' }} />, bg: 'rgba(52,211,153,0.08)' },...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 9: `#34D399`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...w-3.5 h-3.5" style={{ color: '#34D399' }} />, bg: 'rgba(52,211,153,...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 10: `style={{ color: '#`
  - *Pattern:* inline-style-color
  - *Context:* `...Minus className="w-3.5 h-3.5" style={{ color: '#FBBF24' }} />, bg: 'rgba(251,1...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 10: `rgba(251,191,36,0.08)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `... color: '#FBBF24' }} />, bg: 'rgba(251,191,36,0.08)' },...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 10: `#FBBF24`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...w-3.5 h-3.5" style={{ color: '#FBBF24' }} />, bg: 'rgba(251,191,36,...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 11: `style={{ color: '#`
  - *Pattern:* inline-style-color
  - *Context:* `...gDown className="w-3.5 h-3.5" style={{ color: '#F87171' }} />, bg: 'rgba(248,1...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 11: `rgba(248,113,113,0.08)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `... color: '#F87171' }} />, bg: 'rgba(248,113,113,0.08)' },...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 11: `#F87171`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...w-3.5 h-3.5" style={{ color: '#F87171' }} />, bg: 'rgba(248,113,113...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

### src\components\workout\intelligence\ProgressionBadge.tsx

- **[HIGH]** Line 19: `rgba(239,68,68,0.08)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...    bg: 'rgba(239,68,68,0.08)',...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 30: `#f59e0b`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...    color: '#f59e0b',...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 31: `rgba(245,158,11,0.08)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...    bg: 'rgba(245,158,11,0.08)',...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 36: `#ef4444`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...    color: '#ef4444',...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 37: `rgba(239,68,68,0.08)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...    bg: 'rgba(239,68,68,0.08)',...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

### src\components\workout\intelligence\WarmupCard.tsx

- **[HIGH]** Line 37: `style={{ color: '#`
  - *Pattern:* inline-style-color
  - *Context:* `...Flame className="w-3.5 h-3.5" style={{ color: '#f59e0b' }} />...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 37: `#f59e0b`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...w-3.5 h-3.5" style={{ color: '#f59e0b' }} />...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

### src\components\workout\intelligence\WorkoutIntelligenceLayer.tsx

- **[HIGH]** Line 39: `rgba(239,68,68,0.06)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...                    ? 'rgba(239,68,68,0.06)'...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

### src\components\workout\NumberPad.tsx

- **[HIGH]** Line 51: `rgba(0,0,0,0.3)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...er-border shadow-[0_-8px_32px_rgba(0,0,0,0.3)] sm:max-w-md sm:left-1/2 sm:-...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[MEDIUM]** Line 59: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...<span className="text-sm font-black tabular-nums">{value || '0'}<...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 96: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `... h-12 rounded-xl text-sm font-black transition-all active:scale-[...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

### src\components\workout\os\OSBadge.tsx

- **[HIGH]** Line 17: `rgba(245,158,11,0.08)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...ircle, color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 17: `#f59e0b`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `... { icon: AlertCircle, color: '#f59e0b', bg: 'rgba(245,158,11,0.08)'...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 18: `rgba(239,68,68,0.08)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...angle, color: '#ef4444', bg: 'rgba(239,68,68,0.08)' },...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 18: `#ef4444`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `... icon: AlertTriangle, color: '#ef4444', bg: 'rgba(239,68,68,0.08)' ...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

### src\components\workout\os\OSNarrativeBanner.tsx

- **[HIGH]** Line 18: `rgba(251,191,36,0.08)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...rophy, color: '#fbbf24', bg: 'rgba(251,191,36,0.08)' },...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 18: `#fbbf24`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...hant: { icon: Trophy, color: '#fbbf24', bg: 'rgba(251,191,36,0.08)'...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 19: `rgba(245,158,11,0.08)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...hield, color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 19: `#f59e0b`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...ious: { icon: Shield, color: '#f59e0b', bg: 'rgba(245,158,11,0.08)'...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

### src\components\workout\os\OSStatusLine.tsx

- **[HIGH]** Line 17: `#f59e0b`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...{ icon: Clock, defaultColor: '#f59e0b' },...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 24: `#f59e0b`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...  attention: '#f59e0b',...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 25: `#ef4444`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...  critical: '#ef4444',...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

### src\components\workout\os\OSSuggestionChip.tsx

- **[HIGH]** Line 18: `rgba(245,158,11,0.08)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...ircle, color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 18: `#f59e0b`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `... { icon: AlertCircle, color: '#f59e0b', bg: 'rgba(245,158,11,0.08)'...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 19: `rgba(239,68,68,0.08)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...ircle, color: '#ef4444', bg: 'rgba(239,68,68,0.08)' },...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 19: `#ef4444`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `... { icon: AlertCircle, color: '#ef4444', bg: 'rgba(239,68,68,0.08)' ...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

### src\components\workout\PRArchive.tsx

- **[HIGH]** Line 24: `#60A5FA`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...  weight: '#60A5FA',...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 25: `#34D399`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...  reps: '#34D399',...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 26: `#fbbf24`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...  volume: '#fbbf24',...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 35: `style={{ color: '#`
  - *Pattern:* inline-style-color
  - *Context:* `...rophy className="w-3.5 h-3.5" style={{ color: '#fbbf24' }} />...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 35: `#fbbf24`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...w-3.5 h-3.5" style={{ color: '#fbbf24' }} />...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

### src\components\workout\PRBadge.tsx

- **[HIGH]** Line 34: `rgba(251,191,36,0.08)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...        background: 'rgba(251,191,36,0.08)',...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 35: `rgba(251,191,36,0.2)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...        border: '1px solid rgba(251,191,36,0.2)',...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 38: `style={{ color: '#`
  - *Pattern:* inline-style-color
  - *Context:* `... className="w-4 h-4 shrink-0" style={{ color: '#fbbf24' }} />...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 38: `#fbbf24`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...-4 shrink-0" style={{ color: '#fbbf24' }} />...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 39: `style={{ color: '#`
  - *Pattern:* inline-style-color
  - *Context:* `...lassName="text-xs font-black" style={{ color: '#fbbf24' }}>...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 39: `#fbbf24`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `... font-black" style={{ color: '#fbbf24' }}>...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[MEDIUM]** Line 39: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...<span className="text-xs font-black" style={{ color: '#fbbf24' }}...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

### src\components\workout\RestBar.tsx

- **[HIGH]** Line 22: `#ef4444`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...const ringColor = isUrgent ? '#ef4444' : '#f59e0b';...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 22: `#f59e0b`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...lor = isUrgent ? '#ef4444' : '#f59e0b';...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 38: `rgba(0,0,0,0.15)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...      boxShadow: `0 -4px 20px rgba(0,0,0,0.15)`,...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[MEDIUM]** Line 52: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...        <span className="font-black tabular-nums z-10" style={{ f...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

### src\components\workout\RestOverlay.tsx

- **[HIGH]** Line 88: `rgba(255,255,255,0.06)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...            stroke="rgba(255,255,255,0.06)" />...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[MEDIUM]** Line 52: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...        <span className="font-black ml-1" style={{ color: 'var(--...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 63: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...        <span className="font-black ml-1" style={{ color: 'var(--...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 99: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...            className="font-black tabular-nums leading-none"...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

### src\components\workout\RestTimerPill.tsx

- **[HIGH]** Line 51: `#ef4444`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `... const barColor = isUrgent ? '#ef4444' : '#f59e0b';...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 51: `#f59e0b`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...lor = isUrgent ? '#ef4444' : '#f59e0b';...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 61: `rgba(239,68,68,0.25)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...der: `1px solid ${isUrgent ? 'rgba(239,68,68,0.25)' : 'var(--border)'}`,...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 62: `rgba(239,68,68,0.12)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...xShadow: isUrgent ? '0 0 20px rgba(239,68,68,0.12)' : '0 4px 16px rgba(0,0,0,0.1...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 62: `rgba(0,0,0,0.15)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...39,68,68,0.12)' : '0 4px 16px rgba(0,0,0,0.15)',...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 68: `style={{ background: 'rgb`
  - *Pattern:* inline-style-color
  - *Context:* `...rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 68: `rgba(255,255,255,0.06)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 81: `#ef4444`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...  style={{ color: isUrgent ? '#ef4444' : 'var(--text-low)' }}...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[MEDIUM]** Line 86: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...      className="text-lg font-black tabular-nums leading-none"...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

### src\components\workout\runtime-surface\ActiveSetSurface.tsx

- **[HIGH]** Line 122: `#000`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...    color: rir === m.value ? '#000' : 'var(--rvl-text-faint)',...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[MEDIUM]** Line 65: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...-36 text-center text-6xl font-black bg-transparent outline-none t...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 98: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...-36 text-center text-6xl font-black bg-transparent outline-none t...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

### src\components\workout\runtime-surface\CompletionSurface.tsx

- **[HIGH]** Line 22: `#FFA500`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...(135deg, var(--rvl-complete), #FFA500)' }}...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 24: `style={{ color: '#`
  - *Pattern:* inline-style-color
  - *Context:* `...<Trophy className="w-12 h-12" style={{ color: '#000' }} />...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 24: `#000`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...="w-12 h-12" style={{ color: '#000' }} />...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 53: `style={{ background: 'linear-gradient(135deg, var(--rvl-complete), #FFA500)', color: '#`
  - *Pattern:* inline-style-color
  - *Context:* `...          style={{ background: 'linear-gradient(135deg, var(--rvl-complete), #FFA500)', color: '#000', boxShadow: '0 0 32px var...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 53: `#FFA500`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...(135deg, var(--rvl-complete), #FFA500)', color: '#000', boxShadow: ...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 53: `#000`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...complete), #FFA500)', color: '#000', boxShadow: '0 0 32px var(--...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[MEDIUM]** Line 33: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...  <p className="text-2xl font-black tabular-nums" style={{ color:...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 38: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...  <p className="text-2xl font-black tabular-nums" style={{ color:...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 52: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...r gap-2 rounded-2xl py-5 font-black text-lg transition-all active...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

### src\components\workout\runtime-surface\RestSurface.tsx

- **[HIGH]** Line 35: `rgba(0,229,204,0.08)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...und: 'radial-gradient(circle, rgba(0,229,204,0.08) 0%, transparent 70%)',...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 36: `rgba(0,229,204,0.15)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...           border: '1px solid rgba(0,229,204,0.15)',...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 48: `rgba(255,255,255,0.05)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...rvl-rest-glow), inset 0 1px 0 rgba(255,255,255,0.05)',...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

### src\components\workout\runtime-surface\RuntimeActionBar.tsx

- **[HIGH]** Line 33: `#7CDD00`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...nt(135deg, var(--rvl-active), #7CDD00)',...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 34: `#000`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...          color: '#000',...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 36: `rgba(255,255,255,0.3)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...l-active-glow), inset 0 1px 0 rgba(255,255,255,0.3)',...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[MEDIUM]** Line 31: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...r gap-2 rounded-2xl py-5 font-black text-lg transition-all active...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

### src\components\workout\runtime-surface\RuntimeHeader.tsx

- **[HIGH]** Line 37: `style={{ background: 'var(--rvl-active)', color: '#`
  - *Pattern:* inline-style-color
  - *Context:* `...          style={{ background: 'var(--rvl-active)', color: '#000' }}...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 37: `#000`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `... 'var(--rvl-active)', color: '#000' }}...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[MEDIUM]** Line 36: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `... py-2 rounded-xl text-xs font-black transition-all"...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

### src\components\workout\runtime-surface\TransitionSurface.tsx

- **[HIGH]** Line 15: `rgba(52,211,153,0.08)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...ingUp, color: '#34D399', bg: 'rgba(52,211,153,0.08)' },...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 15: `#34D399`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...: { icon: TrendingUp, color: '#34D399', bg: 'rgba(52,211,153,0.08)'...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 16: `rgba(251,191,36,0.08)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...Minus, color: '#FBBF24', bg: 'rgba(251,191,36,0.08)' },...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 16: `#FBBF24`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...ntain: { icon: Minus, color: '#FBBF24', bg: 'rgba(251,191,36,0.08)'...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 17: `rgba(248,113,113,0.08)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...gDown, color: '#F87171', bg: 'rgba(248,113,113,0.08)' },...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 17: `#F87171`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...{ icon: TrendingDown, color: '#F87171', bg: 'rgba(248,113,113,0.08)...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

### src\components\workout\SessionRecoveryDialog.tsx

- **[HIGH]** Line 49: `style={{ background: 'rgb`
  - *Pattern:* inline-style-color
  - *Context:* `...      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 49: `rgba(0,0,0,0.75)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)'...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 57: `rgba(0,0,0,0.4)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...er)', boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[MEDIUM]** Line 68: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...<h2 className="text-base font-black" style={{ color: 'var(--text-...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 84: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...<span className="text-lg font-black" style={{ color: 'var(--text-...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 91: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...<span className="text-lg font-black" style={{ color: 'var(--text-...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 99: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...<span className="text-lg font-black tabular-nums" style={{ color:...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

### src\components\workout\SetRow.tsx

- **[HIGH]** Line 34: `rgba(96,165,250,0.06)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...          ? 'rgba(96,165,250,0.06)'...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 36: `rgba(251,191,36,0.06)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...            ? 'rgba(251,191,36,0.06)'...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 38: `rgba(96,165,250,0.12)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...der: `1px solid ${isWarmup ? 'rgba(96,165,250,0.12)' : isPR ? 'rgba(251,191,36,0....`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 38: `rgba(251,191,36,0.15)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...a(96,165,250,0.12)' : isPR ? 'rgba(251,191,36,0.15)' : 'var(--border)'}`,...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 48: `rgba(96,165,250,0.12)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...            ? 'rgba(96,165,250,0.12)'...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 50: `rgba(251,191,36,0.12)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...              ? 'rgba(251,191,36,0.12)'...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 56: `#60A5FA`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...  style={{ color: isWarmup ? '#60A5FA' : isPR ? '#fbbf24' : 'var(--...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 56: `#fbbf24`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...sWarmup ? '#60A5FA' : isPR ? '#fbbf24' : 'var(--text-low)' }}...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 65: `style={{ color: '#`
  - *Pattern:* inline-style-color
  - *Context:* `...className="text-xs font-bold" style={{ color: '#60A5FA' }}>...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 65: `#60A5FA`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...s font-bold" style={{ color: '#60A5FA' }}>...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 83: `style={{ color: '#`
  - *Pattern:* inline-style-color
  - *Context:* `... className="w-3 h-3 shrink-0" style={{ color: '#ef4444' }} />...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 83: `#ef4444`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...-3 shrink-0" style={{ color: '#ef4444' }} />...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 90: `style={{ background: 'rgba(251,191,36,0.12)', color: '#`
  - *Pattern:* inline-style-color
  - *Context:* `...ack px-1.5 py-0.5 rounded-md" style={{ background: 'rgba(251,191,36,0.12)', color: '#fbbf24' }}>...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 90: `rgba(251,191,36,0.12)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...ded-md" style={{ background: 'rgba(251,191,36,0.12)', color: '#fbbf24' }}>...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 90: `#fbbf24`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...ba(251,191,36,0.12)', color: '#fbbf24' }}>...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[MEDIUM]** Line 55: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...  className="text-[10px] font-black"...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 90: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...nter gap-0.5 text-[10px] font-black px-1.5 py-0.5 rounded-md" sty...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

### src\components\workout\ShareWorkoutCard.tsx

- **[HIGH]** Line 67: `style={{ background: 'rgb`
  - *Pattern:* inline-style-color
  - *Context:* `...      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter:...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 67: `rgba(0,0,0,0.7)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)'...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 78: `rgba(0,0,0,0.4)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...      boxShadow: '0 24px 80px rgba(0,0,0,0.4)',...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 115: `style={{ color: '#`
  - *Pattern:* inline-style-color
  - *Context:* `...rophy className="w-3.5 h-3.5" style={{ color: '#fbbf24' }} />...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 115: `#fbbf24`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...w-3.5 h-3.5" style={{ color: '#fbbf24' }} />...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 116: `style={{ color: '#`
  - *Pattern:* inline-style-color
  - *Context:* `...sName="text-xs font-semibold" style={{ color: '#fbbf24' }}>{prCount} PR</span>...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 116: `#fbbf24`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...nt-semibold" style={{ color: '#fbbf24' }}>{prCount} PR</span>...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[MEDIUM]** Line 83: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...  <h3 className="text-sm font-black" style={{ color: 'var(--text-...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

### src\components\workout\TrainingStatusBar.tsx

- **[HIGH]** Line 36: `rgba(251,191,36,0.08)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...          ? 'rgba(251,191,36,0.08)'...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 38: `rgba(251,191,36,0.15)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...er: `1px solid ${isResting ? 'rgba(251,191,36,0.15)' : 'var(--border)'}`,...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 76: `style={{ color: '#`
  - *Pattern:* inline-style-color
  - *Context:* `... className="w-3 h-3 shrink-0" style={{ color: '#fbbf24' }} />...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 76: `#fbbf24`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...-3 shrink-0" style={{ color: '#fbbf24' }} />...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 77: `style={{ color: '#`
  - *Pattern:* inline-style-color
  - *Context:* `...t-xs font-black tabular-nums" style={{ color: '#fbbf24' }}>...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 77: `#fbbf24`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...abular-nums" style={{ color: '#fbbf24' }}>...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[MEDIUM]** Line 45: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...<span className="text-xs font-black tabular-nums" style={{ color:...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 55: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...<span className="text-xs font-black tabular-nums" style={{ color:...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 66: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...<span className="text-xs font-black tabular-nums" style={{ color:...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 77: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...<span className="text-xs font-black tabular-nums" style={{ color:...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

### src\components\workout\WarmupCard.tsx

- **[HIGH]** Line 50: `style={{ background: 'rgb`
  - *Pattern:* inline-style-color
  - *Context:* `...      style={{ background: 'rgba(96,165,250,0.04)', border: '...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 50: `rgba(96,165,250,0.04)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...      style={{ background: 'rgba(96,165,250,0.04)', border: '1px solid rgba(96,...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 50: `rgba(96,165,250,0.12)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...50,0.04)', border: '1px solid rgba(96,165,250,0.12)' }}...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 58: `style={{ color: '#`
  - *Pattern:* inline-style-color
  - *Context:* `...Flame className="w-3.5 h-3.5" style={{ color: '#60A5FA' }} />...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 58: `#60A5FA`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...w-3.5 h-3.5" style={{ color: '#60A5FA' }} />...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 59: `style={{ color: '#`
  - *Pattern:* inline-style-color
  - *Context:* `...className="text-xs font-bold" style={{ color: '#60A5FA' }}>热身建议</span>...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 59: `#60A5FA`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...s font-bold" style={{ color: '#60A5FA' }}>热身建议</span>...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 60: `style={{ background: 'rgba(96,165,250,0.08)', color: '#`
  - *Pattern:* inline-style-color
  - *Context:* `...old px-1.5 py-0.5 rounded-md" style={{ background: 'rgba(96,165,250,0.08)', color: '#60A5FA' }}>...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 60: `rgba(96,165,250,0.08)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...ded-md" style={{ background: 'rgba(96,165,250,0.08)', color: '#60A5FA' }}>...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 60: `#60A5FA`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...ba(96,165,250,0.08)', color: '#60A5FA' }}>...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 66: `style={{ color: '#`
  - *Pattern:* inline-style-color
  - *Context:* `...          style={{ color: '#60A5FA', transform: collapsed ...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 66: `#60A5FA`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...          style={{ color: '#60A5FA', transform: collapsed ? 'rot...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 79: `rgba(52,211,153,0.08)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...       background: done[i] ? 'rgba(52,211,153,0.08)' : 'var(--surface-2)',...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 80: `rgba(52,211,153,0.15)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...rder: `1px solid ${done[i] ? 'rgba(52,211,153,0.15)' : 'var(--border)'}`,...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 85: `#34D399`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...d" style={{ color: done[i] ? '#34D399' : 'var(--text-med)' }}>...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 89: `style={{ color: '#`
  - *Pattern:* inline-style-color
  - *Context:* `...Check className="w-3.5 h-3.5" style={{ color: '#34D399' }} />...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 89: `#34D399`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...w-3.5 h-3.5" style={{ color: '#34D399' }} />...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 91: `style={{ background: 'rgba(96,165,250,0.08)', color: '#`
  - *Pattern:* inline-style-color
  - *Context:* `...ibold px-2 py-0.5 rounded-md" style={{ background: 'rgba(96,165,250,0.08)', color: '#60A5FA' }}>...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 91: `rgba(96,165,250,0.08)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...ded-md" style={{ background: 'rgba(96,165,250,0.08)', color: '#60A5FA' }}>...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 91: `#60A5FA`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...ba(96,165,250,0.08)', color: '#60A5FA' }}>...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

### src\components\workout\WorkoutCompletionCard.tsx

- **[HIGH]** Line 59: `style={{ background: 'rgb`
  - *Pattern:* inline-style-color
  - *Context:* `...      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 59: `rgba(0,0,0,0.85)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 70: `rgba(0,0,0,0.5)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...      boxShadow: '0 24px 80px rgba(0,0,0,0.5)',...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 128: `style={{ color: '#`
  - *Pattern:* inline-style-color
  - *Context:* `...  <Trophy className="w-4 h-4" style={{ color: '#fbbf24' }} />...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 128: `#fbbf24`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...me="w-4 h-4" style={{ color: '#fbbf24' }} />...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 129: `style={{ color: '#`
  - *Pattern:* inline-style-color
  - *Context:* `...t-lg font-black tabular-nums" style={{ color: '#fbbf24' }}>...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 129: `#fbbf24`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...abular-nums" style={{ color: '#fbbf24' }}>...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[MEDIUM]** Line 84: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...  <h2 className="text-xl font-black" style={{ color: 'var(--text-...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 99: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...<span className="text-lg font-black tabular-nums" style={{ color:...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 109: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...<span className="text-lg font-black tabular-nums" style={{ color:...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 119: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...<span className="text-lg font-black tabular-nums" style={{ color:...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 129: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...<span className="text-lg font-black tabular-nums" style={{ color:...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

### src\components\WorkoutMonthCalendar.tsx

- **[HIGH]** Line 29: `#60A5FA`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...  chest: "#60A5FA", back: "#A78BFA", legs: "#34...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 29: `#A78BFA`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...  chest: "#60A5FA", back: "#A78BFA", legs: "#34D399",...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 29: `#34D399`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...5FA", back: "#A78BFA", legs: "#34D399",...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 30: `#FBBF24`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...  shoulders: "#FBBF24", arms: "#F87171",...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 30: `#F87171`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `... shoulders: "#FBBF24", arms: "#F87171",...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 35: `#FB923C`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...const CARDIO_COLOR = "#FB923C"...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 39: `#60A5FA`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...  ["#60A5FA", "胸"], ["#A78BFA", "背"], ["#...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 39: `#A78BFA`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...  ["#60A5FA", "胸"], ["#A78BFA", "背"], ["#34D399", "腿"],...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 39: `#34D399`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...A", "胸"], ["#A78BFA", "背"], ["#34D399", "腿"],...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 40: `#FBBF24`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...  ["#FBBF24", "肩"], ["#F87171", "臂"],...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 40: `#F87171`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...  ["#FBBF24", "肩"], ["#F87171", "臂"],...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 130: `#888`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...ots.push(MUSCLE_COLOR[mg] || "#888"))...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 208: `style={{ fontSize: 10, background: "rgb`
  - *Pattern:* inline-style-color
  - *Context:* `...                    style={{ fontSize: 10, background: "rgba(251,146,60,0.15)", color: CA...`
  - *Suggestion:* Use CSS variables via className or theme tokens

- **[HIGH]** Line 208: `rgba(251,146,60,0.15)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...{{ fontSize: 10, background: "rgba(251,146,60,0.15)", color: CARDIO_COLOR }}>...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[MEDIUM]** Line 94: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...<span className="text-sm font-black">{year}年{month}月</span>...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

### src\features\workout-runtime\ui\components\ExerciseRuntimeCard.tsx

- **[HIGH]** Line 439: `rgba(184,255,43,0.04)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...xShadow: isActive ? "0 0 20px rgba(184,255,43,0.04)" : "none",...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[MEDIUM]** Line 28: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...    className="text-base font-black leading-tight"...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 151: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...-20 text-center text-2xl font-black bg-transparent outline-none t...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 189: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...-16 text-center text-2xl font-black bg-transparent outline-none t...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 248: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...      className="text-xs font-black tabular-nums w-6 text-center ...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 471: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...      className="text-xs font-black tabular-nums"...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

### src\features\workout-runtime\ui\components\RuntimeBottomDock.tsx

- **[HIGH]** Line 27: `#000`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...          color: accent ? "#000" : "var(--rvl-text-med)",...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 52: `#7CDD00`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...nt(135deg, var(--rvl-active), #7CDD00)",...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 53: `#000`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...        color: "#000",...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 54: `rgba(255,255,255,0.3)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...l-active-glow), inset 0 1px 0 rgba(255,255,255,0.3)",...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 118: `rgba(8,8,10,0.95)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...     "linear-gradient(to top, rgba(8,8,10,0.95) 0%, rgba(8,8,10,0.7) 60%, tra...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 118: `rgba(8,8,10,0.7)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...to top, rgba(8,8,10,0.95) 0%, rgba(8,8,10,0.7) 60%, transparent 100%)",...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[MEDIUM]** Line 50: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `... rounded-2xl py-3.5 px-4 font-black text-sm runtime-tap"...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

### src\features\workout-runtime\ui\shells\WorkoutInstantShell.tsx

- **[HIGH]** Line 29: `rgba(184,255,43,0.04)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...t(ellipse 80% 50% at 50% 30%, rgba(184,255,43,0.04) 0%, transparent 70%), linear-...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 29: `#0C0C0E`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...70%), linear-gradient(180deg, #0C0C0E 0%, #08080A 100%)",...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 29: `#08080A`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...-gradient(180deg, #0C0C0E 0%, #08080A 100%)",...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 68: `rgba(8,8,10,0.95)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...und: "linear-gradient(to top, rgba(8,8,10,0.95) 0%, rgba(8,8,10,0.7) 60%, tra...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 68: `rgba(8,8,10,0.7)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...to top, rgba(8,8,10,0.95) 0%, rgba(8,8,10,0.7) 60%, transparent 100%)",...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

### src\features\workout-runtime\ui\shells\WorkoutRuntimeShell.tsx

- **[HIGH]** Line 167: `#7CDD00`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...nt(135deg, var(--rvl-active), #7CDD00)",...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 168: `#000`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...          color: "#000",...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 169: `rgba(255,255,255,0.3)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...l-active-glow), inset 0 1px 0 rgba(255,255,255,0.3)",...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[MEDIUM]** Line 157: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `... <p className="text-base font-black mb-2" style={{ color: "var(--...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 165: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...ax-w-xs py-4 rounded-2xl font-black text-base runtime-tap"...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

### src\lib\emotional-runtime\identity\buildIdentitySurface.ts

- **[HIGH]** Line 8: `rgba(34,197,94,0.15)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...  '高稳定性':      'rgba(34,197,94,0.15)',...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 9: `rgba(204,255,0,0.12)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...  '渐进超负荷':    'rgba(204,255,0,0.12)',...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 10: `rgba(96,165,250,0.12)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...  '复合动作为主':  'rgba(96,165,250,0.12)',...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 11: `rgba(167,139,250,0.12)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...  '注重恢复':      'rgba(167,139,250,0.12)',...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 12: `rgba(251,191,36,0.12)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...  '高效简练':      'rgba(251,191,36,0.12)',...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 13: `rgba(239,68,68,0.12)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...  '力量导向':      'rgba(239,68,68,0.12)',...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 25: `rgba(148,163,184,0.12)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...olor: TRAIT_COLORS[label] ?? 'rgba(148,163,184,0.12)',...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

### src\lib\emotional-runtime\momentum\detectMomentumState.ts

- **[HIGH]** Line 11: `rgba(204,255,0,0.1)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...'上升期', color: '#CCFF00', bg: 'rgba(204,255,0,0.1)' };...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 11: `#CCFF00`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...eturn { label: '上升期', color: '#CCFF00', bg: 'rgba(204,255,0,0.1)' }...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 13: `rgba(34,197,94,0.1)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...稳定节奏', color: '#22c55e', bg: 'rgba(34,197,94,0.1)' };...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 13: `#22c55e`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...turn { label: '稳定节奏', color: '#22c55e', bg: 'rgba(34,197,94,0.1)' }...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 15: `rgba(245,158,11,0.1)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...注意恢复', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' };...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 15: `#F59E0B`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...turn { label: '注意恢复', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' ...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 17: `rgba(96,165,250,0.1)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...'恢复中', color: '#60A5FA', bg: 'rgba(96,165,250,0.1)' };...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 17: `#60A5FA`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...eturn { label: '恢复中', color: '#60A5FA', bg: 'rgba(96,165,250,0.1)' ...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 19: `rgba(167,139,250,0.1)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...重新开始', color: '#A78BFA', bg: 'rgba(167,139,250,0.1)' };...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 19: `#A78BFA`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...turn { label: '重新开始', color: '#A78BFA', bg: 'rgba(167,139,250,0.1)'...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 21: `rgba(148,163,184,0.1)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...建立节奏', color: '#94a3b8', bg: 'rgba(148,163,184,0.1)' };...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 21: `#94a3b8`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...turn { label: '建立节奏', color: '#94a3b8', bg: 'rgba(148,163,184,0.1)'...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

### src\lib\exercise-constants.ts

- **[HIGH]** Line 41: `#FF6B6B`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...border-red-500/40',     hex: '#FF6B6B' },...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 42: `#FBBF24`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...border-amber-500/40',   hex: '#FBBF24' },...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 43: `#FB923C`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...border-orange-500/40',  hex: '#FB923C' },...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 44: `#FDE047`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...border-yellow-500/40',  hex: '#FDE047' },...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 45: `#A3E635`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...border-lime-500/40',    hex: '#A3E635' },...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 46: `#22D3EE`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...border-cyan-500/40',    hex: '#22D3EE' },...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 47: `#94A3B8`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...er:border-border/40',   hex: '#94A3B8' },...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 48: `#60A5FA`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...border-blue-500/40',    hex: '#60A5FA' },...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 49: `#818CF8`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...border-indigo-500/40',  hex: '#818CF8' },...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 50: `#A78BFA`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...border-violet-500/40',  hex: '#A78BFA' },...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 51: `#F472B6`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...border-pink-500/40',    hex: '#F472B6' },...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 52: `#C084FC`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...border-purple-500/40',  hex: '#C084FC' },...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 53: `#E879F9`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...border-fuchsia-500/40', hex: '#E879F9' },...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 54: `#FB7185`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...border-rose-500/40',    hex: '#FB7185' },...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 55: `#2DD4BF`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...border-teal-500/40',    hex: '#2DD4BF' },...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 56: `#34D399`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...border-emerald-500/40', hex: '#34D399' },...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 57: `#4ADE80`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...border-green-500/40',   hex: '#4ADE80' },...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 78: `#FF6B6B`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...ext: 'text-red-400',    hex: '#FF6B6B' },...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 79: `#2DD4BF`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...ext: 'text-teal-400',   hex: '#2DD4BF' },...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 80: `#FB923C`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...ext: 'text-orange-400', hex: '#FB923C' },...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 81: `#FBBF24`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...ext: 'text-amber-400',  hex: '#FBBF24' },...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 82: `#60A5FA`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...ext: 'text-blue-400',   hex: '#60A5FA' },...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 83: `#C084FC`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...ext: 'text-purple-400', hex: '#C084FC' },...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 84: `#4ADE80`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...ext: 'text-green-400',  hex: '#4ADE80' },...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 125: `#71717A`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...over:border-border/40', hex: '#71717A' };...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

### src\lib\workout-runtime\motion\buildRestPulse.ts

- **[HIGH]** Line 33: `#22c55e`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...      ringColor: '#22c55e',...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 45: `#ef4444`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...      ringColor: '#ef4444',...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 58: `#f59e0b`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...      ringColor: '#f59e0b',...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 70: `rgba(255,255,255,0.5)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...    ringColor: 'rgba(255,255,255,0.5)',...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

### src\styles\runtime-visual-language.css

- **[HIGH]** Line 28: `#B8FF2B`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...  --rvl-active: #B8FF2B;...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 29: `rgba(184, 255, 43, 0.08)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...  --rvl-active-dim: rgba(184, 255, 43, 0.08);...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 30: `rgba(184, 255, 43, 0.18)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...  --rvl-active-glow: rgba(184, 255, 43, 0.18);...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 33: `#00E5CC`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...  --rvl-rest: #00E5CC;...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 34: `rgba(0, 229, 204, 0.08)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...  --rvl-rest-dim: rgba(0, 229, 204, 0.08);...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 35: `rgba(0, 229, 204, 0.18)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...  --rvl-rest-glow: rgba(0, 229, 204, 0.18);...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 38: `#FF9940`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...  --rvl-fatigue: #FF9940;...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 39: `rgba(255, 153, 64, 0.08)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...  --rvl-fatigue-dim: rgba(255, 153, 64, 0.08);...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 40: `rgba(255, 153, 64, 0.18)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...  --rvl-fatigue-glow: rgba(255, 153, 64, 0.18);...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 43: `#FFD700`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...  --rvl-complete: #FFD700;...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 44: `rgba(255, 215, 0, 0.08)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...  --rvl-complete-dim: rgba(255, 215, 0, 0.08);...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 45: `rgba(255, 215, 0, 0.20)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...  --rvl-complete-glow: rgba(255, 215, 0, 0.20);...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 48: `#8B5CF6`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...  --rvl-transition: #8B5CF6;...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 49: `rgba(139, 92, 246, 0.08)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...  --rvl-transition-dim: rgba(139, 92, 246, 0.08);...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 50: `rgba(139, 92, 246, 0.18)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...  --rvl-transition-glow: rgba(139, 92, 246, 0.18);...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 53: `#B8FF2B`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...  --rvl-accent: #B8FF2B;...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 89: `rgba(184, 255, 43, 0.06)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...t(ellipse 80% 50% at 50% 30%, rgba(184, 255, 43, 0.06) 0%, transparent 70%),...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 94: `rgba(0, 229, 204, 0.05)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...t(ellipse 80% 50% at 50% 30%, rgba(0, 229, 204, 0.05) 0%, transparent 70%),...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 99: `rgba(255, 153, 64, 0.05)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...t(ellipse 80% 50% at 50% 30%, rgba(255, 153, 64, 0.05) 0%, transparent 70%),...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 104: `rgba(255, 215, 0, 0.06)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...t(ellipse 80% 50% at 50% 30%, rgba(255, 215, 0, 0.06) 0%, transparent 70%),...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 136: `rgba(184, 255, 43, 0.06)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...(--rvl-active-glow), 0 0 80px rgba(184, 255, 43, 0.06), inset 0 1px 0 rgb(var(--fore...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 140: `rgba(0, 229, 204, 0.05)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...ar(--rvl-rest-glow), 0 0 80px rgba(0, 229, 204, 0.05), inset 0 1px 0 rgb(var(--fore...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 144: `rgba(255, 153, 64, 0.05)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...--rvl-fatigue-glow), 0 0 80px rgba(255, 153, 64, 0.05), inset 0 1px 0 rgb(var(--fore...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 148: `rgba(255, 215, 0, 0.06)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...-rvl-complete-glow), 0 0 80px rgba(255, 215, 0, 0.06), inset 0 1px 0 rgb(var(--fore...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 152: `rgba(184, 255, 43, 0.10)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...e-glow)) drop-shadow(0 0 24px rgba(184, 255, 43, 0.10));...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 156: `rgba(0, 229, 204, 0.08)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...t-glow)) drop-shadow(0 0 24px rgba(0, 229, 204, 0.08));...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 200: `rgba(184, 255, 43, 0.08)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...(--rvl-active-glow), 0 0 80px rgba(184, 255, 43, 0.08); }...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 205: `rgba(0, 229, 204, 0.06)`
  - *Pattern:* css-hardcoded-rgba
  - *Context:* `...ar(--rvl-rest-glow), 0 0 80px rgba(0, 229, 204, 0.06); }...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

- **[HIGH]** Line 240: `#7CDD00`
  - *Pattern:* css-hardcoded-hex
  - *Context:* `...nt(135deg, var(--rvl-active), #7CDD00);...`
  - *Suggestion:* Use CSS custom properties or semantic tokens

### src\app\analytics\page.tsx

- **[MEDIUM]** Line 196: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...ms-center justify-center font-black text-sm shrink-0"...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 205: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...         <div className="font-black text-sm" style={{ color: 'var...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

### src\app\diet-analysis\_components\DietAiHeavy.tsx

- **[MEDIUM]** Line 69: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...<span className="text-lg font-black" style={{ color }}>{score}</s...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 287: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `... <div className="text-sm font-black text-primary">{m.value}<span ...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 399: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...span className="text-2xl font-black" style={{ color: scoreColor }...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

### src\app\diet-analysis\_components\DietClient.tsx

- **[MEDIUM]** Line 51: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...<span className="text-lg font-black text-primary">...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

### src\app\diet-analysis\_components\QuickStats.tsx

- **[MEDIUM]** Line 27: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...<div className={`text-xl font-black ${s.colorClass}`}>...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

### src\app\exercise\[id]\page.tsx

- **[MEDIUM]** Line 93: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...  <h1 className="text-lg font-black truncate">...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 113: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...pan className="text-base font-black tabular-nums">{data.prs.maxWe...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 119: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...pan className="text-base font-black tabular-nums">{data.prs.maxRe...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 126: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...pan className="text-base font-black tabular-nums">...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

### src\app\goals\page.tsx

- **[MEDIUM]** Line 163: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...<div className="text-2xl font-black text-primary">{weeklyProgress...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 167: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...<div className="text-2xl font-black text-primary/70">...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 173: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...<div className="text-2xl font-black text-primary">...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

### src\app\profile\_components\IdentityCard.tsx

- **[MEDIUM]** Line 24: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `... justify-center text-2xl font-black overflow-hidden shrink-0"...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 39: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...  <h2 className="text-lg font-black truncate">{name || "健身爱好者"}</...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

### src\app\profile\_components\MetricCard.tsx

- **[MEDIUM]** Line 35: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `... className="mt-2 text-lg font-black tracking-tight" style={{ colo...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

### src\app\profile\edit\page.tsx

- **[MEDIUM]** Line 229: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `... justify-center text-4xl font-black mb-4 overflow-hidden cursor-p...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 239: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...span className="text-4xl font-black" style={{ color: 'var(--accen...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

### src\app\profile\page.tsx

- **[MEDIUM]** Line 107: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `... justify-center text-2xl font-black overflow-hidden shrink-0 bg-p...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 115: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...  <h2 className="text-lg font-black truncate">{name || '健身爱好者'}</...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 153: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...className="mt-1 text-2xl font-black">{value}<span className="text...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 374: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...stify-center text-[10px] font-black ${i === 0 ? 'bg-primary/10 te...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

### src\app\training-log\page.tsx

- **[MEDIUM]** Line 210: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...<div className="text-2xl font-black text-primary">...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 393: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...ms-center justify-center font-black text-sm bg-primary/10 text-pr...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 401: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...         <div className="font-black text-primary">{rec.weight}kg ...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

### src\app\workout\[id]\edit\page.tsx

- **[MEDIUM]** Line 213: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...  <h3 className="text-lg font-black text-primary">{exercise.name}...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 252: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...<div className="text-2xl font-black text-primary">{totalVolume}kg...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

### src\app\workout\[id]\page.tsx

- **[MEDIUM]** Line 196: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...h3 className={`text-base font-black ${exerciseLog.isWarmup ? 'tex...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 214: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...   <p className="text-lg font-black text-primary">{exerciseLog.se...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 220: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...   <p className="text-lg font-black text-primary">{exerciseLog.se...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 226: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...   <p className="text-lg font-black text-primary">{exerciseLog.se...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

### src\app\workout\components\ExerciseQuickLauncher.tsx

- **[MEDIUM]** Line 99: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...   <p className="text-sm font-black">常用{muscleGroupLabel ?? ''}动作...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

### src\app\workout\components\InstantShell.tsx

- **[MEDIUM]** Line 38: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...  <h1 className="text-xl font-black">开始训练</h1>...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 48: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `..."w-full py-4 rounded-2xl font-black text-lg flex items-center jus...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

### src\app\workout\RuntimeLoggingPanel.tsx

- **[MEDIUM]** Line 67: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...     className="text-2xl font-black tabular-nums"...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 91: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...="w-full py-4 rounded-xl font-black text-base flex items-center j...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

### src\components\ai-coaching\FatigueScore.tsx

- **[MEDIUM]** Line 69: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...<div className={`text-lg font-black ${cls.text}`}>...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

### src\components\ai-coaching\ProgressiveOverloadPanel.tsx

- **[MEDIUM]** Line 50: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...   <p className="text-xl font-black text-foreground">{d.thisWeekV...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 54: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...   <p className="text-xl font-black text-foreground">{d.lastWeekV...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

### src\components\layout\MetricCard.tsx

- **[MEDIUM]** Line 48: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...pan className={`text-4xl font-black leading-none ${COLOR_MAP[colo...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 76: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...pan className={`text-2xl font-black leading-none ${COLOR_MAP[colo...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 142: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...span className={`text-xl font-black ${COLOR_MAP[color]}`}>{value}...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

### src\components\MyFoodsPanel.tsx

- **[MEDIUM]** Line 209: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...<span className="text-sm font-black ml-auto" style={{ color: 'var...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

### src\components\NutritionCard.tsx

- **[MEDIUM]** Line 44: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...<div className="text-2xl font-black leading-none" style={{ color:...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

### src\components\runtime-analytics\BodyIntelligenceSurface.tsx

- **[MEDIUM]** Line 32: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...   <p className="text-sm font-black" style={{ color: 'var(--rvl-t...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 39: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...  <p className="text-2xl font-black" style={{ color: readinessCol...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 43: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...  <p className="text-2xl font-black" style={{ color: trendColor, ...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 47: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...  <p className="text-2xl font-black" style={{ color: 'var(--rvl-a...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

### src\components\runtime-analytics\ConsistencySignal.tsx

- **[MEDIUM]** Line 22: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...span className="text-3xl font-black" style={{ color, letterSpacin...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

### src\components\runtime-home\RuntimeHero.tsx

- **[MEDIUM]** Line 39: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...  <p className="text-3xl font-black tabular-nums" style={{ color,...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 52: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...r gap-2 rounded-2xl py-4 font-black text-base transition-all acti...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

### src\components\runtime-home\TodayMomentum.tsx

- **[MEDIUM]** Line 24: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...span className="text-2xl font-black" style={{ color: 'var(--rvl-t...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 35: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...<span className="text-xs font-black mt-1" style={{ color: 'var(--...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

### src\components\training-timeline\MilestoneStrip.tsx

- **[MEDIUM]** Line 31: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...   <p className="text-sm font-black" style={{ color: 'var(--rvl-t...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

### src\components\training-timeline\SessionNode.tsx

- **[MEDIUM]** Line 24: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...<span className="text-xs font-black" style={{ color: 'var(--text-...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 28: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...<span className="text-lg font-black">{volume >= 1000 ? (volume / ...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

### src\components\training-timeline\TimelineSurface.tsx

- **[MEDIUM]** Line 51: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...   <p className="text-sm font-black" style={{ color: 'var(--rvl-t...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 98: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...<span className="text-xs font-black px-2 py-0.5 rounded-lg" style...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 114: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...span className="text-2xl font-black tabular-nums" style={{ color:...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 118: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...<span className="text-sm font-black tabular-nums ml-3" style={{ c...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

### src\components\TrainingTypeModal.tsx

- **[MEDIUM]** Line 64: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...<h2 className="text-base font-black text-foreground">...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 85: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...   <p className="text-sm font-black text-foreground">力量训练</p>...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 93: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...   <p className="text-sm font-black text-foreground">有氧训练</p>...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 119: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...r gap-2 py-4 rounded-2xl font-black text-sm transition-all ${...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

### src\data\foods\carbs.ts

- **[MEDIUM]** Line 101: `white`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...    aliases: ['white bread', 'sandwich bread', '白面...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

### src\data\foods\drinks.ts

- **[MEDIUM]** Line 21: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...    aliases: ['coffee', 'black coffee', 'espresso', '美式咖啡', ...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 50: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `... aliases: ['americano', 'long black', '美式咖啡', '冰美式'],...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

### src\data\foods\protein.ts

- **[MEDIUM]** Line 116: `white`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...      { label: '1 large white', weightGrams: 33 },...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

### src\features\workout-runtime\ui\components\FloatingRestTimer.tsx

- **[MEDIUM]** Line 80: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...ial-gradient(transparent 55%, black 56%)",...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 81: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...ial-gradient(transparent 55%, black 56%)",...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

### src\features\workout-runtime\ui\components\WorkoutTopBar.tsx

- **[MEDIUM]** Line 39: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...1 rounded-lg text-[11px] font-black tabular-nums"...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

- **[MEDIUM]** Line 138: `black`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...      className="text-sm font-black truncate leading-tight"...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

### src\lib\frictionless-runtime\food-parsing\extractFoodCandidates.ts

- **[MEDIUM]** Line 40: `white`
  - *Pattern:* theme-escape-white-black
  - *Context:* `...aliases: ['米饭', '白米饭', '蒸饭', 'white rice', 'steamed rice', '饭'],...`
  - *Suggestion:* Verify this is not a UI color. Use foreground/background tokens if it is.

---

## Remediation Strategy

1. **Fix Critical first** — these break themes outright
2. **Fix High next** — hardcoded CSS colors in .css files
3. **Audit Medium last** — many may be false positives (comments, data viz)
4. **Run this script after each PR** to prevent regression
