import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeSearchConsolePrivateKey } from '../src/server/seo/searchConsole';

test('preserves a cPanel-safe escaped PEM value', () => {
  const value = '-----BEGIN PRIVATE KEY-----\\nQUJDRA==\\n-----END PRIVATE KEY-----';
  assert.equal(
    normalizeSearchConsolePrivateKey(value),
    '-----BEGIN PRIVATE KEY-----\nQUJDRA==\n-----END PRIVATE KEY-----',
  );
});

test('restores a missing PEM opening line from a cPanel value', () => {
  const value = '\\nQUJDRA==\\n-----END PRIVATE KEY-----\\n';
  assert.equal(
    normalizeSearchConsolePrivateKey(value),
    '-----BEGIN PRIVATE KEY-----\nQUJDRA==\n-----END PRIVATE KEY-----',
  );
});
