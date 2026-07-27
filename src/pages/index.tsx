import { GetStaticProps } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Layout from '../components/Layout';
import QuickReactionDemo from '../components/QuickReactionDemo';
import SEOHead, { pageSEOConfig } from '../components/SEOHead';
import { getLeaderboard, getTestStats } from '../lib/api';
import { LeaderboardRecord, TestType } from '../lib/types';

interface FeaturedTest {
  type: TestType;
  categoryZh: string;
  categoryEn: string;
  titleZh: string;
  titleEn: string;
  descriptionZh: string;
  descriptionEn: string;
  visual: string;
  visualContent?: string;
}

const featuredTests: FeaturedTest[] = [
  { type: TestType.REACTION, categoryZh: '反应', categoryEn: 'Reaction', titleZh: '反应速度', titleEn: 'Reaction Time', descriptionZh: '看到信号后立即点击', descriptionEn: 'Click as soon as the signal appears', visual: 'visual-reaction' },
  { type: TestType.MEMORY, categoryZh: '记忆', categoryEn: 'Memory', titleZh: '数字记忆', titleEn: 'Number Memory', descriptionZh: '记住越来越长的数字', descriptionEn: 'Remember increasingly long numbers', visual: 'visual-number', visualContent: '739' },
  { type: TestType.VISUAL, categoryZh: '记忆', categoryEn: 'Memory', titleZh: '视觉记忆', titleEn: 'Visual Memory', descriptionZh: '复现亮起的方格位置', descriptionEn: 'Recall highlighted grid positions', visual: 'visual-grid' },
  { type: TestType.TYPING, categoryZh: '速度', categoryEn: 'Speed', titleZh: '打字速度', titleEn: 'Typing Speed', descriptionZh: '测量输入速度与准确率', descriptionEn: 'Measure typing speed and accuracy', visual: 'visual-type', visualContent: 'type|' },
  { type: TestType.STROOP, categoryZh: '注意', categoryEn: 'Attention', titleZh: '斯特鲁普测试', titleEn: 'Stroop Test', descriptionZh: '在干扰中识别真实颜色', descriptionEn: 'Identify colors under interference', visual: 'visual-stroop', visualContent: '红' },
  { type: TestType.SCHULTE, categoryZh: '注意', categoryEn: 'Attention', titleZh: '舒尔特方格', titleEn: 'Schulte Grid', descriptionZh: '按顺序找到所有数字', descriptionEn: 'Find every number in order', visual: 'visual-schulte' },
];

function TestVisual({ type, className, content }: { type: TestType; className: string; content?: string }) {
  if (type === TestType.VISUAL) {
    return <div className={`test-tile__visual ${className}`} aria-hidden="true">{Array.from({ length: 9 }, (_, index) => <i key={index} />)}</div>;
  }
  if (type === TestType.SCHULTE) {
    return <div className={`test-tile__visual ${className}`} aria-hidden="true">{[7, 2, 9, 1, 5, 3, 8, 4, 6].map((value) => <i key={value}>{value}</i>)}</div>;
  }
  return <div className={`test-tile__visual ${className}`} aria-hidden="true">{content}</div>;
}

