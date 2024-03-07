import { z } from 'zod';
import { main } from '../lib/main.ts';
import { CheckRuleFactory } from '../lib/types.ts';

const CheckRule = CheckRuleFactory(z.unknown());
const SHA = z.string();

await main(async (item, { core, state, api }) => {
  const validated = CheckRule.safeParse(item);
  if (validated.success) {
    try {
      await validated.data.check({ state, core, api });
      console.log(`Check ${item.id} ran successfully!`);
    } catch (e) {
      const sha = SHA.parse(Deno.env.get('SHA'));
      const other = JSON.parse(Deno.env.get('OTHER') || '{}');
      console.log({ e, sha, repo: api.repository, other });
      if (api.repository && sha) {
        await api.github.request('POST /repos/{owner}/{repo}/statuses/{ref}', {
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
    }
  }
});
