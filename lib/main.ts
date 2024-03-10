import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';

import { API, RuleFactory, defineAPI } from '../api/api.ts';
import { STATE as CORE_STATE } from '../core/state.ts';

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
