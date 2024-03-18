import { assert, assertThrows } from 'https://deno.land/std@0.219.0/assert/mod.ts';

import { RULE_ACTION, RULE_CHECK, RULE_PROGRESS } from '../api/api.ts';

Deno.test('ActionRuleFactory', async (t) => {
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

Deno.test('CheckRuleFactory', async (t) => {
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

Deno.test('ProgressRuleFactory', async (t) => {
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
