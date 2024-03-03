import { z } from "zod";
import { readdir } from "node:fs/promises";
import { join } from "node:path";
import { CORE_STATE, ModuleFactory } from "./types";

const rr = z.unknown();
const ff = ModuleFactory(rr);
const cc = z.object({state: rr, core: CORE_STATE});

/**
 * Run a series of modules in parallel.
 * @param ingest - A function that returns the state to be passed to each module.
 * @param callback - A function that runs the module and returns the state.
 */
export async function main(
  callback: (module: z.infer<typeof ff>, data: z.infer<typeof cc>) => Promise<void>
) {
  // ingest core data
  const core_state = await load_core();

  // read list of files
  const files = await readdir(join(import.meta.dir, "../rules"));

  // read every file in parallel
  const modules = await Promise.all(
    files.map(async (file) => {
      // load the module
      const module = await import(`../rules/${file}`);

      // parse the module's default export
      return ff.parse(module.default);
    })
  );

  // run every module in sequence
  await modules.reduce(async (acc, item) => {
    await acc;
    const state = item.load ? await item.load() : undefined;
    await callback(item, { state, core: core_state });
  }, Promise.resolve());
}

function load_core() {
  return CORE_STATE.parse({
    id: "core",
    players: {
      list: [],
      active: "",
    },
  });
}
