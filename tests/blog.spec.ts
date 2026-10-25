import { test, expect } from '@playwright/test';
import { readFile, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import published from './published-posts.json' with { type: 'json' };

test('preserves every published source and URL across public indexes', async ({ request }) => {
  const html = await (await request.get('/')).text();
  const index = JSON.parse(html.match(/<script[^>]*id="search-data"[^>]*>([\s\S]*?)<\/script>/)![1]) as {url:string;title:string}[];
  const urls = index.map(p => p.url);
  for (const [file, url, hash] of published) {
    expect(urls).toContain(url);
    expect(createHash('sha256').update(await readFile(file)).digest('hex')).toBe(hash);
    if (url.endsWith('.html')) expect((await stat(`dist${url}`)).isFile()).toBe(true);
    const response = await request.get(url);
    expect(response.status(), url).toBe(200);
    expect(await response.text()).toContain('<article');
  }
  expect(index).toHaveLength(published.length);
  const feed = await (await request.get('/feed.xml')).text();
  const sitemap = await (await request.get('/sitemap.xml')).text();
  for (const [, url] of published) {
    expect(feed).toContain(url);
    expect(sitemap).toContain(url);
  }
});

test('search works by keyboard and routes to a real article; theme persists', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('/');
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('searchbox').fill('pivottable');
  const first = page.locator('.search-results a').first();
  await expect(first).toBeVisible();
  const title = await first.locator('strong').textContent();
  await first.click();
  await expect(page.locator('main h1')).toHaveText(title!);
  await page.getByRole('button', { name: '어두운 테마로 변경' }).click();
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
  await expect(page.getByRole('button', { name:'밝은 테마로 변경' })).toHaveAttribute('aria-pressed','true');
  await page.getByRole('button', { name:'글 검색' }).click();
  await page.getByRole('searchbox').fill('존재하지않는검색어_9843');
  await expect(page.locator('.search-status')).toContainText('검색 결과가 없습니다');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
});

test('series index and next article preserve chronological reading', async ({ page }) => {
  await page.goto('/series/ai-agent-pipeline/');
  const links = page.locator('.post-row h3 a');
  await expect(links).toHaveCount(10);
  await links.first().click();
  await page.locator('.series-index summary').click();
  await expect(page.locator('.series-index li')).toHaveCount(10);
  await expect(page.locator('.series-index li.current')).toHaveCount(1);
  const next = page.locator('.post-navigation > div').last().getByRole('link');
  const nextTitle = await next.locator('strong').textContent();
  await next.click();
  await expect(page.locator('main h1')).toHaveText(nextTitle!);
});

test('mobile navigation, category filters and long articles fit the viewport', async ({ page }) => {
  await page.setViewportSize({width:390,height:844});
  await page.goto('/');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.locator('.more-link').click();
  await page.getByRole('button',{name:'AI-Agent',exact:true}).click();
  await expect(page.locator('.archive-entry:visible')).toHaveCount(10);
  await page.locator('.archive-entry:visible h3 a').first().click();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await expect(page.locator('main h1')).toBeVisible();
  await page.getByRole('link',{name:'소개',exact:true}).click();
  await expect(page.locator('.about-prose')).toContainText('기술 블로그이면서 개발 일기입니다');
});

test('legacy Docker screenshots wrap in rows and retain their natural aspect ratios', async ({ page }) => {
  await page.goto('/blog/2022/06/16/starting-docker/');
  const image = page.locator('.prose img[src$="influxdb-01.png"]');
  const gallery = image.locator('..');
  const items = gallery.locator('img');
  await expect(items).toHaveCount(4);
  const desktop = await items.evaluateAll(imgs => imgs.map(node => {const img=node as HTMLImageElement;
    const r=img.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height,nw:img.naturalWidth,nh:img.naturalHeight};
  }));
  expect(Math.abs(desktop[0].y-desktop[1].y)).toBeLessThan(3);
  expect(desktop[2].y).toBeGreaterThan(desktop[0].y+50);
  expect(desktop[1].x).toBeGreaterThan(desktop[0].x+100);
  for(const img of desktop) expect(Math.abs(img.h/img.w-img.nh/img.nw)).toBeLessThan(.02);
  await page.setViewportSize({width:390,height:844});
  const mobile=await items.evaluateAll(imgs=>imgs.map(node=>{const img=node as HTMLImageElement;const r=img.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height,nw:img.naturalWidth,nh:img.naturalHeight}}));
  for(let i=0;i<mobile.length;i++){
    expect(mobile[i].w).toBeGreaterThan(300);
    expect(Math.abs(mobile[i].h/mobile[i].w-mobile[i].nh/mobile[i].nw)).toBeLessThan(.02);
    if(i) expect(mobile[i].y).toBeGreaterThan(mobile[i-1].y+mobile[i-1].h);
  }
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test('all published articles fit a narrow 320px reading viewport', async ({ page }) => {
  test.setTimeout(60000);
  await page.setViewportSize({width:320,height:800});
  const overflow:string[]=[];
  for(const [,url] of published){
    await page.goto(url);
    if(url.includes('math-permutation')) { await page.waitForSelector('.MathJax_CHTML'); await page.evaluate(()=>new Promise<void>(resolve=>(window as any).MathJax.Hub.Queue(resolve))); }
    if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1))overflow.push(url);
  }
  expect(overflow).toEqual([]);
});
