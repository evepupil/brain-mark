import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Layout from '../components/Layout';
import SEOHead, { pageSEOConfig } from '../components/SEOHead';

/**
 * 新的关于页面组件
 * 包含站长自我介绍和emoji
 */
export default function About() {
  const { t } = useTranslation('common');
  const router = useRouter();

  return (
    <>
      <SEOHead
        title={pageSEOConfig.about.title}
        description={pageSEOConfig.about.description}
        keywords={pageSEOConfig.about.keywords}
      />
      <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-white">
          <div className="max-w-4xl mx-auto px-4 py-16">
            <div className="text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="text-8xl mb-6"
              >
                🧠💡
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-4xl font-bold text-gray-900 mb-6"
              >
                {t('aboutPage.title')}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-xl text-gray-600 max-w-2xl mx-auto mb-8"
              >
                {t('aboutPage.subtitle')}
              </motion.p>
            </div>
          </div>
        </div>

        {/* About Me Section */}
        <div className="py-16">
          <div className="max-w-4xl mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-3xl p-8 shadow-xl"
            >
              <div className="text-center mb-8">
                <div className="text-6xl mb-4">👨‍💻🔬</div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  {t('aboutPage.whoAmI')}
                </h2>
                <p className="text-lg text-gray-600 leading-relaxed">
                  {t('aboutPage.introduction')}
                </p>
              </div>

              {/* Interests Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                  className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6"
                >
                  <div className="text-4xl mb-3">🧠🔬</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {t('aboutPage.cognitiveScience')}
                  </h3>
                  <p className="text-gray-600">
                    {t('aboutPage.cognitiveDescription')}
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 }}
                  className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6"
                >
                  <div className="text-4xl mb-3">💻⚡</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {t('aboutPage.programming')}
                  </h3>
                  <p className="text-gray-600">
                    {t('aboutPage.programmingDescription')}
                  </p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Mission Section */}
        <div className="py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="text-center"
            >
              <div className="text-6xl mb-6">🎯🚀</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                {t('aboutPage.mission')}
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed max-w-3xl mx-auto mb-8">
                {t('aboutPage.missionDescription')}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                  className="bg-white rounded-2xl p-6 shadow-lg"
                >
                  <div className="text-4xl mb-4">🎮🧪</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {t('aboutPage.gamification')}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {t('aboutPage.gamificationDesc')}
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.0 }}
                  className="bg-white rounded-2xl p-6 shadow-lg"
                >
                  <div className="text-4xl mb-4">📊📈</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {t('aboutPage.dataScience')}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {t('aboutPage.dataScienceDesc')}
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1 }}
                  className="bg-white rounded-2xl p-6 shadow-lg"
                >
                  <div className="text-4xl mb-4">🌐💡</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {t('aboutPage.openSource')}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {t('aboutPage.openSourceDesc')}
                  </p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Vision Section */}
        <div className="py-16">
          <div className="max-w-4xl mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl p-8 text-white text-center"
            >
              <div className="text-6xl mb-6">🔮✨</div>
              <h2 className="text-3xl font-bold mb-6">
                {t('aboutPage.vision')}
              </h2>
              <p className="text-lg leading-relaxed max-w-2xl mx-auto mb-8">
                {t('aboutPage.visionDescription')}
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => router.push('/test')}
                  className="bg-white text-purple-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                >
                  🚀 {t('aboutPage.startTesting')}
                </button>
                <button
                  onClick={() => router.push('/leaderboard')}
                  className="bg-purple-700 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-800 transition-colors"
                >
                  🏆 {t('aboutPage.viewLeaderboard')}
                </button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3 }}
            >
              <div className="text-6xl mb-6">📧🤝</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                {t('aboutPage.contact')}
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                {t('aboutPage.contactDescription')}
              </p>
              <div className="bg-white rounded-2xl p-6 shadow-lg inline-block">
                <div className="text-2xl mb-2">✉️</div>
                <p className="text-gray-600 mb-2">{t('aboutPage.contactMethod')}</p>
                <a
                  href="mailto:contact@bm.chaosyn.com"
                  className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                >
                  contact@bm.chaosyn.com
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      </Layout>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'zh', ['common'])),
    },
  };
};