const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

/**
 * 生成sitemap.xml的脚本
 * 用于在构建时自动生成网站地图
 */

// 网站基础配置
const SITE_URL = 'https://bm.chaosyn.com'; // 请根据实际域名修改
const OUTPUT_PATH = path.join(__dirname, '..', 'public', 'sitemap.xml');
const BLOG_DIR = path.join(__dirname, '..', 'content', 'blog');

// 静态页面配置
const staticPages = [
  {
    url: '/',
    changefreq: 'daily',
    priority: '1.0',
    lastmod: new Date().toISOString().split('T')[0]
  },
  {
    url: '/test',
    changefreq: 'weekly',
    priority: '0.9',
    lastmod: new Date().toISOString().split('T')[0]
  },
  {
    url: '/practice',
    changefreq: 'monthly',
    priority: '0.6',
    lastmod: new Date().toISOString().split('T')[0]
  },
  {
    url: '/about',
    changefreq: 'monthly',
    priority: '0.7',
    lastmod: new Date().toISOString().split('T')[0]
  },
  {
    url: '/leaderboard',
    changefreq: 'daily',
    priority: '0.8',
    lastmod: new Date().toISOString().split('T')[0]
  }
];

// 测试页面配置
const testPages = [
  {
    url: '/test/reaction',
    changefreq: 'weekly',
    priority: '0.8',
    lastmod: new Date().toISOString().split('T')[0]
  },
  {
    url: '/test/memory',
    changefreq: 'weekly',
    priority: '0.8',
    lastmod: new Date().toISOString().split('T')[0]
  },
  {
    url: '/test/visual',
    changefreq: 'weekly',
    priority: '0.8',
    lastmod: new Date().toISOString().split('T')[0]
  },
  {
    url: '/test/typing',
    changefreq: 'weekly',
    priority: '0.8',
    lastmod: new Date().toISOString().split('T')[0]
  },
  {
    url: '/test/sequence',
    changefreq: 'weekly',
    priority: '0.8',
    lastmod: new Date().toISOString().split('T')[0]
  }
];

/**
 * 获取所有博客文章
 * @returns {Array} - 博客页面配置数组
 */
function getBlogPages() {
  const blogPages = [
    {
      url: '/blog',
      changefreq: 'weekly',
      priority: '0.8',
      lastmod: new Date().toISOString().split('T')[0]
    }
  ];

  if (!fs.existsSync(BLOG_DIR)) {
    return blogPages;
  }

  const files = fs.readdirSync(BLOG_DIR).filter(file => file.endsWith('.md'));

  files.forEach(file => {
    const slug = file.replace('.md', '');
    const filePath = path.join(BLOG_DIR, file);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const { data } = matter(fileContent);

    blogPages.push({
      url: `/blog/${slug}`,
      changefreq: 'monthly',
      priority: '0.7',
      lastmod: data.date ? new Date(data.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    });
  });

  return blogPages;
}

/**
 * 生成sitemap URL条目
 * @param {Object} page - 页面配置对象
 * @returns {string} - XML格式的URL条目
 */
function generateUrlEntry(page) {
  return `  <url>
    <loc>${SITE_URL}${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
}

/**
 * 生成完整的sitemap.xml内容
 * @returns {string} - 完整的sitemap.xml内容
 */
function generateSitemap() {
  const blogPages = getBlogPages();
  const allPages = [...staticPages, ...testPages, ...blogPages];

  const urlEntries = allPages.map(generateUrlEntry).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;
}

/**
 * 确保目录存在
 * @param {string} filePath - 文件路径
 */
function ensureDirectoryExists(filePath) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * 主函数：生成并保存sitemap.xml
 */
function main() {
  try {
    console.log('🚀 开始生成 sitemap.xml...');

    // 确保输出目录存在
    ensureDirectoryExists(OUTPUT_PATH);

    // 生成sitemap内容
    const sitemapContent = generateSitemap();

    // 写入文件
    fs.writeFileSync(OUTPUT_PATH, sitemapContent, 'utf8');

    const blogPages = getBlogPages();
    const totalPages = staticPages.length + testPages.length + blogPages.length;

    console.log('✅ sitemap.xml 生成成功!');
    console.log(`📍 文件位置: ${OUTPUT_PATH}`);
    console.log(`📊 包含页面数量: ${totalPages}`);

    // 显示生成的页面列表
    console.log('\n📋 包含的页面:');
    [...staticPages, ...testPages, ...blogPages].forEach(page => {
      console.log(`   ${SITE_URL}${page.url}`);
    });

  } catch (error) {
    console.error('❌ 生成 sitemap.xml 失败:', error.message);
    process.exit(1);
  }
}

// 如果直接运行此脚本，则执行主函数
if (require.main === module) {
  main();
}

module.exports = {
  generateSitemap,
  staticPages,
  testPages,
  SITE_URL
};
