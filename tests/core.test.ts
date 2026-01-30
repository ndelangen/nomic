import { expect, test } from 'bun:test';
import type { z } from 'zod';

import { RULE_ACTION, RULE_PROGRESS, RULE_CHECK, defineAPI } from '../api/api.ts';
import type { STATES } from '../api/states.ts';
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

test('actions -join', async () => {
  const api = await defineAPI();
  const states = createStates();

  const module = RULE_ACTION.parse(core.HANDLERS);

  const out = await module.action({
    states,
    api,
    action: { type: 'join', payload: { name: 'test-user-c' } },
  });

  expect(out?.core).toBeTruthy();
  expect(out?.core?.players.list.includes('test-user-c')).toBe(true);
});

test('actions -join (fail when exists)', async () => {
  const api = await defineAPI();
  const states = createStates();

  const module = RULE_ACTION.parse(core.HANDLERS);

  await expect(async () => {
    await module.action({
      states,
      api,
      action: { type: 'join', payload: { name: 'test-user-a' } },
    });
  }).toThrowErrorMatchingInlineSnapshot(`"409 - conflict: Player already exists"`);
});

test('actions -leave', async () => {
  const api = await defineAPI();
  const states = createStates();

  const module = RULE_ACTION.parse(core.HANDLERS);

  const out = await module.action({
    states,
    api,
    action: { type: 'leave', payload: { name: 'test-user-b' } },
  });

  expect(out?.core).toBeTruthy();
  expect(out?.core?.players.list.includes('test-user-b')).toBe(false);
});

test('actions -leave (fail when missing)', async () => {
  const api = await defineAPI();
  const states = createStates();

  const module = RULE_ACTION.parse(core.HANDLERS);

  await expect(async () => {
    await module.action({
      states,
      api,
      action: { type: 'leave', payload: { name: 'test-user-c' } },
    });
  }).toThrowErrorMatchingInlineSnapshot(`"404 - not found: Player does not exist"`);
});

test('actions -leave -active player', async () => {
  const api = await defineAPI();
  const states = createStates();

  const module = RULE_ACTION.parse(core.HANDLERS);

  const out = await module.action({
    states,
    api,
    action: { type: 'leave', payload: { name: 'test-user-a' } },
  });

  expect(out?.core?.players.list.includes('test-user-a')).toBe(false);
  expect(out?.core?.players.active).toBe('test-user-b');
});

test('actions -unsupported', async () => {
  const api = await defineAPI();
  const states = createStates();

  const module = RULE_ACTION.parse(core.HANDLERS);

  await expect(async () => {
    await module.action({
      states,
      api,
      // @ts-expect-error (forcing a non-existing action for testing purposes)
      action: { type: 'non-existing-action', payload: { name: 'test-user-c' } },
    });
  }).toThrow();
});

test('progress', async () => {
  const api = await defineAPI();
  const states = createStates();

  const module = RULE_PROGRESS.parse(core.HANDLERS);

  const out = await module.progress({
    states,
    api,
  });

  expect(out?.core?.players.active === 'test-user-a').toBe(false);
});

test('check', async () => {
  const states = createStates();

  const module = RULE_CHECK.parse(core.HANDLERS);

  await expect(async () => {
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
  }).toThrow();

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
