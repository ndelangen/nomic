import { assert, assertThrows } from 'https://deno.land/std@0.219.0/assert/mod.ts';
import { z } from 'zod';

import { ActionRuleFactory, CheckRuleFactory, ProgressRuleFactory, defineRule } from '../api/api.ts';

Deno.test('ActionRuleFactory', async (t) => {
  await t.step('empty = invalid', () => {
    assertThrows(() => {
      ActionRuleFactory(z.unknown()).parse({});
    });
  });
  await t.step('no action = invalid', () => {
    assertThrows(() => {
      ActionRuleFactory(z.unknown()).parse({ id: 'test' });
    });
  });
  await t.step('no id = invalid', () => {
    assertThrows(() => {
      ActionRuleFactory(z.unknown()).parse({ action: () => {} });
    });
  });
  await t.step('valid', () => {
    assert(
      ActionRuleFactory(z.unknown()).parse({
        id: '',
        action: () => {},
      }),
    );
    assert(
      ActionRuleFactory(z.unknown()).parse({
        id: '',
        action: () => {},
        load: () => {},
      }),
    );
    assert(
      ActionRuleFactory(z.unknown()).parse({
        id: '',
        action: () => {},
        load: () => {},
        check: () => {},
      }),
    );
    assert(
      ActionRuleFactory(z.unknown()).parse({
        id: '',
        action: () => {},
        load: () => {},
        check: () => {},
        progress: () => {},
      }),
    );
  });

  await t.step('integration', () => {
    assert(
      ActionRuleFactory(z.unknown()).parse(
        defineRule({
          id: 'a',
          action: async () => {},
        }),
      ),
    );
  });
});

Deno.test('CheckRuleFactory', async (t) => {
  await t.step('empty = invalid', () => {
    assertThrows(() => {
      CheckRuleFactory(z.unknown()).parse({});
    });
  });
  await t.step('no action = invalid', () => {
    assertThrows(() => {
      CheckRuleFactory(z.unknown()).parse({ id: 'test' });
    });
  });
  await t.step('no id = invalid', () => {
    assertThrows(() => {
      CheckRuleFactory(z.unknown()).parse({ action: () => {} });
    });
  });
  await t.step('valid', () => {
    assert(
      CheckRuleFactory(z.unknown()).parse({
        id: '',
        check: () => {},
      }),
    );
    assert(
      CheckRuleFactory(z.unknown()).parse({
        id: '',
        check: () => {},
        load: () => {},
      }),
    );
    assert(
      CheckRuleFactory(z.unknown()).parse({
        id: '',
        action: () => {},
        load: () => {},
        check: () => {},
      }),
    );
    assert(
      CheckRuleFactory(z.unknown()).parse({
        id: '',
        action: () => {},
        load: () => {},
        check: () => {},
        progress: () => {},
      }),
    );
  });

  await t.step('integration', () => {
    assert(
      CheckRuleFactory(z.unknown()).parse(
        defineRule({
          id: 'a',
          check: async () => {},
        }),
      ),
    );
  });
});

Deno.test('ProgressRuleFactory', async (t) => {
  await t.step('empty = invalid', () => {
    assertThrows(() => {
      ProgressRuleFactory(z.unknown()).parse({});
    });
  });
  await t.step('no action = invalid', () => {
    assertThrows(() => {
      ProgressRuleFactory(z.unknown()).parse({ id: 'test' });
    });
  });
  await t.step('no id = invalid', () => {
    assertThrows(() => {
      ProgressRuleFactory(z.unknown()).parse({ action: () => {} });
    });
  });
  await t.step('valid', () => {
    assert(
      ProgressRuleFactory(z.unknown()).parse({
        id: '',
        progress: () => {},
      }),
    );
    assert(
      ProgressRuleFactory(z.unknown()).parse({
        id: '',
        progress: () => {},
        load: () => {},
      }),
    );
    assert(
      ProgressRuleFactory(z.unknown()).parse({
        id: '',
        action: () => {},
        load: () => {},
        progress: () => {},
      }),
    );
    assert(
      ProgressRuleFactory(z.unknown()).parse({
        id: '',
        action: () => {},
        load: () => {},
        check: () => {},
        progress: () => {},
      }),
    );
  });

  await t.step('integration', () => {
    assert(
      ProgressRuleFactory(z.unknown()).parse(
        defineRule({
          id: 'a',
          progress: async () => {},
        }),
      ),
    );
  });
});
