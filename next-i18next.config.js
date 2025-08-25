module.exports = {
  i18n: {
    defaultLocale: 'zh',
    locales: ['zh', 'en'],
    localeDetection: false,
  },
  fallbackLng: {
    default: ['zh'],
  },
  debug: process.env.NODE_ENV === 'development',
  reloadOnPrerender: process.env.NODE_ENV === 'development',
  localePath:
    typeof window === 'undefined'
      ? require('path').resolve('./public/locales')
      : '/locales',
};