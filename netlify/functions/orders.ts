// Netlify Functions v2 wrapper: same handler as Vercel's api/orders.
import { GET } from '../../api/orders';

export default async (request: Request): Promise<Response> =>
  request.method === 'GET'
    ? GET(request)
    : new Response(JSON.stringify({ error: 'method_not_allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json', Allow: 'GET' },
      });

export const config = { path: '/api/orders' };
