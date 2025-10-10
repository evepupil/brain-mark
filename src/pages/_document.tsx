import { Html, Head, Main, NextScript } from 'next/document';

/**
 * Next.js自定义文档组件
 * 用于修改HTML文档的基本结构和SEO优化
 */
export default function Document() {
  return (
    <Html lang="zh-CN">
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        
        {/* SEO基础标签 */}
        <meta name="description" content="bm.chaosyn - 专业的认知能力测试平台，提供反应速度、记忆力、注意力等多种科学测试，帮助您了解和提升大脑认知能力" />
        <meta name="keywords" content="认知测试,反应速度测试,记忆力测试,注意力测试,大脑训练,认知能力,brain test,cognitive assessment,bm.chaosyn" />
        <meta name="author" content="bm.chaosyn" />
        <meta name="robots" content="index, follow" />
        <meta name="googlebot" content="index, follow" />
        <meta name="theme-color" content="#3B82F6" />
        
        {/* 预加载字体 */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* PWA相关 */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="bm.chaosyn" />
        <meta name="application-name" content="bm.chaosyn" />
        
        {/* Open Graph标签 */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="bm.chaosyn - 专业认知能力测试平台" />
        <meta property="og:description" content="提供科学的认知能力测试，包括反应速度、记忆力、注意力等多项测试，帮助您全面了解大脑认知能力" />
        <meta property="og:site_name" content="bm.chaosyn" />
        <meta property="og:locale" content="zh_CN" />
        <meta property="og:locale:alternate" content="en_US" />
        
        {/* Twitter Card标签 */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="bm.chaosyn - 专业认知能力测试平台" />
        <meta name="twitter:description" content="提供科学的认知能力测试，帮助您了解和提升大脑认知能力" />
        <meta name="twitter:creator" content="@bm.chaosyn" />
        
        {/* 其他SEO标签 */}
        <meta name="format-detection" content="telephone=no" />
        <meta name="msapplication-TileColor" content="#3B82F6" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="canonical" href="https://bm.chaosyn.com" />
      </Head>
      <body className="bg-white text-gray-900 antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}