import { GetStaticProps } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Layout from '../components/Layout';
import SEOHead from '../components/SEOHead';

const practiceCopy = {
  zh: {
    title: '重复练习，不影响正式测试和排行榜。',
    lede: '练习模式将支持自由选择时长、难度和重复次数。这里的结果与正式测试分开保存，不提交排行榜，也不会覆盖正式测试的最佳成绩。',
    boundary: '正式测试用于一次性测量和匿名比较；练习模式用于熟悉规则与重复操作。',
    sectionTitle: '选择练习内容',
    sectionBody: '当前页面是界面预告，尚未开放练习记录或成绩保存。',
    options: [
      ['反应 · 自定义 1–10 分钟', '反应点击练习', '自定义目标间隔与持续时间，熟悉点击节奏。'],
      ['记忆 · 自定义难度', '数字分组练习', '选择数字长度，反复练习分块记忆方法。'],
      ['注意 · 自定义轮次', '颜色干扰练习', '调整颜色数量和答题轮次，熟悉斯特鲁普规则。'],
    ],
    soon: '即将开放',
    formal: '想进行正式测量？',
    formalLink: '查看认知测试项目',
  },
  en: {
    title: 'Repeat freely without affecting official tests or rankings.',
    lede: 'Practice mode will let you choose duration, difficulty and repetitions. Practice results stay separate, never enter the leaderboard and never replace an official best score.',
    boundary: 'Official tests provide one measured result for anonymous comparison; practice helps you learn rules and repeat tasks.',
    sectionTitle: 'Choose a practice activity',
    sectionBody: 'This page previews the interface. Practice history and saved results are not available yet.',
    options: [
      ['Reaction · 1–10 minutes', 'Reaction clicking', 'Set target timing and duration to become familiar with the interaction.'],
      ['Memory · custom difficulty', 'Number grouping', 'Choose a digit length and repeat chunking exercises.'],
      ['Attention · custom rounds', 'Color interference', 'Adjust colors and rounds to become familiar with Stroop rules.'],
    ],
    soon: 'Coming soon',
    formal: 'Looking for an official measurement?',
    formalLink: 'Browse cognitive tests',
  },
} as const;

export default function Practice() {
  const { locale } = useRouter();
  const page = locale === 'en' ? practiceCopy.en : practiceCopy.zh;

  return (
    <>
      <SEOHead title={locale === 'en' ? 'Practice mode' : '练习模式'} description={page.lede} keywords={locale === 'en' ? 'cognitive practice,reaction practice,memory practice' : '认知练习,反应练习,记忆练习,注意力练习'} noIndex />
      <Layout>
        <section className="practice-intro"><div className="shell practice-intro__grid"><div><p className="eyebrow">Practice mode · {locale === 'en' ? 'Separate feature' : '独立功能'}</p><h1>{page.title}</h1><p>{page.lede}</p><div className="mode-banner"><strong>{locale === 'en' ? 'Clear boundary: ' : '模式边界：'}</strong>{page.boundary}</div></div><div className="mode-seal"><div><strong>∞</strong><span>{locale === 'en' ? 'Unlimited · unranked' : '不限次数 · 不计排名'}</span></div></div></div></section>

        <section className="section"><div className="shell"><div className="section-head"><div><p className="eyebrow">Practice library</p><h2>{page.sectionTitle}</h2><p>{page.sectionBody}</p></div></div><div className="practice-grid">{page.options.map(([label, title, description]) => <article key={title} className="practice-card"><span className="practice-card__label">{label}</span><h2>{title}</h2><p>{description}</p><span className="button button--secondary" aria-disabled="true">{page.soon}</span></article>)}</div><p className="practice-formal-link">{page.formal} <Link className="text-link" href="/test">{page.formalLink} →</Link></p></div></section>
      </Layout>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => ({ props: { ...(await serverSideTranslations(locale ?? 'zh', ['common'])) } });
