import { GetStaticProps } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Layout from '../components/Layout';
import SEOHead from '../components/SEOHead';

const copy = {
  zh: {
    title: '把人的认知表现，变成容易理解的结果。',
    lede: 'Brain Mark 是一个开源认知测试网站，为中文用户提供简单、匿名、可比较的在线测试。',
    mission: '测试应当清楚、克制，也足够有趣。',
    missionBody: '每项测试只回答一个明确问题：你的反应有多快、能记住多长的数字、能否在干扰中保持注意。页面会展示结果和参考范围，同时说明设备、环境与状态带来的误差。',
    principles: [
      ['匿名', '无需注册即可完成测试；排行榜只显示匿名标识。'],
      ['透明', '计分方向、参考范围和提交限制都会在页面中说明。'],
      ['边界', '结果用于娱乐和自我观察，不代替专业认知或医学评估。'],
      ['开放', '项目源代码公开，欢迎提交建议与改进。'],
    ],
    cta: '准备好测一项了吗？',
    ctaBody: '从反应速度开始通常只需要半分钟。',
    ctaButton: '查看测试项目',
    contact: '联系与共建',
    contactBody: '欢迎提出问题、反馈测试体验，或从源代码参与项目改进。',
    email: '联系邮箱',
  },
  en: {
    title: 'Turn cognitive performance into results you can understand.',
    lede: 'Brain Mark is an open-source cognitive testing website with simple, anonymous and comparable online tests.',
    mission: 'A test should be clear, restrained and still enjoyable.',
    missionBody: 'Each test answers one focused question: how fast you react, how many digits you remember, or how well you handle interference. Results include a reference range and the limits introduced by devices, environment and state.',
    principles: [
      ['Anonymous', 'Complete tests without an account; rankings only show an anonymous identifier.'],
      ['Transparent', 'Scoring direction, reference ranges and submission limits are explained.'],
      ['Bounded', 'Results are for entertainment and self-observation, not medical assessment.'],
      ['Open', 'The source code is public and contributions are welcome.'],
    ],
    cta: 'Ready to measure something?',
    ctaBody: 'Reaction time usually takes less than a minute.',
    ctaButton: 'Browse tests',
    contact: 'Contact and contribute',
    contactBody: 'Report a problem, share feedback or help improve the open-source project.',
    email: 'Email',
  },
} as const;

export default function About() {
  const { locale } = useRouter();
  const page = locale === 'en' ? copy.en : copy.zh;

  return (
    <>
      <SEOHead title={locale === 'en' ? 'About Brain Mark' : '关于 Brain Mark'} description={page.lede} keywords={locale === 'en' ? 'Brain Mark,cognitive test,open source' : '关于 Brain Mark,开源认知测试,认知能力测试'} />
      <Layout>
        <section className="page-intro"><div className="shell page-intro__row"><div><p className="eyebrow">About Brain Mark</p><h1 className="page-title">{page.title}</h1><p className="page-lede">{page.lede}</p></div><div className="page-index" aria-hidden="true">BM</div></div></section>

        <section className="about-grid shell"><div className="about-mark"><img src="/favicon.svg" alt="Brain Mark" /></div><div className="about-copy"><p className="eyebrow">Project mission</p><h2>{page.mission}</h2><p>{page.missionBody}</p><ul className="principles">{page.principles.map(([name, description]) => <li key={name}><strong>{name}</strong><span>{description}</span></li>)}</ul></div></section>

        <section className="section section--white"><div className="shell section-head"><div><p className="eyebrow">Get started</p><h2>{page.cta}</h2><p>{page.ctaBody}</p></div><Link className="button button--primary" href="/test">{page.ctaButton} →</Link></div></section>

        <section className="section"><div className="shell section-head"><div><p className="eyebrow">Contact & source</p><h2>{page.contact}</h2><p>{page.contactBody}</p></div><div className="about-links"><a className="button button--secondary" href="mailto:contact@bm.chaosyn.com">{page.email}</a><a className="button button--secondary" href="https://github.com/evepupil/brain-mark" target="_blank" rel="noreferrer">GitHub</a></div></div></section>
      </Layout>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => ({ props: { ...(await serverSideTranslations(locale ?? 'zh', ['common'])) } });
