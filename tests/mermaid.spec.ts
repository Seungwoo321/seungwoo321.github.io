import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import published from './published-posts.json' with { type: 'json' };

const diagrams = published.flatMap(([file, url]) => {
  const count = [...readFileSync(file, 'utf8').matchAll(/^```mermaid\s*$/gm)].length;
  return count ? [{ url, count }] : [];
});

for (const { url, count } of diagrams) {
  test(`renders all ${count} Mermaid diagrams in ${url}`, async ({ page }) => {
    await page.goto(url);
    await expect(page.locator('.mermaid-diagram > svg')).toHaveCount(count);
    await expect(page.locator('.prose pre[data-language="mermaid"]')).toHaveCount(0);
    await expect(page.locator('.mermaid-diagram .error-icon')).toHaveCount(0);
    for (const diagram of await page.locator('.mermaid-diagram > svg').all()) {
      await expect(diagram).toBeVisible();
      expect(await diagram.locator('text, foreignObject').count()).toBeGreaterThan(0);
      const size = await diagram.evaluate(element => {
        const svg = element as SVGSVGElement;
        return { width: svg.getBoundingClientRect().width, expected: svg.viewBox.baseVal.width, height: svg.getBoundingClientRect().height };
      });
      expect(Math.abs(size.width - size.expected)).toBeLessThan(1);
      expect(size.height).toBeGreaterThan(30);
    }
    await page.setViewportSize({ width: 320, height: 800 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  });
}

test('Mermaid follows theme changes and ordinary pages do not load its renderer', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', request => requests.push(request.url()));
  await page.goto('/blog/2020/03/13/basic-css/');
  expect(requests.some(url => /mermaid.*\.js/.test(url))).toBe(false);
  await page.goto(diagrams[0].url);
  const diagram = page.locator('.mermaid-diagram > svg').first();
  await expect(diagram).toBeVisible();
  const light = await diagram.locator('style').textContent();
  await page.getByRole('button', { name: '어두운 테마로 변경' }).click();
  await expect.poll(() => diagram.locator('style').textContent()).not.toBe(light);
  await expect(diagram).toBeVisible();
  await page.getByRole('button', { name: '밝은 테마로 변경' }).click();
  await expect.poll(() => diagram.locator('style').textContent()).toBe(light);
});
