# FitCoach 后端接入 - 任务总结

**日期**: 2026-04-20
**任务**: NextAuth 后端完整接入
**状态**: ✅ 完成

---

## 修复的问题

### 1. Middleware 已弃用 → 改用 proxy.ts
Next.js 15+ 使用 `proxy.ts` 替代 `middleware.ts`

### 2. API 返回 HTML 问题
- 未登录时 API 会重定向到登录页（返回 HTML）
- 修复：使用 `useSession()` 判断登录状态，未登录时不请求数据
- 修复页面：`page.tsx`、`analytics/page.tsx`

---

## 📁 关键文件

| 文件 | 说明 |
|------|------|
| `src/proxy.ts` | 路由保护（新格式） |
| `src/lib/auth.ts` | NextAuth 配置 |
| `src/app/page.tsx` | 首页（已修复） |
| `src/app/analytics/page.tsx` | 数据分析页（已修复） |

---

## 认证流程

```
未登录 → /auth/signin → 登录 → JWT Cookie
访问受保护页面 → proxy.ts 检查 session
```

---

## 测试步骤

1. 访问 http://localhost:3000 → 自动跳转登录页
2. 注册新账号或使用演示账号登录
3. 登录后访问首页和数据分析页面

---

## 演示账号

```
邮箱: demo@fitcoach.com
密码: demo123
```

注意：需要先运行 `npm run db:seed` 创建演示账号。
