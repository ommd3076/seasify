/**
 * Cloudflare Pages Function: NOAA CO-OPS Edge API Proxy
 * Provides edge-cached proxying for NOAA CO-OPS REST endpoints to eliminate
 * CORS friction and optimize latency via Cloudflare edge caching.
 */

interface EventContext<Env, P extends string, Data> {
  request: Request;
  env: Env;
  params: Record<P, string>;
  data: Data;
  next: (input?: Request | string, init?: RequestInit) => Promise<Response>;
}

export async function onRequestGet(context: EventContext<unknown, any, unknown>): Promise<Response> {
  const url = new URL(context.request.url);
  const targetParams = url.searchParams;

  // Enforce required NOAA parameters
  if (!targetParams.get('station') || !targetParams.get('product')) {
    return new Response(
      JSON.stringify({
        error: 'Missing required query parameters: "station" and "product" are mandatory.',
      }),
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }

  // Ensure application identifier
  if (!targetParams.get('application')) {
    targetParams.set('application', 'Seasify');
  }

  const noaaUrl = `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?${targetParams.toString()}`;

  try {
    const noaaResponse = await fetch(noaaUrl, {
      headers: {
        'User-Agent': 'Seasify/1.0.0 (Coastal Water-Level Monitoring)',
        Accept: 'application/json',
      },
    });

    if (!noaaResponse.ok) {
      return new Response(
        JSON.stringify({
          error: `NOAA upstream responded with status ${noaaResponse.status}`,
        }),
        {
          status: noaaResponse.status,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    const data = await noaaResponse.text();

    return new Response(data, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=300, s-maxage=300', // 5-minute edge cache
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(
      JSON.stringify({
        error: `Failed to proxy NOAA API: ${message}`,
      }),
      {
        status: 502,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
}
