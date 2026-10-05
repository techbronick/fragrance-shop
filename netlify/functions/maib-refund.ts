// Netlify Functions v2 wrapper: same handler as Vercel's api/maib/refund.
import { POST } from '../../api/maib/refund';

export default async (request: Request): Promise<Response> =>
  request.method === 'POST'
    ? POST(request)
    : new Response(JSON.stringify({ error: 'method_not_allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json', Allow: 'POST' },
      });

export const config = { path: '/api/maib/refund' };
