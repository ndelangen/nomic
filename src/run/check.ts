import { z } from 'zod';
import { main } from '../lib/main.ts';
import { CheckRuleFactory } from '../lib/types.ts';

const CheckRule = CheckRuleFactory(z.unknown());

await main(async (item, { core, state, api }) => {
  const validated = CheckRule.safeParse(item);
  if (validated.success) {
    await validated.data.check({ state, core, api });
    console.log(`Check ${item.id} ran successfully!`);
  }
});
