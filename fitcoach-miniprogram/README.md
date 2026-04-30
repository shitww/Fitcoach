# FitCoach 微信小程序

这是 FitCoach 健身训练记录小程序的 MVP 版本，基于 Taro + React + TypeScript 构建。

## 项目结构

```
fitcoach-miniprogram/
├── config/             # 项目配置文件
├── src/                # 源代码目录
│   ├── app.config.ts   # 应用配置
│   ├── app.scss        # 全局样式
│   ├── app.tsx         # 应用入口
│   └── pages/          # 页面目录
│       ├── index/      # 首页
│       ├── workout/    # 训练页
│       └── summary/    # 总结页
├── package.json        # 依赖配置
├── tsconfig.json       # TypeScript 配置
└── project.config.json # 微信小程序配置
```

## 核心功能

1. **首页** - 显示 FitCoach 标题，点击"开始训练"跳转
2. **训练页** - 输入重量和次数，添加训练组，完成训练
3. **总结页** - 显示总训练量、1RM、AI 反馈

## 技术栈

- Taro 4.0.7
- React 18
- TypeScript
- 微信小程序

## 安装使用

### 1. 安装依赖

```bash
cd fitcoach-miniprogram
npm install
```

### 2. 运行开发模式

```bash
npm run dev:weapp
```

### 3. 在微信开发者工具中打开

1. 打开微信开发者工具
2. 选择"导入项目"
3. 项目目录选择 `fitcoach-miniprogram/dist`
4. AppID 可以选择测试号或填入你的 AppID
5. 点击"导入"

## 使用流程

1. 在首页点击"开始训练"
2. 在训练页面输入重量和次数，点击"添加一组"
3. 重复添加多个训练组
4. 点击"完成训练"查看总结
5. 查看总训练量、1RM 和 AI 反馈
6. 点击"返回首页"重新开始

## 注意事项

- 本项目完全独立在 `fitcoach-miniprogram` 文件夹下，不影响 Web 项目
- 需要安装 Node.js 和 npm
- 需要微信开发者工具来运行和调试小程序
