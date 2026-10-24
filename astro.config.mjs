import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import { readFile, rm, writeFile } from 'node:fs/promises';
import legacyHtml from './src/lib/legacy-html.mjs';
export default defineConfig({
  site: 'https://seungwoo321.github.io',
  output: 'static',
  trailingSlash: 'always',
  devToolbar: { enabled: false },
  integrations: [{
    name: 'legacy-html-files',
    hooks: {
      'astro:build:done': async ({ dir, pages }) => {
        // Preserve the original Jekyll .html URLs alongside directory-style post URLs.
        for (const { pathname } of pages.filter(page => /\.html\/?$/.test(page.pathname))) {
          const file = new URL(pathname.replace(/^\/|\/$/g, ''), dir);
          const html = await readFile(new URL(`${file.href}/index.html`));
          await rm(file, { recursive: true });
          await writeFile(file, html);
        }
      },
    },
  }],
  markdown: { processor: unified({ shikiConfig: { theme: 'github-dark' }, rehypePlugins: [legacyHtml] }) },
});
