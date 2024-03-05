import { z } from 'zod';
import { main } from '../lib/main.ts';
import { CheckRuleFactory } from '../lib/types.ts';

const CheckRule = CheckRuleFactory(z.unknown());
const SHA = z.string();

await main(async (item, { core, state, api }) => {
  const validated = CheckRule.safeParse(item);
  if (validated.success) {
    await validated.data.check({ state, core, api }).catch((e) => {
      const sha = SHA.parse(Deno.env.get('SHA'));
      if (api.repository && sha) {
        api.github.request('POST /repos/{owner}/{repo}/statuses/{sha}', {
          owner: api.repository.owner,
          repo: api.repository.name,
          sha,
          state: 'failure',
          description: 'Check failed',
          context: item.id,
          headers: {
            'X-GitHub-Api-Version': '2022-11-28',
          },
        });
      }
      throw e;
    });
    console.log(`Check ${item.id} ran successfully!`);
  }
});
