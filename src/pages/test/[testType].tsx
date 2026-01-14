import { GetServerSideProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '../../components/Layout';
import ReactionTest from '../../components/tests/ReactionTest';
import MemoryTest from '../../components/tests/MemoryTest';
import VisualTest from '../../components/tests/VisualTest';
import TypingTest from '../../components/tests/TypingTest';
import SequenceTest from '../../components/tests/SequenceTest';
import ChimpTest from '../../components/tests/ChimpTest';
import AimTest from '../../components/tests/AimTest';
import { TestType } from '../../lib/types';

/**
 * 测试页面组件
 * 根据测试类型渲染对应的测试组件
 */
export default function TestPage() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { testType } = router.query;

  /**
   * 根据测试类型渲染对应的测试组件
   */
  const renderTest = () => {
    switch (testType) {
      case TestType.REACTION:
        return <ReactionTest />;
      case TestType.MEMORY:
        return <MemoryTest />;
      case TestType.VISUAL:
        return <VisualTest />;
      case TestType.TYPING:
        return <TypingTest />;
      case TestType.SEQUENCE:
        return <SequenceTest />;
      case TestType.CHIMP:
        return <ChimpTest />;
      case TestType.AIM:
        return <AimTest />;
      default:
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {t('error')}
            </h2>
            <p className="text-gray-600">
              未知的测试类型: {testType}
            </p>
          </div>
        );
    }
  };

  return (
    <Layout>
      <Head>
        <title>
          {testType && t(`tests.${testType}.name`)} - {t('title')}
        </title>
        <meta
          name="description"
          content={testType ? t(`tests.${testType}.description`) : t('description')}
        />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {renderTest()}
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async ({
  locale,
  params,
}) => {
  const testType = params?.testType as string;
  
  // 验证测试类型是否有效
  const validTestTypes = Object.values(TestType);
  if (!validTestTypes.includes(testType as TestType)) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'zh', ['common'])),
    },
  };
};