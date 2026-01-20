import { GetStaticProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Layout from '../../components/Layout';
import SEOHead from '../../components/SEOHead';
import { getAllPosts, BlogPost } from '../../lib/blog';

interface BlogIndexProps {
  posts: BlogPost[];
}

/**
 * 博客列表页面
 */
export default function BlogIndex({ posts }: BlogIndexProps) {
  const { t } = useTranslation('common');

  return (
    <>
      <SEOHead
        title={`${t('blog')} - Brain Mark`}
        description="认知科学、大脑训练和心理学相关的博客文章"
        keywords="认知科学,大脑训练,心理学,记忆力,注意力,反应速度"
      />
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12">
          <div className="max-w-4xl mx-auto px-4">
            {/* 标题 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                {t('blog')}
              </h1>
              <p className="text-xl text-gray-600">
                认知科学与大脑训练相关文章
              </p>
            </motion.div>

            {/* 文章列表 */}
            <div className="space-y-6">
              {posts.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                  <p className="text-gray-600">暂无文章</p>
                </div>
              ) : (
                posts.map((post, index) => (
                  <motion.article
                    key={post.slug}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
                  >
                    <Link href={`/blog/${post.slug}`}>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2 hover:text-blue-600 transition-colors">
                        {post.title}
                      </h2>
                    </Link>
                    <div className="flex items-center text-sm text-gray-500 mb-3">
                      <time>{post.date}</time>
                      {post.author && (
                        <>
                          <span className="mx-2">·</span>
                          <span>{post.author}</span>
                        </>
                      )}
                    </div>
                    <p className="text-gray-600 mb-4">{post.description}</p>
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
                  </motion.article>
                ))
              )}
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  const posts = getAllPosts();

  return {
    props: {
      posts: posts.map(post => ({
        ...post,
        date: post.date.toString(),
        content: '', // 列表页不需要完整内容
      })),
      ...(await serverSideTranslations(locale ?? 'zh', ['common'])),
    },
  };
};
