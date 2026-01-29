// deno-lint-ignore-file no-explicit-any
import { assert, assertRejects, assertFalse } from '@std/assert';
import { z } from 'zod';

import { RULE_ACTION, RULE_PROGRESS, RULE_CHECK, defineAPI } from '../api/api.ts';
import { STATES } from '../api/states.ts';
import * as core from '../rules/core.ts';

const createStates = () => {
  return {
    core: {
      v: 1,
      players: {
        active: 'test-user-a',
        list: ['test-user-a', 'test-user-b'],
      },
      turns: {
        current: 1,
      },
    },
    example: {
      v: 1,
    },
  } satisfies z.infer<typeof STATES>;
};

Deno.test('actions -join', async () => {
  const api = await defineAPI();
  const states = createStates();

  const module = RULE_ACTION.parse(core.HANDLERS);

  const out = await module.action({
    states,
    api,
    action: { type: 'join', payload: { name: 'test-user-c' } },
  });

  assert(out?.core);
  assert(out?.core?.players.list.includes('test-user-c'));
});

Deno.test('actions -join (fail when exists)', async () => {
  const api = await defineAPI();
  const states = createStates();

  const module = RULE_ACTION.parse(core.HANDLERS);

  await assertRejects(async () => {
    await module.action({
      states,
      api,
      action: { type: 'join', payload: { name: 'test-user-a' } },
    });
  });
});

Deno.test('actions -leave', async () => {
  const api = await defineAPI();
  const states = createStates();

  const module = RULE_ACTION.parse(core.HANDLERS);

  const out = await module.action({
    states,
    api,
    action: { type: 'leave', payload: { name: 'test-user-b' } },
  });

  assert(out?.core);
  assertFalse(out?.core?.players.list.includes('test-user-b'));
});

Deno.test('actions -leave (fail when missing)', async () => {
  const api = await defineAPI();
  const states = createStates();

  const module = RULE_ACTION.parse(core.HANDLERS);

  await assertRejects(async () => {
    await module.action({
      states,
      api,
      action: { type: 'leave', payload: { name: 'test-user-c' } },
    });
  });
});

Deno.test('actions -leave -active player', async () => {
  const api = await defineAPI();
  const states = createStates();

  const module = RULE_ACTION.parse(core.HANDLERS);

  const out = await module.action({
    states,
    api,
    action: { type: 'leave', payload: { name: 'test-user-a' } },
  });

  assertFalse(out?.core?.players.list.includes('test-user-a'));
  assert(out?.core?.players.active === 'test-user-b');
});

Deno.test('actions -unsupported', async () => {
  const api = await defineAPI();
  const states = createStates();

  const module = RULE_ACTION.parse(core.HANDLERS);

  await assertRejects(async () => {
    await module.action({
      states,
      api,
      // @ts-expect-error (forcing a non-existing action for testing purposes)
      action: { type: 'non-existing-action', payload: { name: 'test-user-c' } },
    });
  });
});

Deno.test('progress', async () => {
  const api = await defineAPI();
  const states = createStates();

  const module = RULE_PROGRESS.parse(core.HANDLERS);

  const out = await module.progress({
    states,
    api,
  });

  assertFalse(out?.core?.players.active === 'test-user-a');
});

Deno.test('check', async () => {
  const states = createStates();

  const module = RULE_CHECK.parse(core.HANDLERS);

  await assertRejects(async () => {
    const api = await defineAPI();
    api.pr = {
      user: {
        login: 'test-user-b',
      },
    } as any;
    await module.check({
      states,
      api,
    });
  });

  const api = await defineAPI();
  api.pr = {
    user: {
      login: 'test-user-a',
    },
  } as any;
  await module.check({
    states,
    api,
  });
});
