import { z } from 'zod';
import { ACTION, JOIN_ACTION, LEAVE_ACTION } from '../core/actions.ts';
import { main } from '../lib/main.ts';
import { RuleModuleFactory } from '../lib/types.ts';

const ARGS = z.tuple([z.string(), z.enum([JOIN_ACTION.name, LEAVE_ACTION.name])]);

const RuleModule = RuleModuleFactory(z.unknown());

const run = async () => {
  const [name, type] = ARGS.parse(Deno.args);

  const action = ACTION.parse({ type, payload: { name } });

  await main(async (item, { core, state, api }) => {
    const validated = RuleModule.safeParse(item);
    if (validated.success) {
      await validated.data.rule({ state, core, action, api });
      console.log(`Action ${action.type} ran on ${item.id} ran successfully!`);
    }
  });
};

run().catch((e) => {
  console.error(e);
  Deno.exit(1);
});
