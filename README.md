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

The production site is https://seungwoo321.github.io/. The `main` branch deploys through `.github/workflows/astro-pages.yml` only on manual dispatch. Pushing source changes does not deploy the site. The workflow builds static files in `dist/` and deploys them to GitHub Pages.

AdSense and Google Analytics load only on the production hostname. Development previews show reserved ad spaces; production uses the existing AdSense Auto ads settings. Search verification files and `ads.txt` are kept in `public/`.

Before publishing, run `npm run check`, `npm run build`, and `npm test`. Commit the Markdown and related assets to `main`, then push to save the source. Deploy explicitly with `gh workflow run astro-pages.yml --ref main` or the Actions page. Future-dated posts remain excluded until a build runs at or after their publication time. No separate database or publication API is required.
