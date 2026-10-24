import rss from '@astrojs/rss';
import { posts, postUrl, summary } from '../lib/posts';
export async function GET(context: { site: URL | undefined }) {return rss({title:'DEV LOG — Seungwoo321',description:'개발하며 겪은 시행착오와 기술 선택의 과정',site:context.site!,items:(await posts()).map(p=>({title:p.data.title,pubDate:p.data.date,description:summary(p),link:postUrl(p)})),customData:'<language>ko-kr</language>'})}
