import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Layout from '../components/Layout';

/**
 * 关于页面组件
 * 介绍Human Benchmark项目的信息和使用说明
 */
export default function About() {
  const { t } = useTranslation('common');
  const router = useRouter();

  const features = [
    {
      icon: '⚡',
      title: '反应速度测试',
      description: '测试你的反应时间，看看你能多快响应视觉刺激。平均反应时间约为200-300毫秒。',
    },
    {
      icon: '🧠',
      title: '数字记忆测试',
      description: '挑战你的短期记忆能力，记住并输入越来越长的数字序列。',
    },
    {
      icon: '👁️',
      title: '视觉记忆测试',
      description: '测试你的视觉记忆能力，记住网格中高亮方块的位置。',
    },
    {
      icon: '⌨️',
      title: '打字速度测试',
      description: '测试你的打字速度和准确率，以每分钟字数(WPM)为单位计算。',
    },
    {
      icon: '🔢',
      title: '序列记忆测试',
      description: '记住并重复点击序列，挑战你的序列记忆能力。',
    },
  ];

  const stats = [
    {
      number: '5',
      label: '测试项目',
      description: '涵盖反应、记忆、视觉等多个维度',
    },
    {
      number: '∞',
      label: '无限挑战',
      description: '每个测试都有无限的提升空间',
    },
    {
      number: '100%',
      label: '免费使用',
      description: '完全免费，无需注册即可开始测试',
    },
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-white">
          <div className="max-w-6xl mx-auto px-4 py-16">
            <div className="text-center">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-5xl font-bold text-gray-900 mb-6"
              >
                关于 Brain Mark
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-xl text-gray-600 max-w-3xl mx-auto mb-8"
              >
                Brain Mark 是一个测试和训练人类认知能力的在线平台。
                通过科学设计的测试项目，帮助你了解自己的反应速度、记忆能力和认知水平。
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex justify-center space-x-4"
              >
                <button
                  onClick={() => router.push('/')}
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  开始测试
                </button>
                <button
                  onClick={() => router.push('/leaderboard')}
                  className="bg-gray-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors"
                >
                  查看排行榜
                </button>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="py-16 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center bg-white rounded-2xl p-8 shadow-lg"
                >
                  <div className="text-4xl font-bold text-blue-600 mb-2">
                    {stat.number}
                  </div>
                  <div className="text-xl font-semibold text-gray-900 mb-2">
                    {stat.label}
                  </div>
                  <div className="text-gray-600">
                    {stat.description}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-16">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                测试项目介绍
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                我们提供多种科学设计的认知能力测试，帮助你全面了解自己的能力水平。
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* How it Works Section */}
        <div className="py-16 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                如何使用
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                简单三步，开始你的认知能力测试之旅。
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-center"
              >
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-600">1</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  选择测试
                </h3>
                <p className="text-gray-600">
                  从首页选择你想要挑战的测试项目
                </p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-center"
              >
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-green-600">2</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  开始挑战
                </h3>
                <p className="text-gray-600">
                  按照指示完成测试，尽你所能发挥最佳水平
                </p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-center"
              >
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-purple-600">3</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  查看结果
                </h3>
                <p className="text-gray-600">
                  获得详细的测试结果和排名，了解你的能力水平
                </p>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Privacy Section */}
        <div className="py-16">
          <div className="max-w-4xl mx-auto px-4">
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                隐私保护
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    🔒 匿名测试
                  </h3>
                  <p className="text-gray-600 mb-4">
                    我们不收集任何个人身份信息。所有测试结果都以匿名方式存储和显示。
                  </p>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    🛡️ 数据安全
                  </h3>
                  <p className="text-gray-600">
                    我们使用先进的加密技术保护你的数据，确保信息安全。
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    🚫 防刷机制
                  </h3>
                  <p className="text-gray-600 mb-4">
                    为了保证排行榜的公平性，我们实施了10分钟防刷机制。
                  </p>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    📊 透明统计
                  </h3>
                  <p className="text-gray-600">
                    所有统计数据都是真实的，基于用户的实际测试结果。
                  </p>
                </div>
              </div>
              
              {/* GitHub Link Section */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    🔗 开源项目
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Brain Mark 是一个开源项目，欢迎查看源代码、提出建议或参与贡献。
                  </p>
                  <a
                    href="https://github.com/evepupil/brain-mark"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors shadow-lg"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                    </svg>
                    <span>查看 GitHub 仓库</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="py-16 bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-bold text-white mb-4"
            >
              准备好挑战自己了吗？
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-blue-100 mb-8"
            >
              立即开始测试，发现你的认知潜能！
            </motion.p>
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              onClick={() => router.push('/')}
              className="bg-white text-blue-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors shadow-lg"
            >
              开始测试 🚀
            </motion.button>
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