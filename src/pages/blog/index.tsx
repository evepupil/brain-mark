import { GetStaticProps } from 'next';
import Link from 'next/link';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Layout from '../../components/Layout';
import SEOHead from '../../components/SEOHead';
import { BlogPost, getAllPosts } from '../../lib/blog';

interface BlogIndexProps {
  posts: BlogPost[];
}

function formatDate(date: string): string {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(parsedDate).replace(/\//g, '.');
}

function getTopic(post: BlogPost): string {
  return post.tags?.[0] ?? '认知科普';
}

export default function BlogIndex({ posts }: BlogIndexProps) {
  const [featuredPost, ...otherPosts] = posts;

  return (
    <>
      <SEOHead
        title="认知与测试"
        description="解读认知测试背后的心理学原理、成绩误差和日常影响因素。"
        keywords="认知科学,认知测试,反应速度,记忆力,注意力"
      />
      <Layout>
        <section className="page-intro">
          <div className="shell page-intro__row">
            <div>
              <p className="eyebrow">Notes on cognition</p>
              <h1 className="page-title">认知与测试</h1>
              <p className="page-lede">
                解释测试背后的心理学原理、成绩误差和日常影响因素，让每个数字都更容易理解。
              </p>
            </div>
            <div className="page-index" aria-hidden="true">03</div>
          </div>
        </section>

        <section className="article-grid shell" aria-label="认知科普文章">
          {featuredPost ? (
            <article className="feature-article">
              <span className="article-tag">{getTopic(featuredPost)} · 认知科普</span>
              <h2>{featuredPost.title}</h2>
              <p>{featuredPost.description}</p>
              <Link className="text-link" href={`/blog/${featuredPost.slug}`}>
                阅读文章 →
              </Link>
            </article>
          ) : (
            <article className="feature-article">
              <span className="article-tag">内容准备中</span>
              <h2>认知与测试</h2>
              <p>我们正在整理与认知测试有关的科普内容，欢迎稍后再来查看。</p>
            </article>
          )}

          <div className="article-list">
            {otherPosts.map((post) => (
              <Link key={post.slug} className="article-item" href={`/blog/${post.slug}`}>
                <time dateTime={post.date}>{formatDate(post.date)} · {getTopic(post)}</time>
                <h2>{post.title}</h2>
                <p>{post.description}</p>
              </Link>
            ))}
          </div>
        </section>
      </Layout>
    </>
  );
}

export const getStaticProps: GetStaticProps<BlogIndexProps> = async ({ locale }) => {
  const posts = getAllPosts().map((post) => ({
    ...post,
    date: post.date.toString(),
    content: '',
  }));

  return {
    props: {
      posts,
      ...(await serverSideTranslations(locale ?? 'zh', ['common'])),
    },
  };
};
