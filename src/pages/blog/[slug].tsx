import { GetStaticPaths, GetStaticProps } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import ReactMarkdown from 'react-markdown';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Layout from '../../components/Layout';
import SEOHead from '../../components/SEOHead';
import { BlogPost, getAllPostSlugs, getPostBySlug } from '../../lib/blog';
import { getCanonicalUrl, SITE_URL } from '../../lib/seo';

interface BlogPostPageProps {
  post: BlogPost;
}

function formatDate(date: string): string {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(parsedDate);
}

export default function BlogPostPage({ post }: BlogPostPageProps) {
  const { locale } = useRouter();
  const articleUrl = getCanonicalUrl(`/blog/${post.slug}`, 'zh');
  const articleStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    author: {
      '@type': 'Person',
      name: post.author || 'Brain Mark Team',
    },
    datePublished: post.date,
    dateModified: post.date,
    publisher: {
      '@type': 'Organization',
      name: 'Brain Mark',
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/favicon.svg`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': articleUrl,
    },
    keywords: post.tags?.join(', '),
    url: articleUrl,
    inLanguage: 'zh-CN',
  };

  return (
    <>
      <SEOHead
        title={post.title}
        description={post.description}
        keywords={post.tags?.join(',') || ''}
        url={`/blog/${post.slug}`}
        contentLocale="zh"
        canonicalLocale="zh"
        alternateLocales={['zh']}
        noIndex={locale === 'en'}
        type="article"
        structuredData={articleStructuredData}
      />
      <Layout>
        <article className="article-body">
          <p className="eyebrow">{post.tags?.[0] ?? '认知科普'} / Brain Mark</p>
          <div className="article-body__meta">
            <time dateTime={post.date}>{formatDate(post.date)}</time>
            {post.author && <><span>·</span><span>{post.author}</span></>}
          </div>
          <h1>{post.title}</h1>
          <p className="article-body__lead">{post.description}</p>
          <div className="article-markdown">
            <ReactMarkdown>{post.content}</ReactMarkdown>
          </div>
          <p className="article-body__back">
            <Link className="text-link" href="/blog">← 返回全部文章</Link>
          </p>
        </article>
      </Layout>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: getAllPostSlugs().flatMap((slug) => (
    ['zh', 'en'].map((locale) => ({ params: { slug }, locale }))
  )),
  fallback: false,
});

export const getStaticProps: GetStaticProps<BlogPostPageProps> = async ({ params, locale }) => {
  const slug = params?.slug;

  if (typeof slug !== 'string') {
    return { notFound: true };
  }

  const post = getPostBySlug(slug);

  if (!post) {
    return { notFound: true };
  }

  return {
    props: {
      post: { ...post, date: post.date.toString() },
      ...(await serverSideTranslations(locale ?? 'zh', ['common'])),
    },
  };
};
