// Netlify Functions v2 wrapper: same handler as Vercel's api/maib/create.
import { POST } from '../../api/maib/create';

export default async (request: Request): Promise<Response> =>
  request.method === 'POST'
    ? POST(request)
    : new Response(JSON.stringify({ error: 'method_not_allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json', Allow: 'POST' },
      });

export const config = { path: '/api/maib/create' };
