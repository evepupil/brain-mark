import { GetStaticProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Layout from '../../components/Layout';
import TestCard from '../../components/TestCard';
import { TestType } from '../../lib/supabase';

/**
 * 测试页面组件
 * 显示所有可用的测试项目
 */
export default function TestPage() {
  const { t } = useTranslation('common');

  // 测试项目列表
  const tests = [
    {
      type: TestType.REACTION,
      icon: '⚡',
      color: 'from-yellow-400 to-orange-500',
    },
    {
      type: TestType.MEMORY,
      icon: '🧠',
      color: 'from-blue-400 to-purple-500',
    },
    {
      type: TestType.VISUAL,
      icon: '👁️',
      color: 'from-green-400 to-blue-500',
    },
    {
      type: TestType.TYPING,
      icon: '⌨️',
      color: 'from-pink-400 to-red-500',
    },
    {
      type: TestType.SEQUENCE,
      icon: '🔢',
      color: 'from-indigo-400 to-purple-500',
    },
  ];

  return (
    <Layout>
      <Head>
        <title>{t('test')} - {t('title')}</title>
        <meta name="description" content={t('description')} />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* 头部区域 */}
        <div className="text-center py-12 px-4">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-6xl font-bold text-gray-900 mb-4"
          >
            {t('title')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-gray-600 mb-8"
          >
            {t('description')}
          </motion.p>
        </div>

        {/* 测试项目网格 */}
        <div className="max-w-6xl mx-auto px-4 pb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tests.map((test, index) => (
              <motion.div
                key={test.type}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <TestCard
                  testType={test.type}
                  icon={test.icon}
                  gradient={test.color}
                />
              </motion.div>
            ))}
          </div>
        </div>

        {/* 底部链接 */}
        <div className="text-center pb-8">
          <div className="flex justify-center space-x-6 text-gray-600">
            <Link
              href="/leaderboard"
              className="hover:text-blue-600 transition-colors"
            >
              {t('leaderboard')}
            </Link>
            <Link
              href="/about"
              className="hover:text-blue-600 transition-colors"
            >
              {t('about')}
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'zh', ['common'])),
    },
  };
};