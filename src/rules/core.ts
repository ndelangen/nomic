import { z } from "zod";
import { join } from "node:path";
import { defineModule } from "../lib/types";

const LOCATION = join(import.meta.dir, "..", "state", "core.yml");
const STATE = z.object({
  foo: z.number(),
});

export default defineModule({
  id: "core",
  load: async () => STATE.parse({ foo: 4 }),
  rule: async ({ state, core }) => {
    console.log("Rule ran successfully!");
  },
  schedule: async ({ state, core }) => {
    console.log("Schedule ran successfully!");
  },
});
