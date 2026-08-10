import Head from 'next/head';
import { useRouter } from 'next/router';
import {
  getAbsoluteAssetUrl,
  getAlternateUrls,
  getCanonicalUrl,
  getLocale,
  getPageStructuredData,
  localizedPageSEOConfig,
  pageSEOConfig,
  SITE_NAME,
  type SupportedLocale,
} from '../lib/seo';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  noIndex?: boolean;
  structuredData?: Record<string, unknown>;
}

const defaultSeo = localizedPageSEOConfig.home;

export default function SEOHead({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
  noIndex = false,
  structuredData,
}: SEOHeadProps) {
  const router = useRouter();
  const locale = getLocale(router.locale) as SupportedLocale;
  const copy = defaultSeo[locale];
  const finalTitle = title ? `${title} | ${SITE_NAME}` : `${copy.title} | ${SITE_NAME}`;
  const finalDescription = description || copy.description;
  const finalKeywords = keywords || copy.keywords;
  const canonicalUrl = getCanonicalUrl(url || router.asPath, locale);
  const imageUrl = getAbsoluteAssetUrl(image || '/og-image.svg');
  const alternateUrls = getAlternateUrls(url || router.asPath);
  const pageStructuredData = structuredData || getPageStructuredData({
    name: finalTitle,
    description: finalDescription,
    url: canonicalUrl,
    locale,
  });

  return (
    <Head>
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      <meta name="keywords" content={finalKeywords} />
      <meta name="robots" content={noIndex ? 'noindex, follow' : 'index, follow'} />
      <link rel="canonical" href={canonicalUrl} />

      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:image:alt" content={`${SITE_NAME} social preview`} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content={locale === 'zh' ? 'zh_CN' : 'en_US'} />
      <meta property="og:locale:alternate" content={locale === 'zh' ? 'en_US' : 'zh_CN'} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={imageUrl} />

      {alternateUrls.map((alternate) => (
        <link key={alternate.hrefLang} rel="alternate" hrefLang={alternate.hrefLang} href={alternate.href} />
      ))}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(pageStructuredData).replace(/</g, '\\u003c'),
        }}
      />
    </Head>
  );
}

export { pageSEOConfig };
