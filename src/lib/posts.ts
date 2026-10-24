import { getCollection, type CollectionEntry } from 'astro:content';
export type Post = CollectionEntry<'posts'>;
export async function posts() {
  return (await getCollection('posts')).filter(p => p.data.published && p.data.date.getTime() <= Date.now()).sort((a,b) => b.data.date.getTime() - a.data.date.getTime() || a.id.localeCompare(b.id));
}
export function postUrl(post: Post) {
  const match = post.id.match(/^(\d{4})-(\d{2})-(\d{2})-(.+)$/);
  if (!match) throw new Error(`Post filename needs a date: ${post.id}`);
  const title = match[4];
  const parts = new Intl.DateTimeFormat('en-CA', {year:'numeric',month:'2-digit',day:'2-digit',timeZone:'Asia/Seoul'}).formatToParts(post.data.date);
  const value = (type: string) => parts.find(p => p.type === type)!.value;
  const path = post.data.permalink ?? '/:categories/:year/:month/:day/:title.html';
  return path.replace(':year',value('year')).replace(':month',value('month')).replace(':day',value('day')).replace(':title',title).replace(':categories',post.data.categories.map(c => c.toLowerCase().replace(/\s+/g,'-')).join('/'));
}
export function summary(post: Post) {
  const text = post.data.description || post.data.excerpt || post.body || '';
  return text.replace(/<!--[\s\S]*?-->/g,'').replace(/```[\s\S]*?```/g,'').replace(/!\[[^\]]*\]\([^)]*\)/g,'').replace(/\[([^\]]+)\]\([^)]*\)/g,'$1').replace(/<[^>]*>/g,'').replace(/[#>*_`~]/g,'').replace(/\s+/g,' ').trim().slice(0,145);
}
export const dateLabel = (date: Date) => new Intl.DateTimeFormat('ko-KR', {year:'numeric',month:'2-digit',day:'2-digit', timeZone:'Asia/Seoul'}).format(date).replace(/\.$/,'');
export function readMinutes(post: Post) { return Math.max(1, Math.ceil((post.body || '').replace(/\s/g,'').length / 700)); }
const names: Record<string,string> = { 'claude-code':'AI와 함께 일하는 방식', 'vue-pivottable':'Vue Pivottable 운영기', 'ai-agent-pipeline':'AI 에이전트 파이프라인', 'economic-dashboard':'경제지표 대시보드 개발기', 'making-trading-bot':'트레이딩 봇 만들기', 'ai-dlc':'AI와 함께 만드는 개발 과정' };
export const seriesName = (name: string) => names[name] || name.replace(/-/g,' ');
const categorySeries: Record<string,string> = { 'AI-Agent':'ai-agent-pipeline', 'AI-DLC':'economic-dashboard', 'Quant':'making-trading-bot', 'Vue Pivottable':'vue-pivottable' };
export const seriesId = (post: Post) => post.data.series || post.data.categories.map(c => categorySeries[c]).find(Boolean);
export function seriesGroups(all: Post[]) {
  const groups = new Map<string, Post[]>();
  for (const post of all) { const id = seriesId(post); if (id) groups.set(id,[...(groups.get(id) || []),post]); }
  return [...groups].map(([id,items]) => ({id,name:seriesName(id),items:items.sort((a,b) => a.data.date.getTime()-b.data.date.getTime())})).sort((a,b) => b.items.at(-1)!.data.date.getTime()-a.items.at(-1)!.data.date.getTime());
}