export default function Home() {
  const { locale } = useRouter();
  const isEnglish = locale === 'en';
  const [reactionRankings, setReactionRankings] = useState<LeaderboardRecord[]>([]);
  const [reactionStats, setReactionStats] = useState<{ averageScore: number; bestScore: number; totalPlayers: number } | null>(null);

  useEffect(() => {
    let isActive = true;

    Promise.all([
      getLeaderboard(TestType.REACTION, 3),
      getTestStats(TestType.REACTION),
    ]).then(([rankings, stats]) => {
      if (!isActive) return;
      setReactionRankings(rankings);
      setReactionStats(stats);
    }).catch((error: unknown) => {
      console.error('Failed to load the homepage benchmark', error);
    });

    return () => {
      isActive = false;
    };
  }, []);

  const hasReactionStats = Boolean(reactionStats?.totalPlayers);

  return (
    <>
      <SEOHead title={pageSEOConfig.home.title} description={pageSEOConfig.home.description} keywords={pageSEOConfig.home.keywords} />
      <Layout>
        <div className="notice-bar"><div className="shell notice-row"><span className="notice-dot" /><span>{isEnglish ? '9 tests · No sign-up · Instant results' : '9 项测试 · 无需注册 · 完成后立即获得结果'}</span></div></div>

        <section className="hero">
          <div className="shell hero-grid">
            <div>
              <p className="eyebrow">Human performance, made visible</p>
              <h1>{isEnglish ? 'How fast do you ' : '你的反应速度，'}<span>{isEnglish ? 'really react?' : '到底有多快？'}</span></h1>
              <p className="hero-copy">{isEnglish ? 'Measure reaction, memory, attention and coordination in minutes. Every test comes with clear rules, instant results and an anonymous ranking.' : '用几分钟测量反应、记忆、注意力和手眼协调能力。每项测试都有清晰规则、即时结果和匿名排名。'}</p>
              <div className="hero-actions"><Link className="button button--primary" href="/test">{isEnglish ? 'Choose a test' : '选择一项测试'} <span aria-hidden="true">→</span></Link><Link className="button button--secondary" href="/leaderboard">{isEnglish ? 'View leaderboard' : '查看排行榜'}</Link></div>
              <div className="trust-line"><span><i />{isEnglish ? 'Anonymous' : '全程匿名'}</span><span><i />{isEnglish ? 'Stored locally' : '成绩保存在本机'}</span><span><i />{isEnglish ? 'Chinese and English' : '支持中英文'}</span></div>
            </div>
            <QuickReactionDemo locale={locale} siteAverage={hasReactionStats ? reactionStats?.averageScore : null} />
          </div>
        </section>

        <section className="section">
          <div className="shell">
            <div className="section-head"><div><p className="eyebrow">Test library</p><h2>{isEnglish ? 'Choose from 9 tests' : '从 9 项测试中选择'}</h2><p>{isEnglish ? 'Each test measures one specific ability. Read the rules, then enter its dedicated test page.' : '每一项只测一个明确能力。先了解规则，再进入独立测试页面。'}</p></div><Link className="text-link" href="/test">{isEnglish ? 'See all tests' : '查看全部项目'} →</Link></div>
            <div className="test-strip">
              {featuredTests.map((test, index) => (
                <Link className="test-tile" href={`/test/${test.type}`} key={test.type}>
                  <div className="test-tile__top"><span className="test-tile__num">{String(index + 1).padStart(2, '0')} / {isEnglish ? test.categoryEn : test.categoryZh}</span><span className="test-tile__arrow">→</span></div>
                  <h3>{isEnglish ? test.titleEn : test.titleZh}</h3><p>{isEnglish ? test.descriptionEn : test.descriptionZh}</p>
                  <TestVisual type={test.type} className={test.visual} content={test.visualContent} />
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="section section--ink">
          <div className="shell">
            <div className="section-head"><div><p className="eyebrow">Live benchmark</p><h2>{isEnglish ? 'See how everyone scored' : '看看大家测到了多少'}</h2><p>{isEnglish ? 'Scores use anonymous identifiers. Each test only accepts one ranked submission every 10 minutes.' : '成绩以匿名标识参与排名。同一项目 10 分钟内只记录一次，减少重复提交。'}</p></div><Link className="text-link" href="/leaderboard">{isEnglish ? 'Full leaderboard' : '完整排行榜'} →</Link></div>
            <div className="proof-grid">
              <div>
                <div className="score-callout"><strong>{hasReactionStats ? Math.round(reactionStats?.bestScore ?? 0) : '—'}</strong><span>{hasReactionStats ? 'ms' : ''}<br />{isEnglish ? 'fastest reaction score' : '当前反应速度最快成绩'}</span></div>
                <div className="rank-list">
                  {reactionRankings.length > 0 ? reactionRankings.map((record, index) => (
                    <div className="rank-row" key={record.id}>
                      <span>#{String(index + 1).padStart(2, '0')}</span>
                      <span>anon·{record.anonymous_id.slice(-4).toUpperCase()}</span>
                      <strong>{Math.round(record.result)} ms</strong>
                    </div>
                  )) : (
                    <div className="rank-row"><span>--</span><span>{isEnglish ? 'No ranked scores yet' : '暂无有效排名'}</span><strong>—</strong></div>
                  )}
                </div>
              </div>
              <aside className="proof-note"><h3>{isEnglish ? 'How should you read a result?' : '结果怎么理解？'}</h3><p>{isEnglish ? 'Device latency, attention and fatigue all affect a single score. We show the raw result, a reference range and an anonymous percentile without presenting it as a medical conclusion.' : '一次成绩会受到设备、注意力和疲劳影响。页面会同时展示原始成绩、参考区间与匿名百分位，避免把单次结果包装成医学结论。'}</p><Link className="button button--light" href="/about">{isEnglish ? 'Learn our principles' : '了解测试原则'}</Link></aside>
            </div>
          </div>
        </section>
      </Layout>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => ({ props: { ...(await serverSideTranslations(locale ?? 'zh', ['common'])) } });
