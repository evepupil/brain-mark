import { GetStaticProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Layout from '../components/Layout';

const About = () => {
  const { t } = useTranslation('common');

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">👋</div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                关于BrainMark
              </h1>
            </div>
            
            <div className="prose prose-lg max-w-none text-gray-700">
                <p className="mb-6">
                  大家好！我是叶桐，这个网站的创建者。
                </p>
                
                <p className="mb-6">
                  我是一名程序员，对认知科学和大脑训练很感兴趣。工作之余喜欢研究各种提升专注力和记忆力的方法，所以创建了这个网站来分享一些有趣的大脑训练游戏。
                </p>
                
                <p className="mb-6">
                  希望这些游戏能对你有帮助，也能让你乐在其中。这里没有任何压力，请随心选择你感兴趣的游戏，享受过程就好。即便每天只玩几分钟，也是一次有益的思维锻炼。
                </p>
                
                <p className="mb-6">
                  如果你有任何反馈或建议，我非常乐意倾听。
                </p>
                
                <div className="bg-gray-50 rounded-lg p-4 mt-8">
                  <p className="text-gray-800 font-mono text-center">
                    联系方式：contact@BrainMark.com
                  </p>
                </div>
              </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'zh', ['common'])),
    },
  };
};

export default About;