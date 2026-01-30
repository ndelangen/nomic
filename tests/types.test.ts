import { expect, test, describe } from 'bun:test';

import { RULE, RULE_ACTION, RULE_CHECK, RULE_PROGRESS } from '../api/api.ts';

test('validates a check rule', () => {
  const dummyRule = RULE.parse({
    check: async () => {},
  });
  expect(dummyRule).toBeTruthy();
});

test('validates a progress rule', () => {
  const dummyRule = RULE.parse({
    progress: async () => {},
  });
  expect(dummyRule).toBeTruthy();
});

test('validates an action rule', () => {
  const dummyRule = RULE.parse({
    action: async () => {},
  });
  expect(dummyRule).toBeTruthy();
});

describe('validates a combined rule', () => {
  test('A & B', () => {
    const dummyRule = RULE.parse({
      action: async () => {},
      check: async () => {},
    });
    expect(dummyRule).toBeTruthy();
  });

  test('A & C', () => {
    const dummyRule = RULE.parse({
      action: async () => {},
      check: async () => {},
    });
    expect(dummyRule).toBeTruthy();
  });

  test('B & C', () => {
    const dummyRule = RULE.parse({
      action: async () => {},
      check: async () => {},
    });
    expect(dummyRule).toBeTruthy();
  });

  test('A & B & C', () => {
    const dummyRule = RULE.parse({
      action: async () => {},
      check: async () => {},
      progress: async () => {},
    });
    expect(dummyRule).toBeTruthy();
  });
});

test('rejects invalid rule', () => {
  expect(() => {
    RULE.parse({});
  }).toThrow();
});

describe('RULE_ACTION', () => {
  test('empty = invalid', () => {
    expect(() => {
      RULE_ACTION.parse({});
    }).toThrow();
  });
  test('no action = invalid', () => {
    expect(() => {
      RULE_ACTION.parse({ id: 'test' });
    }).toThrow();
  });
  test('valid', () => {
    expect(
      RULE_ACTION.parse({
        id: '',
        action: () => {},
      }),
    ).toBeTruthy();
    expect(
      RULE_ACTION.parse({
        id: '',
        action: () => {},
      }),
    ).toBeTruthy();
    expect(
      RULE_ACTION.parse({
        id: '',
        action: () => {},
        check: () => {},
      }),
    ).toBeTruthy();
    expect(
      RULE_ACTION.parse({
        id: '',
        action: () => {},
        check: () => {},
        progress: () => {},
      }),
    ).toBeTruthy();
  });
});

describe('RULE_CHECK', () => {
  test('empty = invalid', () => {
    expect(() => {
      RULE_CHECK.parse({});
    }).toThrow();
  });
  test('no action = invalid', () => {
    expect(() => {
      RULE_CHECK.parse({ id: 'test' });
    }).toThrow();
  });
  test('valid', () => {
    expect(
      RULE_CHECK.parse({
        id: '',
        check: () => {},
      }),
    ).toBeTruthy();
    expect(
      RULE_CHECK.parse({
        id: '',
        check: () => {},
      }),
    ).toBeTruthy();
    expect(
      RULE_CHECK.parse({
        id: '',
        action: () => {},
        check: () => {},
      }),
    ).toBeTruthy();
    expect(
      RULE_CHECK.parse({
        id: '',
        action: () => {},
        check: () => {},
        progress: () => {},
      }),
    ).toBeTruthy();
  });
});

describe('RULE_PROGRESS', () => {
  test('empty = invalid', () => {
    expect(() => {
      RULE_PROGRESS.parse({});
    }).toThrow();
  });
  test('no action = invalid', () => {
    expect(() => {
      RULE_PROGRESS.parse({ id: 'test' });
    }).toThrow();
  });
  test('valid', () => {
    expect(
      RULE_PROGRESS.parse({
        id: '',
        progress: () => {},
      }),
    ).toBeTruthy();
    expect(
      RULE_PROGRESS.parse({
        id: '',
        progress: () => {},
      }),
    ).toBeTruthy();
    expect(
      RULE_PROGRESS.parse({
        id: '',
        action: () => {},
        progress: () => {},
      }),
    ).toBeTruthy();
    expect(
      RULE_PROGRESS.parse({
        id: '',
        action: () => {},
        check: () => {},
        progress: () => {},
      }),
    ).toBeTruthy();
  });
});
