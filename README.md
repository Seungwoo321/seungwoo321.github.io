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

The production site is https://seungwoo321.github.io/. The `main` branch deploys through `.github/workflows/astro-pages.yml` on push, on manual dispatch, and daily at 09:00 Asia/Seoul for future-dated posts. GitHub schedules can run late. The workflow builds static files in `dist/` and deploys them to GitHub Pages.

AdSense and Google Analytics load only on the production hostname. Development previews show reserved ad spaces; production uses the existing AdSense Auto ads settings. Search verification files and `ads.txt` are kept in `public/`.

Before publishing, run `npm run check`, `npm run build`, and `npm test`. Commit the Markdown and related assets to `main`, then push. No separate database or publication API is required.
