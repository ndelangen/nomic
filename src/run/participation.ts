import { z } from "zod";
import { ACTION } from "../core/actions.ts";
import { main } from "../lib/main.ts";
import { RuleModuleFactory } from "../lib/types.ts";

const ARGS = z.tuple([z.string(), z.enum(["join", "leave"])]);

const RuleModule = RuleModuleFactory(z.unknown());

const run = async () => {
  const [name, type] = ARGS.parse(Deno.args);

  const action = ACTION.parse({ type, payload: { name } });

  await main(async (item, { core, state }) => {
    const validated = RuleModule.safeParse(item);
    if (validated.success) {
      await validated.data.rule({ state, core, action });
      console.log(`Action ${action.type} ran on ${item.id} ran successfully!`);
    }
  });
};

run().catch((e) => {
  console.error(e);
  Deno.exit(1);
});
