import { defineConfig, type DefaultTheme, type HeadConfig } from 'vitepress';

const baseUrl = process.env.DEV ? '/' : '/act-master';

const siteUrl = 'https://avil13.github.io/act-master';

export default defineConfig({
  lang: 'en-US',
  title: 'Act-Master',
  description:
    'A frontend-way to separate business logic from application view.',
  base: baseUrl,
  head: getHead(),
  sitemap: {
    hostname: siteUrl,
  },
  markdown: {
    headers: false,
    toc: {
      level: [1],
      shouldAllowNested: false,
    },
  },
  lastUpdated: false,
  cleanUrls: true,
  themeConfig: {
    logo: '/assets/act-master-logo.svg',

    // editLink: {
    //   pattern:
    //     'https://github.com/avil13/act-master/packages/docs/src/:path',
    //   text: 'Edit this page on GitHub',
    // },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/avil13/act-master' },
    ],

    algolia: {
      appId: 'AQG3LF64RJ',
      apiKey: '73ddbc792dc4a93356157a13984e7b4c',

      indexName: 'act-master',
    },

    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', items: getSidebar() },
      {
        text: 'v1',
        items: [
          { text: 'Installation', link: '/v1/action/01-installation' },
          { text: 'Add Action', link: '/v1/action/02-add-action' },
          { text: 'Subscription', link: '/v1/action/03-subscribtion' },
          { text: 'Actions', link: '/v1/action/04-actions' },
          { text: 'Composition API', link: '/v1/action/05-composition-api' },
          { text: 'Testing', link: '/v1/testing/05-testing' },
          { text: 'subsList', link: '/v1/advanced/06-subsList' },
          { text: 'Single Execution', link: '/v1/advanced/07-single-execution' },
          { text: 'Emit Many Results', link: '/v1/advanced/08-emit-many-results' },
          { text: 'fn2act', link: '/v1/advanced/09-function-to-action' },
          { text: 'WebSocket', link: '/v1/tips/web-socket' },
        ],
      },
    ],

    sidebar: getSidebar(),
  },
});

function getSidebar(): DefaultTheme.NavItemWithLink[] {
  return [
    { text: 'Installation', link: '/guide/installation' },
    { text: 'ActMasterAction', link: '/guide/act-master-action' },
    { text: 'exec and subscribe', link: '/guide/exec-and-subscribe' },
    { text: 'Testing', link: '/guide/testing' },
    { text: 'Act-Master-CLI', link: '/guide/cli' },
  ];
}

function getHead(): HeadConfig[] {
  return [
    [
      'link',
      {
        rel: 'icon',
        href: `${baseUrl}/icon.svg`,
        type: 'image/svg+xml',
        sizes: 'any',
      },
    ],
    [
      'link',
      {
        rel: 'icon',
        href: `${baseUrl}/favicon.ico`,
      },
    ], // <!-- 32×32 -->
    [
      'link',
      {
        rel: 'apple-touch-icon',
        href: `${baseUrl}/apple.png`,
      },
    ], // <!-- 180×180 -->
    [
      'link',
      {
        rel: 'manifest',
        href: `${baseUrl}/manifest.json`,
      },
    ],
    ['meta', { name: 'theme-color', content: '#3c8772' }],
    ['meta', { name: 'keywords', content: 'act-master, vue, react, typescript, frontend architecture, business logic, pub/sub, actions, dependency injection, state management, testing' }],

    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:site_name', content: 'Act-Master' }],
    ['meta', { property: 'og:title', content: 'Act-Master' }],
    ['meta', { property: 'og:description', content: 'A frontend-way to separate business logic from application view.' }],
    ['meta', { property: 'og:image', content: `${siteUrl}/apple.png` }],
    ['meta', { property: 'og:url', content: `${siteUrl}/` }],

    ['meta', { name: 'twitter:card', content: 'summary' }],
    ['meta', { name: 'twitter:title', content: 'Act-Master' }],
    ['meta', { name: 'twitter:description', content: 'A frontend-way to separate business logic from application view.' }],
    ['meta', { name: 'twitter:image', content: `${siteUrl}/apple.png` }],
  ];
}
