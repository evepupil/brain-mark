import { TestType } from './types';

export const SITE_URL = 'https://bm.chaosyn.com';
export const SITE_NAME = 'Brain Mark';
export const DEFAULT_LOCALE = 'zh';
export const SUPPORTED_LOCALES = ['zh', 'en'] as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export interface SeoCopy {
  title: string;
  description: string;
  keywords: string;
}

export type LocalizedSeoCopy = Record<SupportedLocale, SeoCopy>;

export const localizedPageSEOConfig = {
  home: {
    zh: {
      title: '在线认知能力测试',
      description: '免费在线完成反应速度、记忆力、注意力和手眼协调测试，查看即时结果与匿名排行榜。',
      keywords: '在线认知测试,反应速度测试,记忆力测试,注意力测试,大脑测试',
    },
    en: {
      title: 'Online Cognitive Tests',
      description: 'Take free online tests for reaction time, memory, attention and coordination with instant results and anonymous rankings.',
      keywords: 'online cognitive test,reaction time test,memory test,attention test,brain test',
    },
  },
  test: {
    zh: {
      title: '认知测试项目',
      description: '选择反应速度、数字记忆、视觉记忆、打字速度、注意力等在线认知测试，了解每项测试的规则与结果。',
      keywords: '认知测试项目,在线测试,反应速度,数字记忆,视觉记忆,注意力测试',
    },
    en: {
      title: 'Cognitive Test Library',
      description: 'Choose online tests for reaction time, memory, typing speed and attention, with clear rules and measurable results.',
      keywords: 'cognitive test library,online test,reaction time,memory test,attention test',
    },
  },
  about: {
    zh: {
      title: '关于 Brain Mark',
      description: '了解 Brain Mark 如何提供简单、匿名、可比较的在线认知测试，以及结果的适用边界。',
      keywords: 'Brain Mark,关于认知测试,匿名测试,认知科学',
    },
    en: {
      title: 'About Brain Mark',
      description: 'Learn how Brain Mark provides simple, anonymous and comparable online cognitive tests, plus the limits of each result.',
      keywords: 'Brain Mark,about cognitive tests,anonymous test,cognitive science',
    },
  },
  leaderboard: {
    zh: {
      title: '认知测试排行榜',
      description: '查看各项认知测试的近期匿名成绩，按测试项目比较反应速度、记忆力和注意力表现。',
      keywords: '认知测试排行榜,在线成绩排名,反应速度排名,匿名排行榜',
    },
    en: {
      title: 'Cognitive Test Leaderboard',
      description: 'Compare recent anonymous scores across reaction time, memory, attention and other cognitive tests.',
      keywords: 'cognitive test leaderboard,online score ranking,reaction time ranking,anonymous leaderboard',
    },
  },
  blog: {
    zh: {
      title: '认知与测试',
      description: '用清楚易懂的文章解释认知测试背后的心理学原理、成绩误差和日常影响因素。',
      keywords: '认知科学,认知测试,反应速度,记忆力,注意力,心理学科普',
    },
    en: {
      title: 'Notes on Cognition and Testing',
      description: 'Understand the psychology behind cognitive tests, score variation and everyday factors through clear, practical notes.',
      keywords: 'cognitive science,cognitive test,reaction time,memory,attention,psychology',
    },
  },
} as const satisfies Record<string, LocalizedSeoCopy>;

export const pageSEOConfig = {
  home: localizedPageSEOConfig.home.zh,
  test: localizedPageSEOConfig.test.zh,
  about: localizedPageSEOConfig.about.zh,
  leaderboard: localizedPageSEOConfig.leaderboard.zh,
  blog: localizedPageSEOConfig.blog.zh,
} as const;

export function getPageSeo(page: keyof typeof localizedPageSEOConfig, locale?: string): SeoCopy {
  return localizedPageSEOConfig[page][getLocale(locale)];
}

