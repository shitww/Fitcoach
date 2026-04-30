# FitCoach - getUserFromRequest 错误修复

**日期**: 2026-04-20
**错误**: `Export getUserFromRequest doesn't exist in target module`
**状态**: ✅ 已全部修复

---

## 问题原因

`@/lib/auth.ts` 只导出 `{ handlers, signIn, signOut, auth }`，不存在 `getUserFromRequest` 函数。

## 修复方案

将所有 API 路由中的 `getUserFromRequest(request)` 替换为：

```typescript
const session = await auth();
const userId = session?.user?.id;
```

---

## 已修复的文件（共 10 个）

| 文件 | 修复内容 |
|------|---------|
| `src/app/api/workouts/route.ts` | 替换认证方式 |
| `src/app/api/workouts/[id]/route.ts` | 替换认证方式 |
| `src/app/api/analysis/summary/route.ts` | 替换认证方式 |
| `src/app/api/analysis/trends/route.ts` | 替换认证方式 |
| `src/app/api/analysis/personal-records/route.ts` | 替换认证方式 |
| `src/app/api/exercises/route.ts` | 替换认证方式 |
| `src/app/api/feedback/history/route.ts` | 替换认证方式 |
| `src/app/api/feedback/generate/route.ts` | 替换认证方式 |
| `src/app/api/auth/login/route.ts` | 改用 `signIn()` |
| `src/app/api/auth/logout/route.ts` | 改用 `signOut()` |

---

## 认证方式对比

### ❌ 错误的（不存在）
```typescript
import { getUserFromRequest } from '@/lib/auth';
const user = await getUserFromRequest(request);
```

### ✅ 正确的
```typescript
import { auth } from '@/lib/auth';
const session = await auth();
const userId = session?.user?.id;

if (!userId) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```
