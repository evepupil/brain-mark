import { GetStaticProps } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Layout from '../../components/Layout';
import SEOHead from '../../components/SEOHead';
import { BlogPost, getAllPosts } from '../../lib/blog';
import { getCanonicalUrl, getPageSeo } from '../../lib/seo';

interface BlogIndexProps {
  posts: BlogPost[];
}

function formatDate(date: string): string {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(parsedDate).replace(/\//g, '.');
}

function getTopic(post: BlogPost): string {
  return post.tags?.[0] ?? '认知科普';
}

export default function BlogIndex({ posts }: BlogIndexProps) {
  const { locale } = useRouter();
  const [featuredPost, ...otherPosts] = posts;
  const seo = getPageSeo('blog', 'zh');
  const blogUrl = getCanonicalUrl('/blog', 'zh');
  const language = 'zh-CN';
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${blogUrl}#collection`,
    name: seo.title,
    description: seo.description,
    url: blogUrl,
    inLanguage: language,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: posts.length,
      itemListElement: posts.map((post, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: post.title,
        url: getCanonicalUrl(`/blog/${post.slug}`, 'zh'),
      })),
    },
  };

  return (
    <>
      <SEOHead
        title={seo.title}
        description={seo.description}
        keywords={seo.keywords}
        url="/blog"
        contentLocale="zh"
        canonicalLocale="zh"
        alternateLocales={['zh']}
        noIndex={locale === 'en'}
        structuredData={structuredData}
      />
      <Layout>
        <section className="page-intro">
          <div className="shell page-intro__row">
            <div>
              <p className="eyebrow">Notes on cognition</p>
              <h1 className="page-title">认知与测试</h1>
              <p className="page-lede">
                解释测试背后的心理学原理、成绩误差和日常影响因素，让每个数字都更容易理解。
              </p>
            </div>
            <div className="page-index" aria-hidden="true">03</div>
          </div>
        </section>

        <section className="article-grid shell" aria-label="认知科普文章">
          {featuredPost ? (
            <article className="feature-article">
              <span className="article-tag">{getTopic(featuredPost)} · 认知科普</span>
              <h2>{featuredPost.title}</h2>
              <p>{featuredPost.description}</p>
              <Link className="text-link" href={`/blog/${featuredPost.slug}`}>
                阅读文章 →
              </Link>
            </article>
          ) : (
            <article className="feature-article">
              <span className="article-tag">内容准备中</span>
              <h2>认知与测试</h2>
              <p>我们正在整理与认知测试有关的科普内容，欢迎稍后再来查看。</p>
            </article>
          )}

          <div className="article-list">
            {otherPosts.map((post) => (
              <Link key={post.slug} className="article-item" href={`/blog/${post.slug}`}>
                <time dateTime={post.date}>{formatDate(post.date)} · {getTopic(post)}</time>
                <h2>{post.title}</h2>
                <p>{post.description}</p>
              </Link>
            ))}
          </div>
        </section>
      </Layout>
    </>
  );
}

export const getStaticProps: GetStaticProps<BlogIndexProps> = async ({ locale }) => {
  const posts = getAllPosts().map((post) => ({
    ...post,
    date: post.date.toString(),
    content: '',
  }));

  return {
    props: {
      posts,
      ...(await serverSideTranslations(locale ?? 'zh', ['common'])),
    },
  };
};
