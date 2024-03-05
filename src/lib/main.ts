import { z } from 'zod';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ModuleFactory } from './types.ts';
import { STATE as CORE_STATE } from '../core/rule.ts';
import { defineAPI } from '../core/api.ts';

const Unknown = z.unknown();
const Mole = ModuleFactory(Unknown);
const Data = z.object({
  state: Unknown,
  core: CORE_STATE,
  api: z.object({
    pr: z.any(),
  }),
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

  await (
    await modules
  ).reduce(async (acc, item) => {
    await acc;
    const state = item.load ? await item.load() : undefined;
    await callback(item, { state, core: core_state, api });
  }, Promise.resolve());
}
