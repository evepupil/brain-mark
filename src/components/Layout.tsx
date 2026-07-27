import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { Menu, X } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

interface NavigationItem {
  href: string;
  label: string;
  practice?: boolean;
}

export default function Layout({ children }: LayoutProps) {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { locale, locales, asPath, pathname } = router;
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigation: NavigationItem[] = [
    { href: '/', label: t('home') },
    { href: '/test', label: t('test') },
    { href: '/leaderboard', label: t('leaderboard') },
    { href: '/blog', label: t('blog') },
    { href: '/about', label: t('about') },
    { href: '/practice', label: t('practice'), practice: true },
  ];

  const switchLanguage = (newLocale: string) => {
    void router.push(asPath, asPath, { locale: newLocale });
  };

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <div className="site-frame">
      <header className="site-header">
        <div className="shell header-row">
          <Link className="brand" href="/" aria-label="Brain Mark 首页">
            <img src="/favicon.svg" alt="" />
            <span>Brain Mark</span>
          </Link>

          <nav
            className={`main-nav ${isMenuOpen ? 'is-open' : ''}`}
            aria-label={locale === 'en' ? 'Main navigation' : '主导航'}
          >
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={item.practice ? 'nav-practice' : undefined}
                aria-current={isActive(item.href) ? 'page' : undefined}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="header-tools">
            <div className="language-switch" aria-label={t('language')}>
              {locales?.map((itemLocale) => (
                <button
                  key={itemLocale}
                  type="button"
                  aria-pressed={locale === itemLocale}
                  onClick={() => switchLanguage(itemLocale)}
                >
                  {itemLocale === 'zh' ? '中' : 'EN'}
                </button>
              ))}
            </div>
            <button
              className="menu-button"
              type="button"
              aria-label={isMenuOpen ? '关闭导航菜单' : '打开导航菜单'}
              aria-expanded={isMenuOpen}
              onClick={() => setIsMenuOpen((open) => !open)}
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      <main className="site-main">{children}</main>

      <footer className="site-footer">
        <div className="shell">
          <div className="footer-grid">
            <div>
              <div className="footer-brand">
                <img src="/favicon.svg" alt="" />
                Brain Mark
              </div>
              <p className="footer-note">
                {locale === 'en'
                  ? 'Measure and understand cognitive performance. Results are for entertainment and self-observation.'
                  : '测试和了解人类认知表现。结果用于娱乐与自我观察，不构成医学建议。'}
              </p>
            </div>
            <div className="footer-links">
              <strong>{locale === 'en' ? 'Product' : '产品'}</strong>
              <Link href="/test">{t('test')}</Link>
              <Link href="/leaderboard">{t('leaderboard')}</Link>
              <Link href="/practice">{t('practice')}</Link>
            </div>
            <div className="footer-links">
              <strong>{locale === 'en' ? 'Learn' : '了解'}</strong>
              <Link href="/blog">{t('blog')}</Link>
              <Link href="/about">{t('about')}</Link>
            </div>
          </div>
          <div className="footer-base">
            <span>{t('footer.copyright')}</span>
            <span>{locale === 'en' ? 'Anonymous by default' : '默认匿名 · 无需注册'}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
