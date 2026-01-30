import { expect, test } from 'bun:test';

import { entries, values } from '../lib/entries.ts';

test('entries', () => {
  const obj = {
    a: 1,
    b: 2,
    c: 3,
  };

  const result = entries(obj);

  expect(result.length).toBe(3);

  expect(result[0][0]).toBe('a');
  expect(result[0][1]).toBe(1);
});

test('values', () => {
  const obj = {
    a: 1,
    b: 2,
    c: 3,
  };

  const result = values(obj);

  expect(result.length).toBe(3);

  expect(result[0]).toBe(1);
  expect(result[1]).toBe(2);
});
