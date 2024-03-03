import { z } from 'zod';
import { RuleModuleFactory } from '../lib/types.ts';
import { main } from '../lib/main.ts';

const RuleModule = RuleModuleFactory(z.unknown());

const run = async () => {
  console.log({ pr: Deno.env.get('PR_NUMBER') });
  await main(async (item, { core, state }) => {
    const validated = RuleModule.safeParse(item);
    if (validated.success) {
      await validated.data.rule({ state, core });
      console.log(`Rule ${item.id} ran successfully!`);
    }
  });
};

run().catch((e) => {
  console.error(e);
  Deno.exit(1);
});
