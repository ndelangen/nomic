// url_test.ts
import { assert, assertThrows } from 'https://deno.land/std@0.219.0/assert/mod.ts';

import { defineRule } from '../core/api.ts';

Deno.test('validates a check rule', async (t) => {
  await t.step('no load function', () => {
    const dummyRule = defineRule({
      id: 'a',
      check: async () => {},
    });
    assert(dummyRule);
  });

  await t.step('with load function', () => {
    const dummyRule = defineRule({
      id: 'a',
      load: async () => {},
      check: async () => {},
    });
    assert(dummyRule);
  });
});

Deno.test('validates a progress rule', async (t) => {
  await t.step('no load function', () => {
    const dummyRule = defineRule({
      id: 'a',
      progress: async () => {},
    });
    assert(dummyRule);
  });

  await t.step('with load function', () => {
    const dummyRule = defineRule({
      id: 'a',
      load: async () => {},
      progress: async () => {},
    });
    assert(dummyRule);
  });
});

Deno.test('validates an action rule', async (t) => {
  await t.step('no load function', () => {
    const dummyRule = defineRule({
      id: 'a',
      action: async () => {},
    });
    assert(dummyRule);
  });

  await t.step('with load function', () => {
    const dummyRule = defineRule({
      id: 'a',
      load: async () => {},
      action: async () => {},
    });
    assert(dummyRule);
  });
});

Deno.test('validates a combined rule', async (t) => {
  await t.step('A & B', () => {
    const dummyRule = defineRule({
      id: 'a',
      action: async () => {},
      check: async () => {},
    });
    assert(dummyRule);
  });

  await t.step('A & C', () => {
    const dummyRule = defineRule({
      id: 'a',
      action: async () => {},
      check: async () => {},
    });
    assert(dummyRule);
  });

  await t.step('B & C', () => {
    const dummyRule = defineRule({
      id: 'a',
      action: async () => {},
      check: async () => {},
    });
    assert(dummyRule);
  });

  await t.step('A & B & C', () => {
    const dummyRule = defineRule({
      id: 'a',
      load: async () => {},
      action: async () => {},
      check: async () => {},
      progress: async () => {},
    });
    assert(dummyRule);
  });
});

Deno.test('rejects invalid rule', () => {
  assertThrows(() => {
    defineRule({
      id: 'a',
    } as any);
  });
});
