import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import YAML from 'yaml';
import type { z } from 'zod';

import { ACTION } from '../api/actions.ts';
import { RULE_ACTION, RULE_CHECK, RULE_PROGRESS, defineAPI } from '../api/api.ts';
import { type RESULTS, STATES_RAW as STATES, STATE_LOCATION, RULES as rules } from '../api/states.ts';
import { entries } from './entries.ts';
import { readStates } from './read-states.ts';

export async function runProgress() {
  const results: z.infer<typeof RESULTS> = {};
  const [api, states] = await Promise.all([defineAPI(), readStates()]);

  for (const [id, r] of entries(rules)) {
    const rule = RULE_PROGRESS.safeParse(r);

    if (rule.success) {
      try {
        const out = await rule.data.progress({ states, api });
        if (out) {
          for (const [id, data] of entries(out)) {
            // @ts-expect-error (un-discriminated union of state objects)
            states[id] = STATES[id].parse(data);
          }
        }
        // @ts-expect-error (un-discriminated union of state objects)
        results[id] = states[id];
      } catch (e) {
        // @ts-expect-error (un-discriminated union of state objects)
        results[id] = e;
      }
    }
  }

  const success = Object.values(results).filter((item) => item instanceof Error).length === 0;

  if (success) {
    await Promise.all(
      entries(states).map(async ([id, data]) => {
        await writeFile(join(STATE_LOCATION, `${id}.yml`), YAML.stringify(data));
      }),
    );
  }

  return results;
}

export async function runCheck() {
  const results: z.infer<typeof RESULTS> = {};
  const [api, states] = await Promise.all([defineAPI(), readStates()]);

  for (const [id, v] of entries(rules)) {
    try {
      const rule = RULE_CHECK.safeParse(v);

      if (rule.success) {
        console.log(`running check on: ${id}`);
        await rule.data.check({ states, api });
      }
      // @ts-expect-error (un-discriminated union of state objects)
      results[id] = states[id];
    } catch (e) {
      // @ts-expect-error (un-discriminated union of state objects)
      results[id] = e;
    }
  }

  return results;
}

export async function runAction() {
  const results: z.infer<typeof RESULTS> = {};

  const type = process.env.ACTION_NAME;
  const payload = JSON.parse(process.env.ACTION_PAYLOAD || '');
  const action = ACTION.parse({ type, payload });

  const [api, states] = await Promise.all([defineAPI(), readStates()]);

  for (const [id, r] of entries(rules)) {
    try {
      const rule = RULE_ACTION.safeParse(r);

      if (rule.success) {
        console.log(`running action: ${type} on: ${id}`);
        const out = await rule.data.action({ states, api, action });
        if (out) {
          for (const [id, data] of entries(out)) {
            // @ts-expect-error (un-discriminated union of state objects)
            states[id] = STATES[id].parse(data);
          }
        }
      }
      // @ts-expect-error (un-discriminated union of state objects)
      results[id] = states[id];
    } catch (e) {
      // @ts-expect-error (un-discriminated union of state objects)
      results[id] = e;
    }
  }

  const success = Object.values(results).filter((item) => item instanceof Error).length === 0;

  if (success) {
    await Promise.all(
      entries(states).map(async ([id, data]) => {
        await writeFile(join(STATE_LOCATION, `${id}.yml`), YAML.stringify(data));
      }),
    );
  }

  return results;
}
