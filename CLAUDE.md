# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

Brain Mark 是一个认知能力测试平台（Human Benchmark 中文优化版），提供五种大脑训练游戏：反应速度、数字记忆、视觉记忆、打字速度、序列记忆，并支持实时排行榜系统。

## 常用命令

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 类型检查
npm run type-check

# 代码检查
npm run lint

# 构建（会自动生成sitemap）
npm run build

# 生产模式启动
npm start
```

## 技术栈

- **前端框架**: Next.js 14 (Pages Router) + TypeScript
- **样式**: Tailwind CSS + Framer Motion
- **状态管理**: Zustand
- **数据库**: Turso (libSQL/SQLite)
- **国际化**: next-i18next (中文/英文，默认中文)
- **部署**: Vercel

## 架构

### 目录结构

```
src/
├── components/          # React 组件
│   ├── tests/          # 测试游戏组件（ReactionTest, MemoryTest等）
│   ├── Layout.tsx      # 页面布局
│   ├── TestCard.tsx    # 测试卡片
│   └── ResultEvaluation.tsx  # 结果评估
├── lib/                # 工具库
│   ├── turso.ts        # Turso 客户端与类型定义
│   ├── api.ts          # 客户端 API 调用函数
│   ├── evaluation.ts   # 成绩评估逻辑
│   ├── fingerprint.ts  # 浏览器指纹生成
│   └── utils.ts        # 通用工具函数
├── pages/              # Next.js 页面路由
│   ├── api/            # API Routes (服务端数据库操作)
│   │   ├── scores/submit.ts        # 分数提交 API
│   │   └── leaderboard/[testType].ts # 排行榜查询 API
│   ├── test/[testType].tsx  # 动态测试页面
│   ├── leaderboard.tsx # 排行榜
│   └── about.tsx       # 关于页面
└── types/              # TypeScript 类型定义
```

### 核心模式

1. **测试类型枚举** (`src/lib/turso.ts`): 使用 `TestType` 枚举定义五种测试类型（reaction, memory, visual, typing, sequence）

2. **匿名用户识别**: 通过浏览器指纹（`fingerprint.ts`）识别用户，无需注册登录

3. **防刷机制**: 同一测试10分钟内只能提交一次成绩（API Routes 服务端校验）

4. **成绩排序**: 反应速度测试越低越好，其他测试越高越好

5. **API Routes**: 数据库操作通过 Next.js API Routes 在服务端执行，客户端通过 fetch 调用

### 路径别名

使用 `@/*` 映射到 `./src/*`

## 环境变量

需要配置 `.env.local`:
```
TURSO_DATABASE_URL=libsql://your-database.turso.io
TURSO_AUTH_TOKEN=your_turso_auth_token
```

## 数据库表结构

```sql
-- scores 表
CREATE TABLE scores (
  id TEXT PRIMARY KEY,
  test_type TEXT NOT NULL,
  result REAL NOT NULL,
  fingerprint TEXT NOT NULL,
  anonymous_id TEXT NOT NULL,
  metadata TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- 索引
CREATE INDEX idx_scores_test_type_result ON scores(test_type, result);
CREATE INDEX idx_scores_type_fingerprint ON scores(test_type, fingerprint);
```

## 国际化

- 翻译文件位于 `public/locales/{zh,en}/common.json`
- 默认语言为中文(zh)
- 使用 `useTranslation` hook 获取翻译

## 编码规范

- 使用驼峰命名法 (camelCase) 或 PascalCase
- 组件拆分遵循原子设计原则（Atoms → Molecules → Organisms）
- 代码需要添加丰富的中文注释
