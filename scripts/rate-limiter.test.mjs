import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRateLimitedFetcher } from './rate-limiter.mjs';

test('inserts a delay between consecutive calls', async () => {
  const calls = [];
  const fakeFetch = async () => {
    calls.push(Date.now());
    return new Response('ok', { status: 200 });
  };
  const fetch = createRateLimitedFetcher({
    fetchImpl: fakeFetch,
    minDelayMs: 100,
    maxDelayMs: 110,
    backoffOn: [],
    userAgents: ['ua/1'],
  });

  await fetch('http://example.test/1');
  await fetch('http://example.test/2');
  await fetch('http://example.test/3');

  assert.equal(calls.length, 3);
  assert.ok(calls[1] - calls[0] >= 100, `gap1 was ${calls[1] - calls[0]}ms`);
  assert.ok(calls[2] - calls[1] >= 100, `gap2 was ${calls[2] - calls[1]}ms`);
});

test('rotates User-Agent header across calls', async () => {
  const uas = [];
  const fakeFetch = async (_url, opts) => {
    uas.push(opts?.headers?.['User-Agent']);
    return new Response('ok', { status: 200 });
  };
  const fetch = createRateLimitedFetcher({
    fetchImpl: fakeFetch,
    minDelayMs: 0,
    maxDelayMs: 1,
    userAgents: ['ua-A', 'ua-B', 'ua-C'],
  });

  await fetch('http://example.test/1');
  await fetch('http://example.test/2');
  await fetch('http://example.test/3');
  await fetch('http://example.test/4');

  assert.deepEqual(uas, ['ua-A', 'ua-B', 'ua-C', 'ua-A']);
});

test('throws after 3 consecutive rate-limit responses', async () => {
  const fakeFetch = async () => new Response('rate-limited', { status: 429 });
  const fetch = createRateLimitedFetcher({
    fetchImpl: fakeFetch,
    minDelayMs: 0,
    maxDelayMs: 1,
    backoffOn: [429],
    userAgents: ['ua/1'],
  });

  // Patch setTimeout for the duration of the test so the 5min/15min sleeps
  // don't actually wait. The module uses setTimeout via the sleep helper.
  const realSetTimeout = globalThis.setTimeout;
  globalThis.setTimeout = (fn) => realSetTimeout(fn, 0);

  try {
    await assert.rejects(
      () => fetch('http://example.test/x'),
      /rate-limited 3 times consecutively/,
    );
  } finally {
    globalThis.setTimeout = realSetTimeout;
  }
});
