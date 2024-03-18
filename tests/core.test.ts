import { assertFalse } from 'https://deno.land/std@0.219.0/assert/assert_false.ts';
import { assert } from 'https://deno.land/std@0.219.0/assert/mod.ts';
import { z } from 'zod';

import { RULE_ACTION, RULE_PROGRESS, defineAPI } from '../api/api.ts';
import { STATES } from '../api/states.ts';
import * as core from '../rules/core.ts';

Deno.test('actions -join', async () => {
  const api = await defineAPI();
  const startState: z.infer<typeof STATES> = {
    core: {
      id: 'core',
      players: {
        active: 'test-user-a',
        list: ['test-user-a', 'test-user-b'],
      },
    },
    example: {},
  };

  const module = RULE_ACTION.parse(core.HANDLERS);

  const out = await module.action({
    states: startState,
    api,
    action: { type: 'join', payload: { name: 'test-user-c' } },
  });

  assert(out?.core);
  assert(out?.core?.players.list.includes('test-user-c'));
});

Deno.test('actions -leave', async () => {
  const api = await defineAPI();
  const startState: z.infer<typeof STATES> = {
    core: {
      id: 'core',
      players: {
        active: 'test-user-a',
        list: ['test-user-a', 'test-user-b'],
      },
    },
    example: {},
  };

  const module = RULE_ACTION.parse(core.HANDLERS);

  const out = await module.action({
    states: startState,
    api,
    action: { type: 'leave', payload: { name: 'test-user-b' } },
  });

  assert(out?.core);
  assertFalse(out?.core?.players.list.includes('test-user-b'));
});

Deno.test('actions -leave -active player', async () => {
  const api = await defineAPI();
  const startState: z.infer<typeof STATES> = {
    core: {
      id: 'core',
      players: {
        active: 'test-user-a',
        list: ['test-user-a', 'test-user-b'],
      },
    },
    example: {},
  };

  const module = RULE_ACTION.parse(core.HANDLERS);

  const out = await module.action({
    states: startState,
    api,
    action: { type: 'leave', payload: { name: 'test-user-a' } },
  });

  assertFalse(out?.core?.players.list.includes('test-user-a'));
  assert(out?.core?.players.active === 'test-user-b');
});

Deno.test('progress', async () => {
  const api = await defineAPI();
  const startState: z.infer<typeof STATES> = {
    core: {
      id: 'core',
      players: {
        active: 'test-user-a',
        list: ['test-user-a', 'test-user-b'],
      },
    },
    example: {},
  };

  const module = RULE_PROGRESS.parse(core.HANDLERS);

  const out = await module.progress({
    states: startState,
    api,
  });

  assertFalse(out?.core?.players.active === 'test-user-a');
});
