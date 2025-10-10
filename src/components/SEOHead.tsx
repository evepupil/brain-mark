import Head from 'next/head';
import { useRouter } from 'next/router';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  noIndex?: boolean;
  structuredData?: object;
}

/**
 * SEO头部组件
 * 为页面提供动态的SEO meta标签
 */
export default function SEOHead({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
  noIndex = false,
  structuredData
}: SEOHeadProps) {
  const router = useRouter();
  const { locale } = router;
  
  // 默认SEO配置
  const defaultTitle = 'FreeFocusGames - 专业认知能力测试平台';
  const defaultDescription = 'FreeFocusGames提供科学的认知能力测试，包括反应速度、记忆力、注意力等多项测试，帮助您全面了解和提升大脑认知能力';
  const defaultKeywords = '认知测试,反应速度测试,记忆力测试,注意力测试,大脑训练,认知能力,brain test,cognitive assessment';
  const defaultImage = '/og-image.jpg';
  const baseUrl = 'https://freefocusgames.com';
  
  // 构建完整的SEO数据
  const seoTitle = title ? `${title} - FreeFocusGames` : defaultTitle;
  const seoDescription = description || defaultDescription;
  const seoKeywords = keywords ? `${keywords},${defaultKeywords}` : defaultKeywords;
  const seoImage = image || defaultImage;
  const seoUrl = url || `${baseUrl}${router.asPath}`;
  
  // 根据语言调整内容
  const isEnglish = locale === 'en';
  const finalTitle = isEnglish && title ? title.replace(/测试|训练/g, 'Test').replace(/认知能力/g, 'Cognitive Ability') : seoTitle;
  const finalDescription = isEnglish ? seoDescription.replace(/认知能力/g, 'cognitive ability').replace(/测试/g, 'test') : seoDescription;
  
  // 生成默认结构化数据
  const defaultStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "FreeFocusGames",
    "description": finalDescription,
    "url": baseUrl,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${baseUrl}/test?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    },
    "publisher": {
      "@type": "Organization",
      "name": "FreeFocusGames",
      "url": baseUrl,
      "logo": {
        "@type": "ImageObject",
        "url": `${baseUrl}/favicon.svg`
      }
    },
    "mainEntity": {
      "@type": "WebApplication",
      "name": "FreeFocusGames认知测试平台",
      "description": "专业的认知能力测试平台，提供反应速度、记忆力、注意力等多项科学测试",
      "applicationCategory": "EducationalApplication",
      "operatingSystem": "Web Browser",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "CNY"
      }
    }
  };
  
  // 根据页面类型生成特定的结构化数据
  const getPageStructuredData = () => {
    if (structuredData) {
      return structuredData;
    }
    
    // 根据路由生成不同的结构化数据
    if (router.pathname === '/') {
      return {
        ...defaultStructuredData,
        "@type": "WebSite",
        "mainEntity": {
          "@type": "WebApplication",
          "name": "FreeFocusGames认知测试平台",
          "description": "专业的认知能力测试平台，提供反应速度、记忆力、注意力等多项科学测试",
          "applicationCategory": "EducationalApplication",
          "operatingSystem": "Web Browser"
        }
      };
    }
    
    if (router.pathname.startsWith('/test')) {
      return {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": finalTitle,
        "description": finalDescription,
        "url": seoUrl,
        "mainEntity": {
          "@type": "Quiz",
          "name": "认知能力测试",
          "description": "科学的认知能力测试，包括反应速度、记忆力、注意力等多项测试",
          "educationalLevel": "All levels",
          "assesses": "认知能力"
        }
      };
    }
    
    if (router.pathname === '/leaderboard') {
      return {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": finalTitle,
        "description": finalDescription,
        "url": seoUrl,
        "mainEntity": {
          "@type": "ItemList",
          "name": "认知测试排行榜",
          "description": "各项认知测试的最佳成绩排行榜"
        }
      };
    }
    
    return defaultStructuredData;
  };
  
  const pageStructuredData = getPageStructuredData();
  
  return (
    <Head>
      {/* 基础SEO标签 */}
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      <meta name="keywords" content={seoKeywords} />
      
      {/* 搜索引擎指令 */}
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      
      {/* Canonical URL */}
      <link rel="canonical" href={seoUrl} />
      
      {/* Open Graph标签 */}
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={seoUrl} />
      <meta property="og:image" content={`${baseUrl}${seoImage}`} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="FreeFocusGames" />
      <meta property="og:locale" content={locale === 'zh' ? 'zh_CN' : 'en_US'} />
      
      {/* Twitter Card标签 */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={`${baseUrl}${seoImage}`} />
      <meta name="twitter:creator" content="@FreeFocusGames" />
      
      {/* 语言相关 */}
      {locale === 'zh' && <link rel="alternate" hrefLang="en" href={`${baseUrl}/en${router.asPath}`} />}
      {locale === 'en' && <link rel="alternate" hrefLang="zh" href={`${baseUrl}/zh${router.asPath}`} />}
      <link rel="alternate" hrefLang="x-default" href={`${baseUrl}${router.asPath}`} />
      
      {/* 结构化数据 (JSON-LD) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(pageStructuredData)
        }}
      />
    </Head>
  );
}

/**
 * 预定义的页面SEO配置
 */
export const pageSEOConfig = {
  home: {
    title: '首页',
    description: 'FreeFocusGames是专业的认知能力测试平台，提供反应速度、记忆力、注意力等科学测试，帮助您了解大脑认知能力',
    keywords: '首页,认知测试平台,大脑测试'
  },
  test: {
    title: '认知测试',
    description: '选择适合您的认知能力测试项目，包括反应速度测试、记忆力测试、注意力测试等多种科学测试',
    keywords: '认知测试,反应速度,记忆力,注意力测试'
  },
  about: {
    title: '关于我们',
    description: '了解FreeFocusGames的创建理念和使命，我们致力于为用户提供科学、有趣的认知能力测试体验',
    keywords: '关于我们,网站介绍,认知科学'
  },
  leaderboard: {
    title: '排行榜',
    description: '查看各项认知测试的排行榜，与全球用户比较您的认知能力表现',
    keywords: '排行榜,成绩排名,认知能力比较'
  }
};