# SEO

- 模块定位：Brain Mark 的技术 SEO、页面元数据、国际化 URL、结构化数据和搜索引擎入口
- 对应代码：`src/lib/seo.ts`、`src/components/SEOHead.tsx`、`src/pages/_document.tsx`、`src/pages/test/[testType].tsx`、`scripts/generate-sitemap.js`、`public/robots.txt`、`public/og-image.svg`
- 所属 M 里程碑：[M0 前端界面改造](../roadmap.md#m0-前端界面改造)
- 当前状态：已完成
- 最近更新时间：2026-08-10

## 职责与边界

SEO 模块负责让可公开访问的页面拥有稳定、可理解、与当前语言匹配的搜索入口。它覆盖 title、description、canonical、hreflang、Open Graph、Twitter Card、JSON-LD、robots 和 sitemap。

模块不负责虚构测试能力、修改成绩计算或扩大可索引内容。`/practice` 当前只是功能预告，因此保留 `noindex, follow`，也不进入 sitemap。

## 结构与数据流

页面通过 `SEOHead` 传入页面标题、描述、关键词、URL 和可选结构化数据。`src/lib/seo.ts` 统一维护站点域名、语言、页面 SEO 文案、九个测试项目的 SEO 文案，以及去除查询参数和语言前缀后的 canonical URL。

构建时由 `scripts/generate-sitemap.js` 从静态页面、九个测试路由和 `content/blog` 文章生成 sitemap。正式测试和信息页生成中英文 URL；文章正文当前只有中文，因此文章只进入中文 sitemap，英文文章路由保留访问但使用 `noindex`。每个可用 URL 写出对应的 `hreflang` 和 `x-default`，`public/robots.txt` 允许公开页面抓取并阻止 API 路由。

## 关键决策

- 默认中文使用无前缀 URL，英文使用 `/en` 前缀，避免把同一语言页面拆成多个可索引地址。
- canonical 去除 query string 和 hash，排行榜的测试筛选参数不会制造重复页面。
- 页面级 SEO 由 `SEOHead` 统一输出，`_document` 只保留文档级语言、视口、图标和应用基础信息。
- 结构化数据只描述当前页面和真实产品能力，不使用不存在的站内搜索或虚构的用户数据。
- 练习预告页保持可跟随链接但不进入索引，正式测试与文章页面进入双语 sitemap。

## 当前实现

- `SEOHead` 输出标题、描述、关键词、robots、canonical、Open Graph、Twitter Card、双语 hreflang 和安全转义的 JSON-LD。
- `src/lib/seo.ts` 提供页面级和测试级中英文 SEO 文案，覆盖反应、记忆、视觉、打字、序列、黑猩猩、瞄准、Stroop 和 Schulte 九个项目。
- 首页输出 `WebSite`、`Organization` 和 `WebApplication` 数据；测试目录输出包含九个真实入口的 `ItemList`。
- 动态测试页使用项目级 SEO 文案、`Quiz` 主实体和稳定 URL，不再使用重复的裸 `Head` 标签。
- 关于页、排行榜、博客目录和文章详情分别输出与页面内容对应的 JSON-LD；文章正文仍以当前仓库的中文内容为准。
- sitemap 生成 30 个可索引 URL，排除 `/practice` 和未翻译的英文文章，并为每篇文章保留 frontmatter 日期。
- `public/og-image.svg` 为分享卡片提供可访问的项目视觉资源，修复此前指向不存在 `/og-image.jpg` 的问题。

## 验证方式

- `npm run generate-sitemap`
- `npm run test:seo`
- `npm run type-check`
- `npm run lint`
- `npm run build`
- `git diff --check`
- 检查 sitemap URL 数量、九个测试 slug、双语 hreflang 和 `/practice` 排除结果。

## 待扩展项

- 为文章增加可选封面图和 `dateModified`，有真实内容变更时再更新 sitemap 日期。
- 在部署环境对公开 URL 做一次响应头、HTML head、canonical、hreflang 和 robots 的线上验收。
- 接入 Google Search Console 后，根据真实展示和点击数据调整页面标题与文章选题。

## 改动历史

- 2026-08-10：建立统一 SEO 配置和 URL 规则，补齐双语 sitemap、robots、动态测试页 SEO 与分享卡片资源。
