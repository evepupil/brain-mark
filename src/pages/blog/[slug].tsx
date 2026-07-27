import { GetStaticPaths, GetStaticProps } from 'next';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Layout from '../../components/Layout';
import SEOHead from '../../components/SEOHead';
import { BlogPost, getAllPostSlugs, getPostBySlug } from '../../lib/blog';

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
        url: 'https://bm.chaosyn.com/favicon.svg',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://bm.chaosyn.com/blog/${post.slug}`,
    },
    keywords: post.tags?.join(', '),
  };

  return (
    <>
      <SEOHead
        title={post.title}
        description={post.description}
        keywords={post.tags?.join(',') || ''}
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
  paths: getAllPostSlugs().map((slug) => ({ params: { slug } })),
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
