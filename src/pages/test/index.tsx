import { GetStaticProps } from 'next';
import { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { motion } from 'framer-motion';
import Layout from '../../components/Layout';
import TestCard from '../../components/TestCard';
import { TestType } from '../../lib/types';
import SEOHead, { pageSEOConfig } from '../../components/SEOHead';

const tests = [
  TestType.REACTION,
  TestType.MEMORY,
  TestType.VISUAL,
  TestType.TYPING,
  TestType.SEQUENCE,
  TestType.CHIMP,
  TestType.AIM,
  TestType.STROOP,
  TestType.SCHULTE,
];

type TestGroup = 'all' | 'speed' | 'memory' | 'attention';

const testGroups: Record<TestType, Exclude<TestGroup, 'all'>> = {
  [TestType.REACTION]: 'speed',
  [TestType.MEMORY]: 'memory',
  [TestType.VISUAL]: 'memory',
  [TestType.TYPING]: 'speed',
  [TestType.SEQUENCE]: 'memory',
  [TestType.CHIMP]: 'memory',
  [TestType.AIM]: 'speed',
  [TestType.STROOP]: 'attention',
  [TestType.SCHULTE]: 'attention',
};

export default function TestPage() {
  const { i18n } = useTranslation('common');
  const [group, setGroup] = useState<TestGroup>('all');
  const isEnglish = i18n.language.startsWith('en');
  const visibleTests = group === 'all' ? tests : tests.filter((testType) => testGroups[testType] === group);
  const filters: Array<{ value: TestGroup; zh: string; en: string }> = [
    { value: 'all', zh: '全部 9 项', en: 'All 9 tests' },
    { value: 'speed', zh: '反应与协调', en: 'Reaction & coordination' },
    { value: 'memory', zh: '记忆', en: 'Memory' },
    { value: 'attention', zh: '注意力', en: 'Attention' },
  ];

  return (
    <>
      <SEOHead
        title={pageSEOConfig.test.title}
        description={pageSEOConfig.test.description}
        keywords={pageSEOConfig.test.keywords}
      />
      <Layout>
        <section className="page-intro">
          <div className="shell page-intro__row">
            <div>
              <p className="eyebrow">Test library</p>
              <h1 className="page-title">{isEnglish ? 'Choose a test' : '选择一项测试'}</h1>
              <p className="page-lede">{isEnglish ? 'Each test has its own rules and scoring. See the raw result, reference range and anonymous ranking when you finish.' : '每项测试都有独立规则与计分方式。完成后可以查看原始成绩、参考水平和匿名排行榜。'}</p>
            </div>
            <div className="page-index" aria-label={`${tests.length} tests`}>0{tests.length}</div>
          </div>
        </section>

        <section className="section">
          <div className="shell">
            <div className="filters" role="group" aria-label={isEnglish ? 'Filter tests' : '按能力筛选测试'}>
              {filters.map((filter) => (
                <button key={filter.value} className="filter" type="button" aria-pressed={group === filter.value} onClick={() => setGroup(filter.value)}>
                  {isEnglish ? filter.en : filter.zh}
                </button>
              ))}
            </div>
            <div className="test-grid">
              {visibleTests.map((testType, index) => (
                <motion.div
                  key={testType}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: index * 0.05 }}
                >
                  <TestCard testType={testType} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </Layout>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? 'zh', ['common'])),
  },
});
