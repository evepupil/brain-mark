import Document, { Head, Html, Main, NextScript } from 'next/document';
import { DEFAULT_LOCALE } from '../lib/seo';

export default class BrainMarkDocument extends Document {
  render() {
    const locale = this.props.__NEXT_DATA__.locale ?? DEFAULT_LOCALE;
    const language = locale === 'en' ? 'en' : 'zh-CN';

    return (
      <Html lang={language}>
        <Head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
          <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
          <meta name="author" content="Brain Mark" />
          <meta name="theme-color" content="#172027" />
          <meta name="format-detection" content="telephone=no" />
          <meta name="mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="default" />
          <meta name="apple-mobile-web-app-title" content="Brain Mark" />
          <meta name="application-name" content="Brain Mark" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        </Head>
        <body className="bg-white text-gray-900 antialiased">
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
