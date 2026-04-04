import { defineConfig, HeadConfig } from 'vitepress';
import { DefaultTheme } from 'vitepress/types';

const baseUrl = process.env.DEV ? '/' : '/act-master';

export default defineConfig({
  lang: 'en-US',
  title: 'Act-Master',
  description: 'A frontend-way to separate business logic from application view.',
  base: baseUrl,
  head: getHead(),
  lastUpdated: true,
  cleanUrls: true,
  themeConfig: {
    logo: '/assets/act-master-logo.svg',

    editLink: {
      pattern: 'https://github.com/avil13/act-master/edit/master/packages/docs/src/:path',
      text: 'Edit this page on GitHub',
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/avil13/act-master' },
    ],

    nav: [
      {
        text: 'Get Started',
        items: getSidebar(),
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
    { text: 'Act-Master-cli', link: '/guide/cli' },
  ];
}

function getHead(): HeadConfig[] {
  return [
    ['link', { rel: 'icon', href: `${baseUrl}/icon.svg`, type: 'image/svg+xml', sizes: 'any' }],
    ['link', { rel: 'icon', href: `${baseUrl}/favicon.ico` }],
    ['link', { rel: 'apple-touch-icon', href: `${baseUrl}/apple.png` }],
    ['link', { rel: 'manifest', href: `${baseUrl}/manifest.json` }],
    ['meta', { name: 'theme-color', content: '#3c8772' }],
  ];
}
