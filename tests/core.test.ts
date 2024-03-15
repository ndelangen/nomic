import { assertFalse } from 'https://deno.land/std@0.219.0/assert/assert_false.ts';
import { assert } from 'https://deno.land/std@0.219.0/assert/mod.ts';
import { z } from 'zod';

import { ActionRuleFactory, ProgressRuleFactory, defineAPI } from '../api/api.ts';
import core from '../core/rule.ts';

Deno.test('actions -join', async () => {
  const api = await defineAPI();
  const startState = {
    id: 'core',
    players: {
      active: 'test-user-a',
      list: ['test-user-a', 'test-user-b'],
    },
  };

  const module = ActionRuleFactory(z.unknown()).parse(core);

  module.action({
    state: startState,
    core: startState,
    api,
    action: { type: 'join', payload: { name: 'test-user-c' } },
  });

  assert(startState.players.list.includes('test-user-c'));
});

Deno.test('actions -leave', async () => {
  const api = await defineAPI();
  const startState = {
    id: 'core',
    players: {
      active: 'test-user-a',
      list: ['test-user-a', 'test-user-b'],
    },
  };

  const module = ActionRuleFactory(z.unknown()).parse(core);

  module.action({
    state: startState,
    core: startState,
    api,
    action: { type: 'leave', payload: { name: 'test-user-b' } },
  });

  assertFalse(startState.players.list.includes('test-user-b'));
});

Deno.test('actions -leave -active player', async () => {
  const api = await defineAPI();
  const startState = {
    id: 'core',
    players: {
      active: 'test-user-a',
      list: ['test-user-a', 'test-user-b'],
    },
  };

  const module = ActionRuleFactory(z.unknown()).parse(core);

  module.action({
    state: startState,
    core: startState,
    api,
    action: { type: 'leave', payload: { name: 'test-user-a' } },
  });

  assertFalse(startState.players.list.includes('test-user-a'));
  assert(startState.players.active === 'test-user-b');
});

Deno.test('progress', async (t) => {
  const api = await defineAPI();
  const startState = {
    id: 'core',
    players: {
      active: 'test-user-a',
      list: ['test-user-a', 'test-user-b'],
    },
  };

  const module = ProgressRuleFactory(z.unknown()).parse(core);

  module.progress({
    state: startState,
    core: startState,
    api,
  });

  assertFalse(startState.players.active === 'test-user-a');
});
