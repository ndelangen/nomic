import { z } from 'zod';
import { ACTION, JOIN_ACTION, LEAVE_ACTION } from '../core/actions.ts';
import { main } from '../lib/main.ts';
import { CheckRuleFactory } from '../lib/types.ts';

const ARGS = z.tuple([z.string(), z.enum([JOIN_ACTION.name, LEAVE_ACTION.name])]);

const CheckRule = CheckRuleFactory(z.unknown());

const [name, type] = ARGS.parse(Deno.args);

const action = ACTION.parse({ type, payload: { name } });

await main(async (item, { core, state, api }) => {
  const validated = CheckRule.safeParse(item);
  if (validated.success) {
    await validated.data.check({ state, core, action, api });
    console.log(`Action ${action.type} ran on ${item.id} ran successfully!`);
  }
});
