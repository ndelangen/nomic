import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';

import { API, ActionRuleFactory, CheckRuleFactory, defineAPI } from '../api/api.ts';
import { ProgressRuleFactory } from '../api/api.ts';
import { STATE as CORE_STATE } from '../core/rule.state.ts';

const Unknown = z.unknown();

const RULES_LOCATION = join(dirname(fileURLToPath(import.meta.url)), '..', `rules`);

async function getFiles() {
  const files: Deno.DirEntry[] = [];
  for await (const file of Deno.readDir(RULES_LOCATION)) {
    files.push(file);
  }
  return files;
}

export async function getAllRules() {
  const files = await getFiles();

  return [
    //
    import('../core/rule.ts').then((m) => m.default),
    ...files.map((file) => import(`../rules/${file.name}`).then((m) => m.default)),
  ];
}

/**
 * Run a series of modules in parallel.
 *
 * @param filter - The type of rule to run.
 * @param callback - A function that runs the module's method with .
 */
export function runRules<
  T extends typeof ActionRuleFactory | typeof CheckRuleFactory | typeof ProgressRuleFactory,
>(
  filter: T,
  callback: (
    item: z.infer<ReturnType<T>>,
    state: unknown,
    core_state: z.infer<typeof CORE_STATE>,
    api: z.infer<typeof API>,
  ) => Promise<void> | void,
  options: Parameters<typeof defineAPI>[0] = {},
) {
  return async (modules: Promise<z.infer<ReturnType<T>>>[]): Promise<Error[]> => {
    const core = (await import('../core/rule.ts')).default;
    const core_state = core.load ? await core.load() : undefined;
    const api = await defineAPI(options);

    if (core_state === undefined) {
      throw new Error('Core state is undefined');
    }

    const settled = await Promise.allSettled(
      modules.map(async (item) => {
        const validated = filter(Unknown).safeParse(await item);

        if (validated.success) {
          const state = validated.data.load ? await validated.data.load() : undefined;
          await callback(validated.data, state, core_state, api);
        }
      }),
    );

    return settled
      .map((item) => (item.status === 'rejected' ? item.reason : undefined))
      .filter((reason) => typeof reason !== 'undefined');
  };
}

// v2(ActionRuleFactory, async (item, state, core_state, api) => {
//   await console.log(item.action);
// });
