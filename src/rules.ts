import { RuleModuleFactory } from "./lib/types";
import { main } from "./lib/main";
import { z } from "zod";

const RuleModule = RuleModuleFactory(z.unknown());

main(
  async (item, { core, state}) => {
    const validated = RuleModule.safeParse(item);
    if (validated.success) {
      await validated.data.rule({ state, core });
      console.log(`Rule ${item.id} ran successfully!`);
    }
  }
).catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
