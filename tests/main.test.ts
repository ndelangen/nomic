import { assert } from 'https://deno.land/std@0.219.0/assert/mod.ts';

import { ActionRuleFactory } from '../api/api.ts';
import { v2 } from '../lib/main.ts';

Deno.test('empty array', async () => {
  const outcome = await v2(ActionRuleFactory, async (item, state, core_state, api) => {}, {
    disableThrottle: true,
  })([]);

  assert(Array.isArray(outcome));
});

Deno.test('1 item passing', async () => {
  const outcome = await v2(
    ActionRuleFactory,
    async (item, state, core_state, api) => {
      await item.action({ state, core: core_state, action: { type: 'join', payload: { name: '' } }, api });
    },
    { disableThrottle: true },
  )([
    Promise.resolve({
      id: 'test',
      action: async () => {},
    }),
  ]);

  assert(Array.isArray(outcome));
  assert(outcome.length === 0);
});

Deno.test('1 item failing', async () => {
  const outcome = await v2(
    ActionRuleFactory,
    async (item, state, core_state, api) => {
      await item.action({ state, core: core_state, action: { type: 'join', payload: { name: '' } }, api });
    },
    { disableThrottle: true },
  )([
    Promise.resolve({
      id: 'test',
      action: async () => {
        throw new Error('TestError');
      },
    }),
  ]);

  assert(Array.isArray(outcome));
  assert(outcome.length === 1);
  assert(outcome[0].message === 'TestError');
});
