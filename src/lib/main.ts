import { z } from "zod";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { ModuleFactory } from "./types.ts";
import { CORE_STATE } from "./CORE_STATE.ts";

const Unknown = z.unknown();
const Mole = ModuleFactory(Unknown);
const Data = z.object({ state: Unknown, core: CORE_STATE });

async function getFiles() {
  const files: Deno.DirEntry[] = [];
  for await (const file of Deno.readDir(
    join(dirname(fileURLToPath(import.meta.url)), "..", `rules`)
  )) {
    files.push(file);
  }
  return files;
}

/**
 * Run a series of modules in parallel.
 * @param ingest - A function that returns the state to be passed to each module.
 * @param callback - A function that runs the module and returns the state.
 */
export async function main(
  callback: (
    module: z.infer<typeof Mole>,
    data: z.infer<typeof Data>
  ) => Promise<void>
) {
  const { default: core_rule } = await import("../core/rule.ts");
  const core_state = core_rule.load ? await core_rule.load() : undefined;

  if (core_state === undefined) {
    throw new Error("Core state is undefined");
  }

  await callback(core_rule as z.infer<typeof Mole>, {
    state: core_state,
    core: core_state,
  });

  const files = await getFiles();

  const modules = await Promise.all(
    files.map(async (file) => {
      const module = await import(`../rules/${file.name}`);

      return Mole.parse(module.default);
    })
  );

  // run every module in sequence
  await modules.reduce(async (acc, item) => {
    await acc;
    const state = item.load ? await item.load() : undefined;
    await callback(item, { state, core: core_state });
  }, Promise.resolve());
}
