import { ReactNode } from 'react';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface LayoutProps {
  children: ReactNode;
}

/**
 * 页面布局组件
 * 提供导航栏、语言切换和页面容器
 */
export default function Layout({ children }: LayoutProps) {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { locale, locales, asPath } = router;

  /**
   * 切换语言
   */
  const switchLanguage = (newLocale: string) => {
    router.push(asPath, asPath, { locale: newLocale });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* 导航栏 */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2"
              >
                <img src="/favicon.svg" alt="Brain Mark" className="w-8 h-8" />
                <span className="text-2xl font-bold text-gray-900">Brain Mark</span>
              </motion.div>
            </Link>

            {/* 导航链接 */}
            <div className="hidden md:flex items-center space-x-8">
              <Link
                href="/"
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                {t('home')}
              </Link>
              <Link
                href="/test"
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                {t('test')}
              </Link>
              <Link
                href="/leaderboard"
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                {t('leaderboard')}
              </Link>
              <Link
                href="/about"
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                {t('about')}
              </Link>
            </div>

            {/* 语言切换 */}
            <div className="flex items-center space-x-2">
              {locales?.map((loc) => (
                <button
                  key={loc}
                  onClick={() => switchLanguage(loc)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    locale === loc
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {loc === 'zh' ? '中文' : 'EN'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 移动端导航 */}
        <div className="md:hidden border-t border-gray-200">
          <div className="flex justify-around py-2">
            <Link
              href="/"
              className="flex flex-col items-center py-2 text-gray-600 hover:text-blue-600"
            >
              <span className="text-xs">{t('home')}</span>
            </Link>
            <Link
              href="/test"
              className="flex flex-col items-center py-2 text-gray-600 hover:text-blue-600"
            >
              <span className="text-xs">{t('test')}</span>
            </Link>
            <Link
              href="/leaderboard"
              className="flex flex-col items-center py-2 text-gray-600 hover:text-blue-600"
            >
              <span className="text-xs">{t('leaderboard')}</span>
            </Link>
            <Link
              href="/about"
              className="flex flex-col items-center py-2 text-gray-600 hover:text-blue-600"
            >
              <span className="text-xs">{t('about')}</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* 主要内容 */}
      <main>{children}</main>

      {/* 页脚 */}
      <footer className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-600">
            <p className="text-sm">
              {t('footer.copyright')}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}