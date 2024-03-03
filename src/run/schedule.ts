import { z } from 'zod';

import { ScheduleModuleFactory } from '../lib/types.ts';
import { main } from '../lib/main.ts';
import { RuleModuleFactory } from '../lib/types.ts';

const ScheduleModule = ScheduleModuleFactory(z.unknown());
const RuleModule = RuleModuleFactory(z.unknown());

const run = async () => {
  await main(async (item, { core, state }) => {
    const va = RuleModule.safeParse(item);
    if (va.success) {
      await va.data.rule({ state, core });
      console.log(`Rule ${item.id} ran successfully!`);
    }
  });

  await main(async (item, { core, state }) => {
    const vb = ScheduleModule.safeParse(item);
    if (vb.success) {
      await vb.data.schedule({ state, core });
      console.log(`Schedule ${item.id} ran successfully!`);
    }
  });
};

run().catch((e) => {
  console.error(e);
  Deno.exit(1);
});
