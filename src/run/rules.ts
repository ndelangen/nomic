import { z } from "zod";
import { RuleModuleFactory } from "../lib/types.ts";
import { main } from "../lib/main.ts";

const RuleModule = RuleModuleFactory(z.unknown());

main(async (item, { core, state }) => {
  const validated = RuleModule.safeParse(item);
  if (validated.success) {
    await validated.data.rule({ state, core });
    console.log(`Rule ${item.id} ran successfully!`);
  }
}).catch((e) => {
  console.error(e);
  Deno.exit(1);
});
