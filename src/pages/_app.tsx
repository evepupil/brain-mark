import type { AppProps } from 'next/app';
import { appWithTranslation } from 'next-i18next';
import { Analytics } from '@vercel/analytics/next';
import '../index.css';
import '../styles/brain-mark.css';

/**
 * Next.js应用程序根组件
 * 包含全局样式和国际化配置
 */
function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Component {...pageProps} />
      <Analytics />
    </>
  );
}

export default appWithTranslation(App);