export const testSEOConfig: Record<TestType, LocalizedSeoCopy> = {
  [TestType.REACTION]: {
    zh: { title: '反应速度测试', description: '在线测量看到信号后点击的反应时间，完成测试后查看毫秒成绩与匿名排名。', keywords: '反应速度测试,反应时间测试,在线反应测试' },
    en: { title: 'Reaction Time Test', description: 'Measure how quickly you respond to a visual signal and compare your millisecond score anonymously.', keywords: 'reaction time test,reaction speed test,online reaction test' },
  },
  [TestType.MEMORY]: {
    zh: { title: '数字记忆测试', description: '尝试记住越来越长的数字序列，了解自己的数字工作记忆表现。', keywords: '数字记忆测试,记忆力测试,工作记忆测试' },
    en: { title: 'Number Memory Test', description: 'Remember increasingly long number sequences and see how your working memory performs.', keywords: 'number memory test,memory test,working memory test' },
  },
  [TestType.VISUAL]: {
    zh: { title: '视觉记忆测试', description: '记住亮起的方格位置并准确复现，测试你的空间视觉记忆。', keywords: '视觉记忆测试,空间记忆测试,在线记忆测试' },
    en: { title: 'Visual Memory Test', description: 'Remember highlighted grid positions and reproduce them to measure visual-spatial memory.', keywords: 'visual memory test,spatial memory test,online memory test' },
  },
  [TestType.TYPING]: {
    zh: { title: '打字速度测试', description: '在线测试打字速度和准确率，查看每分钟字数与完成表现。', keywords: '打字速度测试,在线打字测试,打字准确率测试' },
    en: { title: 'Typing Speed Test', description: 'Measure your typing speed and accuracy online with a clear words-per-minute result.', keywords: 'typing speed test,online typing test,typing accuracy test' },
  },
  [TestType.SEQUENCE]: {
    zh: { title: '序列记忆测试', description: '按照亮起的顺序点击方块，测试你记忆和复现操作序列的能力。', keywords: '序列记忆测试,记忆顺序测试,在线记忆游戏' },
    en: { title: 'Sequence Memory Test', description: 'Repeat the order in which squares light up to test sequence memory and recall.', keywords: 'sequence memory test,order memory test,online memory game' },
  },
  [TestType.CHIMP]: {
    zh: { title: '黑猩猩记忆测试', description: '记住数字方块的位置并按顺序点击，挑战你的视觉短期记忆。', keywords: '黑猩猩测试,数字记忆测试,视觉短期记忆' },
    en: { title: 'Chimp Test', description: 'Remember numbered tile positions and click them in order to challenge visual short-term memory.', keywords: 'chimp test,number memory test,visual short-term memory' },
  },
  [TestType.AIM]: {
    zh: { title: '瞄准与手眼协调测试', description: '尽快点击不断出现的目标，测试手眼协调和视觉定位速度。', keywords: '瞄准测试,手眼协调测试,点击速度测试' },
    en: { title: 'Aim and Coordination Test', description: 'Click appearing targets as quickly as possible to measure hand-eye coordination and visual aiming.', keywords: 'aim test,hand-eye coordination test,click speed test' },
  },
  [TestType.STROOP]: {
    zh: { title: '斯特鲁普效应测试', description: '在文字含义干扰下选择显示颜色，体验经典的选择性注意力测试。', keywords: '斯特鲁普效应测试,选择性注意力测试,认知控制测试' },
    en: { title: 'Stroop Effect Test', description: 'Choose the displayed color while ignoring the word meaning in this selective attention test.', keywords: 'Stroop effect test,selective attention test,cognitive control test' },
  },
  [TestType.SCHULTE]: {
    zh: { title: '舒尔特方格测试', description: '按顺序找到方格中的数字，测试视觉搜索速度和注意力分配。', keywords: '舒尔特方格测试,视觉搜索测试,注意力测试' },
    en: { title: 'Schulte Grid Test', description: 'Find numbers in order on a Schulte grid to measure visual search speed and attention.', keywords: 'Schulte grid test,visual search test,attention test' },
  },
};

export function getLocale(locale?: string): SupportedLocale {
  return locale === 'en' ? 'en' : DEFAULT_LOCALE;
}

function getPathname(value: string): string {
  let pathname = value;

  try {
    pathname = new URL(value, SITE_URL).pathname;
  } catch {
    pathname = value.split(/[?#]/, 1)[0] || '/';
  }

  const withoutQuery = pathname.split(/[?#]/, 1)[0] || '/';
  const withLeadingSlash = withoutQuery.startsWith('/') ? withoutQuery : `/${withoutQuery}`;
  const collapsed = withLeadingSlash.replace(/\/+/g, '/');

  return collapsed.length > 1 ? collapsed.replace(/\/$/, '') : '/';
}

function removeLocalePrefix(pathname: string): string {
  const path = getPathname(pathname);

  if (path === '/en') {
    return '/';
  }

  if (path.startsWith('/en/')) {
    return path.slice('/en'.length) || '/';
  }

  return path;
}

export function getLocalizedPath(pathname: string, locale?: string): string {
  const basePath = removeLocalePrefix(pathname);
  const resolvedLocale = getLocale(locale);

  if (resolvedLocale === 'en') {
    return basePath === '/' ? '/en' : `/en${basePath}`;
  }

  return basePath;
}

export function getCanonicalUrl(pathname: string, locale?: string): string {
  return `${SITE_URL}${getLocalizedPath(pathname, locale)}`;
}

export function getAlternateUrls(
  pathname: string,
  locales: readonly SupportedLocale[] = SUPPORTED_LOCALES,
): Array<{ hrefLang: string; href: string }> {
  const basePath = removeLocalePrefix(pathname);

  const alternateUrls = locales.map((locale) => ({
    hrefLang: locale === 'zh' ? 'zh-CN' : 'en-US',
    href: getCanonicalUrl(basePath, locale),
  }));

  return [...alternateUrls, { hrefLang: 'x-default', href: getCanonicalUrl(basePath, 'zh') }];
}

export function getAbsoluteAssetUrl(assetPath: string): string {
  if (/^https?:\/\//i.test(assetPath)) {
    return assetPath;
  }

  return `${SITE_URL}/${assetPath.replace(/^\/+/, '')}`;
}

export function getPageStructuredData({
  name,
  description,
  url,
  locale,
}: {
  name: string;
  description: string;
  url: string;
  locale?: string;
}) {
  const resolvedLocale = getLocale(locale);

  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${url}#webpage`,
    name,
    description,
    url,
    inLanguage: resolvedLocale === 'en' ? 'en-US' : 'zh-CN',
    isPartOf: {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      name: SITE_NAME,
      url: SITE_URL,
    },
  };
}

export function getTestListStructuredData({
  name,
  description,
  url,
  locale,
}: {
  name: string;
  description: string;
  url: string;
  locale?: string;
}) {
  const resolvedLocale = getLocale(locale);

  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${url}#collection`,
    name,
    description,
    url,
    inLanguage: resolvedLocale === 'en' ? 'en-US' : 'zh-CN',
    mainEntity: {
      '@type': 'ItemList',
      name,
      numberOfItems: Object.keys(testSEOConfig).length,
      itemListOrder: 'https://schema.org/ItemListOrderAscending',
      itemListElement: Object.entries(testSEOConfig).map(([testType, copies], index) => {
        const copy = copies[resolvedLocale];

        return {
          '@type': 'ListItem',
          position: index + 1,
          name: copy.title,
          url: getCanonicalUrl(`/test/${testType}`, resolvedLocale),
        };
      }),
    },
  };
}
