import { GetStaticProps, GetStaticPaths } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import Layout from '../../components/Layout';
import SEOHead from '../../components/SEOHead';
import { getPostBySlug, getAllPostSlugs, BlogPost } from '../../lib/blog';

interface BlogPostPageProps {
  post: BlogPost;
}

/**
 * 博客文章详情页面
 */
export default function BlogPostPage({ post }: BlogPostPageProps) {
  const { t } = useTranslation('common');

  return (
    <>
      <SEOHead
        title={`${post.title} - Brain Mark`}
        description={post.description}
        keywords={post.tags?.join(',') || ''}
      />
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12">
          <article className="max-w-4xl mx-auto px-4">
            {/* 文章头部 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-lg p-8 mb-8"
            >
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                {post.title}
              </h1>
              <div className="flex items-center text-gray-600 mb-4">
                <time>{post.date}</time>
                {post.author && (
                  <>
                    <span className="mx-2">·</span>
                    <span>{post.author}</span>
                  </>
                )}
              </div>
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {post.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>

            {/* 文章内容 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg shadow-lg p-8 prose prose-lg max-w-none"
            >
              <ReactMarkdown>{post.content}</ReactMarkdown>
            </motion.div>
          </article>
        </div>
      </Layout>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const slugs = getAllPostSlugs();

  return {
    paths: slugs.map(slug => ({
      params: { slug },
    })),
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async ({ params, locale }) => {
  const slug = params?.slug as string;
  const post = getPostBySlug(slug);

  if (!post) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      post: {
        ...post,
        date: post.date.toString(),
      },
      ...(await serverSideTranslations(locale ?? 'zh', ['common'])),
    },
  };
};
