import { z } from "zod";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { defineModule } from "../lib/types.ts";
import { parse } from "yaml";

const LOCATION = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "state",
  "core.yml"
);

export const STATE = z.object({
  id: z.string(),
  players: z.object({
    list: z.array(z.string()),
    active: z.string(),
  }),
});

export default defineModule({
  id: "core",
  load: async () => STATE.parse(parse(await Deno.readTextFile(LOCATION))),
  rule: async ({ state, core }) => {
    console.log("🟢");
  },
  schedule: async ({ state, core }) => {
    console.log("🔵");
  },
  // hooks: {
  //   join: async () => {
  //     console.log("💛");
  //   },
  //   // foo: async () => {
  //   //   console.log("💜");
  //   // }
  // },
});
