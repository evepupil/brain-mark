# Brain Mark 🧠

[![Next.js](https://img.shields.io/badge/Next.js-13.0-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.0-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-green?style=flat-square&logo=supabase)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

一个现代化的认知能力测试平台，提供多种大脑训练游戏和实时排行榜系统。Brain Mark 是 Human Benchmark 的中文优化版本，专为中文用户设计。

## ✨ 特性

- 🎯 **五种核心测试**：反应速度、数字记忆、视觉记忆、打字速度、序列记忆
- 🏆 **智能评价系统**：五级评价体系（初学者→专家），个性化建议
- 📊 **实时排行榜**：全球用户成绩排名，匿名参与
- 🌍 **双语支持**：完整的中英文国际化
- 📱 **响应式设计**：完美适配桌面端和移动端
- 🔒 **隐私保护**：完全匿名，无需注册
- 🛡️ **防刷机制**：智能检测异常成绩
- 🎨 **现代UI**：简洁美观的用户界面

## 🚀 技术栈

### 前端
- **Next.js 13** - React 全栈框架
- **TypeScript** - 类型安全的 JavaScript
- **Tailwind CSS** - 实用优先的 CSS 框架
- **Framer Motion** - 流畅的动画效果
- **next-i18next** - 国际化解决方案

### 后端
- **Supabase** - 开源的 Firebase 替代品
- **PostgreSQL** - 关系型数据库
- **Row Level Security** - 数据安全保护

### 部署
- **Vercel** - 前端部署平台
- **Supabase Cloud** - 数据库托管

## 📦 安装和运行

### 环境要求
- Node.js 18.0 或更高版本
- npm 或 pnpm 包管理器

### 1. 克隆项目
```bash
git clone https://github.com/evepupil/brain-mark.git
cd brain-mark
```

### 2. 安装依赖
```bash
npm install
# 或
pnpm install
```

### 3. 环境配置
创建 `.env.local` 文件并配置 Supabase：
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. 数据库设置
在 Supabase 中执行 `supabase/migrations` 目录下的 SQL 文件来创建数据表。

### 5. 启动开发服务器
```bash
npm run dev
# 或
pnpm dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 📁 项目结构

```
brain-mark/
├── public/                 # 静态资源
├── src/
│   ├── components/         # React 组件
│   │   ├── tests/         # 测试组件
│   │   └── ui/            # UI 组件
│   ├── lib/               # 工具库
│   │   ├── supabase.ts    # Supabase 客户端
│   │   └── utils.ts       # 工具函数
│   ├── pages/             # Next.js 页面
│   │   ├── api/           # API 路由
│   │   └── tests/         # 测试页面
│   ├── styles/            # 样式文件
│   └── types/             # TypeScript 类型定义
├── supabase/
│   └── migrations/        # 数据库迁移文件
├── public/locales/        # 国际化文件
│   ├── en/               # 英文翻译
│   └── zh/               # 中文翻译
└── next.config.js         # Next.js 配置
```

## 🎮 测试项目说明

### 反应速度测试
- 测试用户对视觉刺激的反应时间
- 评价标准：< 200ms (专家) 到 > 400ms (初学者)

### 数字记忆测试
- 测试短期记忆能力
- 逐步增加数字序列长度
- 评价标准：记忆 3-4 位 (初学者) 到 9+ 位 (专家)

### 视觉记忆测试
- 测试空间记忆能力
- 记住方格中的图案位置
- 评价标准：通过 1-2 关 (初学者) 到 8+ 关 (专家)

### 打字速度测试
- 测试键盘输入速度和准确性
- 支持中英文输入
- 评价标准：< 30 WPM (初学者) 到 80+ WPM (专家)

### 序列记忆测试
- 测试序列记忆能力
- 重复播放的按钮序列
- 评价标准：记忆 3-4 步 (初学者) 到 10+ 步 (专家)

## 🚀 部署

### Vercel 部署
1. 将代码推送到 GitHub
2. 在 Vercel 中导入项目
3. 配置环境变量
4. 部署完成

### 环境变量配置
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🤝 贡献指南

我们欢迎所有形式的贡献！

### 如何贡献
1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

### 开发规范
- 使用 TypeScript 进行类型检查
- 遵循 ESLint 代码规范
- 编写清晰的提交信息
- 添加适当的测试用例

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- 感谢 [Human Benchmark](https://humanbenchmark.com/) 提供的灵感
- 感谢所有贡献者的支持

## 📞 联系方式

- GitHub: [https://github.com/evepupil/brain-mark](https://github.com/evepupil/brain-mark)
- Issues: [https://github.com/evepupil/brain-mark/issues](https://github.com/evepupil/brain-mark/issues)

---

⭐ 如果这个项目对你有帮助，请给它一个星标！