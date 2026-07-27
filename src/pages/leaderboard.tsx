import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Layout from '../components/Layout';
import { getLeaderboard, getTestStats } from '../lib/api';
import { LeaderboardRecord, TestType } from '../lib/types';
import { formatTestResult } from '../lib/utils';
import SEOHead, { pageSEOConfig } from '../components/SEOHead';

interface TestStats {
  totalPlayers: number;
  averageScore: number;
  bestScore: number;
}

interface TestTypeConfig {
  type: TestType;
}

const testTypes: TestTypeConfig[] = [
  { type: TestType.REACTION },
  { type: TestType.MEMORY },
  { type: TestType.VISUAL },
  { type: TestType.TYPING },
  { type: TestType.SEQUENCE },
  { type: TestType.CHIMP },
  { type: TestType.AIM },
  { type: TestType.STROOP },
  { type: TestType.SCHULTE },
];

function getRankMedalClass(rank: number): string {
  if (rank === 1) return 'rank-medal rank-medal--gold';
  if (rank === 2) return 'rank-medal rank-medal--silver';
  if (rank === 3) return 'rank-medal rank-medal--bronze';
  return 'rank-medal';
}

function formatDate(timestamp: number, locale: string): string {
  return new Date(timestamp).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/** 显示各项认知测试的匿名排名和统计信息。 */
export default function Leaderboard() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const dateLocale = router.locale === 'en' ? 'en-US' : 'zh-CN';
  const [selectedTest, setSelectedTest] = useState<TestType>(TestType.REACTION);
  const [leaderboard, setLeaderboard] = useState<LeaderboardRecord[]>([]);
  const [stats, setStats] = useState<TestStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const initializedRef = useRef(false);

  const loadLeaderboard = async (testType: TestType) => {
    try {
      setLoading(true);
      setError(null);

      const [leaderboardData, statsData] = await Promise.all([
        getLeaderboard(testType, 50),
        getTestStats(testType),
      ]);

      setLeaderboard(leaderboardData);
      setStats(statsData);
    } catch (err) {
      console.error('加载排行榜失败', err);
      setError('加载排行榜失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!router.isReady || initializedRef.current) return;

    initializedRef.current = true;
    const testParam = router.query.test as string;
    if (testParam && Object.values(TestType).includes(testParam as TestType)) {
      const initialTest = testParam as TestType;
      setSelectedTest(initialTest);
      loadLeaderboard(initialTest);
      return;
    }

    loadLeaderboard(selectedTest);
  }, [router.isReady, router.query.test, selectedTest]);

  const handleTestChange = (testType: TestType) => {
    if (testType === selectedTest) return;

    setSelectedTest(testType);
    loadLeaderboard(testType);
    router.push(`/leaderboard?test=${testType}`, undefined, { shallow: true });
  };

  const currentTestName = t(`tests.${selectedTest}.name`);

  return (
    <>
      <SEOHead
        title={pageSEOConfig.leaderboard.title}
        description={pageSEOConfig.leaderboard.description}
        keywords={pageSEOConfig.leaderboard.keywords}
      />
      <Layout>
          <section className="page-intro">
            <div className="shell page-intro__row">
              <div>
                <p className="eyebrow">Anonymous ranking</p>
                <h1 className="page-title">{t('leaderboard')}</h1>
                <p className="page-lede">
                  选择测试项目，查看近期匿名成绩。不同测试的计分方式不同，页面会明确标注成绩单位。
                </p>
              </div>
              <div className="page-index" aria-hidden="true">#01</div>
            </div>
          </section>

          <section className="leaderboard-layout" aria-label="测试排行榜">
            <div className="shell">
              <div className="leaderboard-summary" aria-live="polite">
                <div className="summary-stat">
                  <span>当前项目</span>
                  <strong>{currentTestName}</strong>
                </div>
                <div className="summary-stat">
                  <span>平均成绩</span>
                  <strong>{loading ? '加载中' : stats ? formatTestResult(selectedTest, stats.averageScore) : '暂无数据'}</strong>
                </div>
                <div className="summary-stat">
                  <span>有效样本</span>
                  <strong>{loading ? '加载中' : stats ? stats.totalPlayers.toLocaleString() : '暂无数据'}</strong>
                </div>
                <div className="summary-stat">
                  <span>最佳成绩</span>
                  <strong>{loading ? '加载中' : stats ? formatTestResult(selectedTest, stats.bestScore) : '暂无数据'}</strong>
                </div>
              </div>

              <div className="leaderboard-tabs" role="tablist" aria-label="测试排行榜">
                {testTypes.map((test) => (
                  <button
                    key={test.type}
                    className="leaderboard-tab"
                    type="button"
                    role="tab"
                    aria-selected={selectedTest === test.type}
                    onClick={() => handleTestChange(test.type)}
                  >
                    {t(`tests.${test.type}.name`)}
                  </button>
                ))}
              </div>

              <div className="leaderboard-table-wrap">
              <table className="leaderboard-table">
                <caption className="sr-only">{currentTestName} 排行榜</caption>
                <thead>
                  <tr>
                    <th scope="col">排名</th>
                    <th scope="col">匿名用户</th>
                    <th scope="col">提交时间</th>
                    <th scope="col">成绩</th>
                  </tr>
                </thead>
                <tbody aria-live="polite">
                  {loading ? (
                    Array.from({ length: 5 }, (_, index) => (
                      <tr key={index} className="leaderboard-table__loading" aria-hidden="true">
                        <td><span className="rank-medal">--</span></td>
                        <td>加载中</td>
                        <td>--</td>
                        <td>--</td>
                      </tr>
                    ))
                  ) : error ? (
                    <tr className="leaderboard-table__message">
                      <td colSpan={4}>{error}</td>
                    </tr>
                  ) : leaderboard.length > 0 ? (
                    leaderboard.map((record, index) => {
                      const rank = index + 1;
                      const accuracy = record.metadata?.accuracy;

                      return (
                        <motion.tr
                          key={record.id}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <td><span className={getRankMedalClass(rank)}>{rank}</span></td>
                          <td>匿名用户 #{record.anonymous_id.slice(-6)}</td>
                          <td>{formatDate(record.metadata?.timestamp || record.created_at, dateLocale)}</td>
                          <td>
                            <strong>{formatTestResult(selectedTest, record.result)}</strong>
                            {accuracy ? <small className="leaderboard-accuracy">准确率 {accuracy}%</small> : null}
                          </td>
                        </motion.tr>
                      );
                    })
                  ) : (
                    <tr className="leaderboard-table__message">
                      <td colSpan={4}>还没有人参与这项测试，成为第一位挑战者吧。</td>
                    </tr>
                  )}
                </tbody>
              </table>
              </div>

              <p className="mode-banner">
                <strong>公平规则：</strong>
                同一浏览器指纹在同一测试中，10 分钟内只接受一次有效成绩。异常成绩会被自动标记。
              </p>
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
