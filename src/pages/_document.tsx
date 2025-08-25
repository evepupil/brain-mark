import { Html, Head, Main, NextScript } from 'next/document';

/**
 * Next.js自定义文档组件
 * 用于修改HTML文档的基本结构
 */
export default function Document() {
  return (
    <Html>
      <Head>
        <meta charSet="utf-8" />
        <meta name="description" content="Brain Mark - 测试你的认知能力" />
        <meta name="keywords" content="反应速度,记忆力,认知测试,brain mark" />
        <meta name="author" content="Brain Mark" />
        
        {/* 预加载字体 */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* PWA相关 */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Brain Mark" />
        
        {/* 社交媒体分享 */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Brain Mark" />
        <meta property="og:description" content="测试你的认知能力 - 反应速度、记忆力、注意力等" />
        <meta property="og:site_name" content="Brain Mark" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Brain Mark" />
        <meta name="twitter:description" content="测试你的认知能力" />
      </Head>
      <body className="bg-white text-gray-900 antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}