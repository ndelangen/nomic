import { z } from 'zod';

import { ScheduleModuleFactory } from '../lib/types.ts';
import { main } from '../lib/main.ts';
import { RuleModuleFactory } from '../lib/types.ts';

const ScheduleModule = ScheduleModuleFactory(z.unknown());
const RuleModule = RuleModuleFactory(z.unknown());

const run = async () => {
  await main(async (item, { core, state, api }) => {
    const validated = RuleModule.safeParse(item);
    if (validated.success) {
      await validated.data.rule({ state, core, api });
      console.log(`Rule ${item.id} ran successfully!`);
    }
  });

  await main(async (item, { core, state, api }) => {
    const validated = ScheduleModule.safeParse(item);
    if (validated.success) {
      await validated.data.schedule({ state, core, api });
      console.log(`Schedule ${item.id} ran successfully!`);
    }
  });
};

run().catch((e) => {
  console.error(e);
  Deno.exit(1);
});
