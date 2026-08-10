const assert = require('node:assert/strict');
const { test } = require('node:test');
const { generateSitemap } = require('./generate-sitemap');

const sitemap = generateSitemap();

test('sitemap contains all indexable localized routes', () => {
  assert.equal((sitemap.match(/<url>/g) || []).length, 30);
  assert.match(sitemap, /https:\/\/bm\.chaosyn\.com\/test\/chimp/);
  assert.match(sitemap, /https:\/\/bm\.chaosyn\.com\/en\/test\/schulte/);
  assert.match(sitemap, /https:\/\/bm\.chaosyn\.com\/blog\/stroop-effect-explained/);
});

test('sitemap excludes non-indexable or untranslated routes', () => {
  assert.doesNotMatch(sitemap, /\/practice/);
  assert.doesNotMatch(sitemap, /https:\/\/bm\.chaosyn\.com\/en\/blog/);
});

test('localized routes expose reciprocal language alternatives', () => {
  assert.match(sitemap, /hreflang="zh-CN" href="https:\/\/bm\.chaosyn\.com\/test\/reaction"/);
  assert.match(sitemap, /hreflang="en-US" href="https:\/\/bm\.chaosyn\.com\/en\/test\/reaction"/);
  assert.match(sitemap, /hreflang="x-default" href="https:\/\/bm\.chaosyn\.com\/test\/reaction"/);
});
