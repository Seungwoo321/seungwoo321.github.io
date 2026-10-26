import { getCollection } from 'astro:content';
import { publicationTime } from '../../lib/posts';
export async function GET() {
  const futureDates=[...new Set((await getCollection('posts'))
    .filter(post=>post.data.published && post.data.date.getTime()>publicationTime)
    .map(post=>post.data.date.toISOString()))].sort();
  return Response.json({revision:process.env.PUBLICATION_REVISION ?? null,builtAt:new Date(publicationTime).toISOString(),futureDates});
}
