// next-sitemap.config.ts
import type { IConfig } from 'next-sitemap';

const config: IConfig = {
  siteUrl: 'https://yong-an-tea.vercel.app', // ✅ 記得換成正式網域
  generateRobotsTxt: true,
  sitemapSize: 5000,
  changefreq: 'daily',
  priority: 0.7,
};

export default config;
