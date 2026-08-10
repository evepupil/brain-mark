import { GetServerSideProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../../components/Layout';
import SEOHead from '../../components/SEOHead';
import ReactionTest from '../../components/tests/ReactionTest';
import MemoryTest from '../../components/tests/MemoryTest';
import VisualTest from '../../components/tests/VisualTest';
import TypingTest from '../../components/tests/TypingTest';
import SequenceTest from '../../components/tests/SequenceTest';
import ChimpTest from '../../components/tests/ChimpTest';
import AimTest from '../../components/tests/AimTest';
import StroopTest from '../../components/tests/StroopTest';
import SchulteTest from '../../components/tests/SchulteTest';
import { getLocale, getPageStructuredData, getCanonicalUrl, testSEOConfig } from '../../lib/seo';
import { TestType } from '../../lib/types';

const testDetails: Record<TestType, { icon: string; duration: string }> = {
  [TestType.REACTION]: { icon: '\u26a1', duration: '30s' },
  [TestType.MEMORY]: { icon: '\ud83e\udde0', duration: '2 min' },
  [TestType.VISUAL]: { icon: '\ud83d\udc41\ufe0f', duration: '3 min' },
  [TestType.TYPING]: { icon: '\u2328\ufe0f', duration: '1 min' },
  [TestType.SEQUENCE]: { icon: '\ud83d\udd22', duration: '3 min' },
  [TestType.CHIMP]: { icon: '\ud83d\udc12', duration: '3 min' },
  [TestType.AIM]: { icon: '\ud83c\udfaf', duration: '1 min' },
  [TestType.STROOP]: { icon: '\ud83c\udfa8', duration: '2 min' },
  [TestType.SCHULTE]: { icon: '\ud83d\udd33', duration: '2 min' },
};

export default function TestPage() {
  const { t, i18n } = useTranslation('common');
  const router = useRouter();
  const testType = router.query.testType as TestType | undefined;
  const detail = testType ? testDetails[testType] : undefined;
  const isEnglish = i18n.language.startsWith('en');
  const seo = testType ? testSEOConfig[testType][getLocale(i18n.language)] : undefined;
  const testUrl = testType ? getCanonicalUrl(`/test/${testType}`, i18n.language) : undefined;

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
      case TestType.STROOP:
        return <StroopTest />;
      case TestType.SCHULTE:
        return <SchulteTest />;
      default:
        return (
          <div className="detail-stage__error">
            <h2>{t('error')}</h2>
            <p>Unknown test type: {router.query.testType}</p>
          </div>
        );
    }
  };

  return (
    <Layout>
      {testType && seo && testUrl && (
        <SEOHead
          title={seo.title}
          description={seo.description}
          keywords={seo.keywords}
          url={`/test/${testType}`}
          structuredData={getPageStructuredData({
            name: seo.title,
            description: seo.description,
            url: testUrl,
            locale: i18n.language,
          })}
        />
      )}

      {detail && testType && (
        <section className="test-context">
          <div className="shell test-context__row">
            <div className="test-context__identity">
              <div className="detail-icon" aria-hidden="true">{detail.icon}</div>
              <div><p className="eyebrow">{isEnglish ? `Formal test / ${detail.duration}` : `正式测试 / ${detail.duration.replace('min', '分钟').replace('s', '秒')}`}</p><h1 id="detail-title">{t(`tests.${testType}.name`)}</h1><p>{t(`tests.${testType}.description`)}</p></div>
            </div>
            <div className="test-context__note"><strong>{isEnglish ? 'Before you start' : '开始前'}</strong><span>{isEnglish ? 'Keep this tab visible and follow the on-screen instructions. Your best score is saved in this browser.' : '保持此页面在前台并按照画面提示完成测试。最佳成绩会保存在当前浏览器。'}</span></div>
            <Link className="text-link" href="/test">← {isEnglish ? 'All tests' : '全部测试'}</Link>
          </div>
        </section>
      )}
      <div className="test-runtime">{renderTest()}</div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ locale, params }) => {
  const testType = params?.testType;
  const validTestTypes = Object.values(TestType);

  if (typeof testType !== 'string' || !validTestTypes.includes(testType as TestType)) {
    return { notFound: true };
  }

  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'zh', ['common'])),
    },
  };
};
