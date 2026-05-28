# SQLite 迁移历史（已归档）

此目录保存了 FitCoach **SQLite 时代**的 Prisma migrations（仅供回溯/参考）。

在进入生产部署（Vercel + Supabase Postgres）后：
- Prisma datasource 已切换为 `postgresql`
- 生产数据库会使用 **新的 Postgres migrations**（位于 `prisma/migrations/`）
- 旧的 SQLite migrations 不可直接用于 Postgres（SQL 方言不同）

如需回滚到 SQLite（仅用于本地开发/历史回溯）：
1. 将 `prisma/schema.prisma` 的 datasource provider 改回 `sqlite`
2. 恢复 `prisma/migrations/` 为此目录下的内容

