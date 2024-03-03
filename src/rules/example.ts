import { z } from "zod";
// import { join, dirname } from "node:path";
// import { fileURLToPath } from "node:url";
import { defineModule } from "../lib/types.ts";

// const LOCATION = join(
//   dirname(fileURLToPath(import.meta.url)),
//   "..",
//   "state",
//   "core.yml"
// );
const STATE = z.object({
  foo: z.number(),
});

export default defineModule({
  id: "example",
  load: async () => STATE.parse({ foo: 4 }),
  rule: async ({ state, core }) => {
    console.log("💚");
  },
  schedule: async ({ state, core }) => {
    console.log("💙");
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
