# DEV LOG

A custom, Korean-language Astro blog. Markdown in `_posts/` is the content source.

```sh
npm install
npm start -- --host 127.0.0.1 --port 4321
npm run check
npm run build
npm test
```

Posts retain their existing `permalink`, `date`, `series`, tags, and categories. Unpublished and future-dated posts are excluded from public pages, search, feeds, and sitemap. Series are read chronologically.

This checkout is a design preview. Ad spaces are visual layout reservations; no live advertising requests are sent. The site is generated as static files in `dist/`. It has no publication API or production deployment workflow.
