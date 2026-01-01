import { assert } from '@std/assert';

import { entries, values } from '../lib/entries.ts';

Deno.test('entries', () => {
  const obj = {
    a: 1,
    b: 2,
    c: 3,
  };

  const result = entries(obj);

  assert(result.length === 3);

  assert(result[0][0] === 'a');
  assert(result[0][1] === 1);
});

Deno.test('values', () => {
  const obj = {
    a: 1,
    b: 2,
    c: 3,
  };

  const result = values(obj);

  assert(result.length === 3);

  assert(result[0] === 1);
  assert(result[1] === 2);
});
