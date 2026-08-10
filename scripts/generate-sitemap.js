const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const SITE_URL = 'https://bm.chaosyn.com';
const OUTPUT_PATH = path.join(__dirname, '..', 'public', 'sitemap.xml');
const BLOG_DIR = path.join(__dirname, '..', 'content', 'blog');
const LOCALES = [
  { code: 'zh', hrefLang: 'zh-CN' },
  { code: 'en', hrefLang: 'en-US' },
];

const staticPages = [
  { url: '/', changefreq: 'daily', priority: '1.0' },
  { url: '/test', changefreq: 'weekly', priority: '0.9' },
  { url: '/about', changefreq: 'monthly', priority: '0.7' },
  { url: '/leaderboard', changefreq: 'daily', priority: '0.8' },
];

const testPages = [
  'reaction',
  'memory',
  'visual',
  'typing',
  'sequence',
  'chimp',
  'aim',
  'stroop',
  'schulte',
].map((testType) => ({
  url: `/test/${testType}`,
  changefreq: 'weekly',
  priority: '0.8',
}));

function getLocalizedPath(url, locale) {
  if (locale === 'zh') {
    return url;
  }

  return url === '/' ? '/en' : `/en${url}`;
}

function escapeXml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function getDate(value) {
  if (!value) {
    return undefined;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString().split('T')[0];
}

function getBlogPages() {
  const blogPages = [{ url: '/blog', changefreq: 'weekly', priority: '0.8' }];

  if (!fs.existsSync(BLOG_DIR)) {
    return blogPages;
  }

  const files = fs.readdirSync(BLOG_DIR).filter((file) => file.endsWith('.md'));

  files.forEach((file) => {
    const slug = file.replace(/\.md$/, '');
    const filePath = path.join(BLOG_DIR, file);
    const { data } = matter(fs.readFileSync(filePath, 'utf8'));

    blogPages.push({
      url: `/blog/${slug}`,
      changefreq: 'monthly',
      priority: '0.7',
      lastmod: getDate(data.date),
    });
  });

  return blogPages;
}

function generateUrlEntry(page, locale) {
  const localizedPath = getLocalizedPath(page.url, locale.code);
  const alternates = LOCALES.map((alternate) => (
    `    <xhtml:link rel="alternate" hreflang="${alternate.hrefLang}" href="${SITE_URL}${getLocalizedPath(page.url, alternate.code)}" />`
  ));
  alternates.push(`    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE_URL}${page.url}" />`);

  const metadata = [
    page.lastmod ? `    <lastmod>${page.lastmod}</lastmod>` : null,
    page.changefreq ? `    <changefreq>${page.changefreq}</changefreq>` : null,
    page.priority ? `    <priority>${page.priority}</priority>` : null,
  ].filter(Boolean);

  return [
    '  <url>',
    `    <loc>${escapeXml(`${SITE_URL}${localizedPath}`)}</loc>`,
    ...metadata,
    ...alternates,
    '  </url>',
  ].join('\n');
}

function generateSitemap() {
  const allPages = [...staticPages, ...testPages, ...getBlogPages()];
  const urlEntries = allPages
    .flatMap((page) => LOCALES.map((locale) => generateUrlEntry(page, locale)))
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urlEntries}
</urlset>\n`;
}

function main() {
  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, generateSitemap(), 'utf8');

  const totalPages = (staticPages.length + testPages.length + getBlogPages().length) * LOCALES.length;
  console.log(`Generated ${totalPages} localized sitemap URLs at ${OUTPUT_PATH}`);
}

if (require.main === module) {
  main();
}

module.exports = {
  generateSitemap,
  staticPages,
  testPages,
  SITE_URL,
};
