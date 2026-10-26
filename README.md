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

Before publishing, run `npm run check`, `npm run build`, and `npm test`. Commit the Markdown and related assets to `main`, then push to save the source. Deploy explicitly with `npm run deploy` (GitHub CLI authentication is required). This waits for deployment and registers only the future publication times found in that approved version. Future-dated posts remain excluded until a build runs at or after their publication time. The generated `publish-scheduled-<approved SHA>.yml` contains the UTC dates of the approved posts, pins both the source and reusable workflow to the approved commit, and disables only its own revision after the final publication. Registering a new calendar disables previous calendars. Each revision has a separate workflow identity so an older run cannot disable a newer calendar. It does not poll every few minutes or deploy newer unapproved source changes. GitHub cron has no year field; each execution checks the full timestamp and the currently approved revision. GitHub scheduling may be delayed or dropped; `npm run schedule` refreshes the calendar from the published version, and `npm run deploy` can recover a missed release. No future posts means no active scheduled execution. A publication time that includes seconds is rounded up to the next minute for scheduling. GitHub may disable scheduled workflows after 60 days without repository activity; check Actions for distant publication dates. No separate database or publication API is required.
