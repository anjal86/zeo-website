'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const { sanitize } = require('../runtime/logger');

test('redacts sensitive values recursively', () => {
  const result = sanitize({
    authorization: 'Bearer secret',
    nested: { password: 'secret', safe: 'ok' },
    email: 'person@example.com',
  });

  assert.equal(result.authorization, '[REDACTED]');
  assert.equal(result.nested.password, '[REDACTED]');
  assert.equal(result.nested.safe, 'ok');
  assert.equal(result.email, '[REDACTED]');
});

test('handles circular values without throwing', () => {
  const value = { safe: true };
  value.self = value;
  assert.equal(sanitize(value).self, '[Circular]');
});
