// scripts/rate-limiter.mjs
//
// Serial-only throttled fetch. Caller never controls concurrency — every
// request goes through the same queue and gets a random delay before it
// fires, except for the very first one.
//
// `fetchImpl` is injectable so unit tests can run in milliseconds without
// touching the network.

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function createRateLimitedFetcher({
  fetchImpl = globalThis.fetch,
  minDelayMs = 2000,
  maxDelayMs = 4000,
  backoffOn = [429, 403],
  userAgents = [
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
  ],
} = {}) {
  let lastCallAt = 0;
  let uaIndex = 0;
  let consecutiveRateLimited = 0;

  return async function fetch(url, opts = {}) {
    // Wait until min delay has elapsed since the last call.
    const targetGap = minDelayMs + Math.random() * (maxDelayMs - minDelayMs);
    const since = Math.max(0, Date.now() - lastCallAt);
    if (lastCallAt > 0 && since < targetGap) {
      await sleep(targetGap - since);
    }

    const ua = userAgents[uaIndex % userAgents.length];
    uaIndex++;

    lastCallAt = Date.now();
    const res = await fetchImpl(url, {
      ...opts,
      headers: {
        ...(opts.headers || {}),
        'User-Agent': ua,
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/avif,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });

    // Maximum 2 retries (5min + 15min) before the 3rd consecutive rate-limit
    // throws. Stack growth is bounded at 3 frames.
    if (backoffOn.includes(res.status)) {
      consecutiveRateLimited++;
      if (consecutiveRateLimited === 1) {
        await sleep(5 * 60 * 1000);
        return fetch(url, opts); // retry once
      }
      if (consecutiveRateLimited === 2) {
        await sleep(15 * 60 * 1000);
        return fetch(url, opts);
      }
      // 3rd consecutive — give up, caller decides what to do.
      throw new Error('rate-limited 3 times consecutively; stopping');
    }
    consecutiveRateLimited = 0;
    return res;
  };
}
