const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

const customNavigationPages = [
  'assistant',
  'toolbox',
  'search',
  'mine',
  'article-detail',
  'quote',
  'plan',
  'ai-chat'
];

test('app exposes a reusable top spacer calculator for custom navigation pages', () => {
  const appJs = read('miniprogram/app.js');

  assert.match(appJs, /getTopSpacerHeight\s*\(/, 'App should expose getTopSpacerHeight() for pages that need custom navigation spacing');
  assert.match(appJs, /getMenuButtonBoundingClientRect/, 'top spacer should account for the WeChat capsule button');
  assert.match(appJs, /statusBarHeight/, 'top spacer should fall back to the status bar height');
});

test('view-based mini program pages keep native page scrolling enabled', () => {
  const appConfig = JSON.parse(read('miniprogram/app.json'));

  assert.notEqual(
    appConfig.renderer,
    'skyline',
    'view-based pages should not opt into Skyline because Skyline does not provide page-level scrolling'
  );
  assert.equal(
    appConfig.componentFramework,
    undefined,
    'view-based pages should not opt into the Skyline glass-easel component framework without scroll-view wrappers'
  );
});

test('non-home pages reserve top safe area under the global custom navigation bar', () => {
  for (const page of customNavigationPages) {
    const pageBase = `miniprogram/pages/${page}/${page}`;
    const js = read(`${pageBase}.js`);
    const wxml = read(`${pageBase}.wxml`);

    assert.match(js, /topSpacerHeight\s*:/, `${page} page data should include topSpacerHeight`);
    assert.match(js, /setLayoutMetrics\s*\(/, `${page} page should set layout metrics on load`);
    assert.match(js, /getTopSpacerHeight\s*\(/, `${page} page should use the app-level top spacer calculator`);
    assert.match(wxml, /class="page-safe-top"/, `${page} page should render a top safe-area spacer`);
    assert.match(wxml, /height:\s*{{topSpacerHeight}}rpx/, `${page} safe-area spacer should bind to topSpacerHeight`);
  }
});

test('shared mini program styles define safe page spacing for custom navigation pages', () => {
  const appWxss = read('miniprogram/app.wxss');

  assert.match(appWxss, /\.page-safe-top\s*\{/, 'shared styles should include .page-safe-top');
  assert.match(appWxss, /\.safe-page\s*\{/, 'shared styles should include .safe-page wrapper spacing');
  assert.match(appWxss, /padding-bottom:\s*calc\(/, 'safe page spacing should reserve bottom safe-area room above tabBar');
});
