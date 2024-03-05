import { z } from 'zod';

import { main } from '../lib/main.ts';
import { CheckRuleFactory, ProgressRuleFactory } from '../lib/types.ts';

const ProgressRule = ProgressRuleFactory(z.unknown());
const CheckRule = CheckRuleFactory(z.unknown());

await main(async (item, { core, state, api }) => {
  const validated = CheckRule.safeParse(item);
  if (validated.success) {
    await validated.data.check({ state, core, api });
    console.log(`Check ${item.id} ran successfully!`);
  }
});

await main(async (item, { core, state, api }) => {
  const validated = ProgressRule.safeParse(item);
  if (validated.success) {
    await validated.data.progress({ state, core, api });
    console.log(`Progress ${item.id} ran successfully!`);
  }
});
