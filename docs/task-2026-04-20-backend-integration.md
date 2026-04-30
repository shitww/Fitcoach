# FitCoach 后端接入 - 任务总结

**日期**: 2026-04-20
**任务**: 接入 NextAuth 后端用户认证系统
**状态**: ✅ 完成

---

## 📋 接入内容

### 1. 安装依赖
- next-auth@beta (v5)
- bcryptjs (密码加密)

### 2. NextAuth 配置
- 创建 `src/lib/auth.ts` - NextAuth 核心配置
- 支持 Credentials 登录（邮箱+密码）
- JWT Session 策略
- 自定义登录页面 `/auth/signin`

### 3. API 路由
| 路由 | 方法 | 说明 |
|------|------|------|
| `/api/auth/[...nextauth]` | GET/POST | NextAuth 主路由 |
| `/api/auth/register` | POST | 用户注册 |
| `/api/auth/signin` | POST | 用户登录 |

### 4. 认证页面
| 页面 | 说明 |
|------|------|
| `/auth/signin` | 登录页面 |
| `/auth/signup` | 注册页面 |

### 5. 路由保护
- 创建 `src/middleware.ts` - 保护所有非公开路由
- 未登录用户自动跳转登录页
- 已登录用户访问 auth 页面自动跳转首页

### 6. 环境变量
- 更新 `.env` 添加 `NEXTAUTH_URL` 和 `NEXTAUTH_SECRET`

### 7. 类型定义
- 创建 `src/types/next-auth.d.ts` - 扩展 NextAuth 类型

### 8. Session Provider
- 创建 `src/components/SessionProvider.tsx`
- 更新 `layout.tsx` 集成 SessionProvider

### 9. 数据库种子
- 创建 `prisma/seed.ts` - 演示账号

---

## 🔐 认证流程

```
用户注册 → /api/auth/register → 创建用户
用户登录 → /api/auth/signin → NextAuth → JWT Cookie
访问受保护页面 → middleware → 检查 session
```

---

## 👤 演示账号

```
邮箱: demo@fitcoach.com
密码: demo123
```

---

## 📁 新增/修改文件

| 文件 | 操作 |
|------|------|
| `src/lib/auth.ts` | 重写（NextAuth配置） |
| `src/app/api/auth/[...nextauth]/route.ts` | 新增 |
| `src/app/api/auth/register/route.ts` | 新增 |
| `src/app/auth/signin/page.tsx` | 新增 |
| `src/app/auth/signup/page.tsx` | 新增 |
| `src/middleware.ts` | 新增 |
| `src/types/next-auth.d.ts` | 新增 |
| `src/components/SessionProvider.tsx` | 新增 |
| `src/app/layout.tsx` | 更新 |
| `.env` | 更新 |
| `package.json` | 更新 |
| `prisma/seed.ts` | 新增 |

---

## 🚀 后续步骤

1. 运行数据库迁移和种子数据
2. 重启开发服务器
3. 测试完整登录注册流程

```bash
npm run db:push
npm run db:seed
npm run dev
```
