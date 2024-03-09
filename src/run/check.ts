import { z } from 'zod';
import { main } from '../lib/main.ts';
import { CheckRuleFactory } from '../lib/types.ts';

const CheckRule = CheckRuleFactory(z.unknown());
const SHA = z.string();
const TYPE = z.string();

await main(async (item, { core, state, api }) => {
  const validated = CheckRule.safeParse(item);
  let out;
  if (validated.success) {
    try {
      out = await validated.data.check({ state, core, api });
      console.log(`Check ${item.id} ran successfully!`);
    } catch (e: unknown) {
      out = e;

      throw e;
    } finally {
      const sha = SHA.safeParse(Deno.env.get('SHA'));
      const type = TYPE.safeParse(Deno.env.get('TYPE'));

      if (api.repository && sha.success && type.success) {
        const isError = out instanceof Error;
        const description = out instanceof Error ? out.message.substring(0, 120) : 'Passes';

        await api.github.rest.repos.createCommitStatus({
          owner: api.repository.owner,
          repo: api.repository.name,
          sha: sha.data,
          state: isError ? 'error' : 'success',
          description,
          context: `${type.data}: ${validated.data.id}`,
        });

        console.log('done');
      }
    }
  }
});
