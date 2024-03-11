import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';

import { API, ActionRuleFactory, CheckRuleFactory, RuleFactory, defineAPI } from '../api/api.ts';
import { ProgressRuleFactory } from '../api/api.ts';
import { STATE as CORE_STATE } from '../core/rule.state.ts';

const Unknown = z.unknown();
const Mole = RuleFactory(Unknown);
const Data = z.object({
  state: Unknown,
  core: CORE_STATE,
  api: API,
});

async function getFiles() {
  const files: Deno.DirEntry[] = [];
  for await (const file of Deno.readDir(join(dirname(fileURLToPath(import.meta.url)), '..', `rules`))) {
    files.push(file);
  }
  return files;
}

async function getModules() {
  const files = await getFiles();

  return Promise.all(
    files.map(async (file) => {
      const module = await import(`../rules/${file.name}`);

      return Mole.parse(module.default);
    }),
  );
}

type Callback = (item: z.infer<typeof Mole>, data: z.infer<typeof Data>) => Promise<void>;

/**
 * Run a series of modules in parallel.
 *
 * @param callback - A function that runs the module and returns the state.
 */
export async function main(callback: Callback) {
  const modules = getModules();

  const { default: core_rule } = await import('../core/rule.ts');
  const core_state = core_rule.load ? await core_rule.load() : undefined;

  if (core_state === undefined) {
    throw new Error('Core state is undefined');
  }

  const api = await defineAPI();

  await callback(core_rule as z.infer<typeof Mole>, {
    state: core_state,
    core: core_state,
    api: api,
  });

  const list = await modules;

  const settled = await Promise.allSettled(
    list.map((item) =>
      Promise.resolve()
        .then(() => (item.load ? item.load() : Promise.resolve()))
        .then((state) => callback(item, { state, core: core_state, api })),
    ),
  );

  const reasons = settled
    .map((item) => (item.status === 'rejected' ? item.reason : undefined))
    .filter((reason) => typeof reason !== 'undefined');

  if (reasons.length > 0) {
    reasons.map((item) => {
      console.log();
      console.error(item.stack);
    });
    console.log();
    console.error(`${reasons.length} rules rejected.`);

    Deno.exit(1);
  }
}

export function v2<T extends typeof ActionRuleFactory | typeof CheckRuleFactory | typeof ProgressRuleFactory>(
  filter: T,
  callback: (
    item: z.infer<ReturnType<T>>,
    state: unknown,
    core_state: z.infer<typeof CORE_STATE>,
    api: z.infer<typeof API>,
  ) => Promise<void> | void,
  options: Parameters<typeof defineAPI>[0] = {},
) {
  return async (modules: Promise<z.infer<ReturnType<T>>>[]) => {
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

v2(ActionRuleFactory, async (item, state, core_state, api) => {
  await console.log(item.action);
});
