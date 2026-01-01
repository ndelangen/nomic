import { assert, assertThrows } from '@std/assert';

import { RULE, RULE_ACTION, RULE_CHECK, RULE_PROGRESS } from '../api/api.ts';

Deno.test('validates a check rule', () => {
  const dummyRule = RULE.parse({
    check: async () => {},
  });
  assert(dummyRule);
});

Deno.test('validates a progress rule', () => {
  const dummyRule = RULE.parse({
    progress: async () => {},
  });
  assert(dummyRule);
});

Deno.test('validates an action rule', () => {
  const dummyRule = RULE.parse({
    action: async () => {},
  });
  assert(dummyRule);
});

Deno.test('validates a combined rule', async (t) => {
  await t.step('A & B', () => {
    const dummyRule = RULE.parse({
      action: async () => {},
      check: async () => {},
    });
    assert(dummyRule);
  });

  await t.step('A & C', () => {
    const dummyRule = RULE.parse({
      action: async () => {},
      check: async () => {},
    });
    assert(dummyRule);
  });

  await t.step('B & C', () => {
    const dummyRule = RULE.parse({
      action: async () => {},
      check: async () => {},
    });
    assert(dummyRule);
  });

  await t.step('A & B & C', () => {
    const dummyRule = RULE.parse({
      action: async () => {},
      check: async () => {},
      progress: async () => {},
    });
    assert(dummyRule);
  });
});

Deno.test('rejects invalid rule', () => {
  assertThrows(() => {
    RULE.parse({});
  });
});

Deno.test('RULE_ACTION', async (t) => {
  await t.step('empty = invalid', () => {
    assertThrows(() => {
      RULE_ACTION.parse({});
    });
  });
  await t.step('no action = invalid', () => {
    assertThrows(() => {
      RULE_ACTION.parse({ id: 'test' });
    });
  });
  await t.step('valid', () => {
    assert(
      RULE_ACTION.parse({
        id: '',
        action: () => {},
      }),
    );
    assert(
      RULE_ACTION.parse({
        id: '',
        action: () => {},
      }),
    );
    assert(
      RULE_ACTION.parse({
        id: '',
        action: () => {},
        check: () => {},
      }),
    );
    assert(
      RULE_ACTION.parse({
        id: '',
        action: () => {},
        check: () => {},
        progress: () => {},
      }),
    );
  });
});

Deno.test('RULE_CHECK', async (t) => {
  await t.step('empty = invalid', () => {
    assertThrows(() => {
      RULE_CHECK.parse({});
    });
  });
  await t.step('no action = invalid', () => {
    assertThrows(() => {
      RULE_CHECK.parse({ id: 'test' });
    });
  });
  await t.step('valid', () => {
    assert(
      RULE_CHECK.parse({
        id: '',
        check: () => {},
      }),
    );
    assert(
      RULE_CHECK.parse({
        id: '',
        check: () => {},
      }),
    );
    assert(
      RULE_CHECK.parse({
        id: '',
        action: () => {},
        check: () => {},
      }),
    );
    assert(
      RULE_CHECK.parse({
        id: '',
        action: () => {},
        check: () => {},
        progress: () => {},
      }),
    );
  });
});

Deno.test('RULE_PROGRESS', async (t) => {
  await t.step('empty = invalid', () => {
    assertThrows(() => {
      RULE_PROGRESS.parse({});
    });
  });
  await t.step('no action = invalid', () => {
    assertThrows(() => {
      RULE_PROGRESS.parse({ id: 'test' });
    });
  });
  await t.step('valid', () => {
    assert(
      RULE_PROGRESS.parse({
        id: '',
        progress: () => {},
      }),
    );
    assert(
      RULE_PROGRESS.parse({
        id: '',
        progress: () => {},
      }),
    );
    assert(
      RULE_PROGRESS.parse({
        id: '',
        action: () => {},
        progress: () => {},
      }),
    );
    assert(
      RULE_PROGRESS.parse({
        id: '',
        action: () => {},
        check: () => {},
        progress: () => {},
      }),
    );
  });
});
