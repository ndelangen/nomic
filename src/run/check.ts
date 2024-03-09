import { z } from 'zod';
import { main } from '../lib/main.ts';
import { CheckRuleFactory } from '../lib/types.ts';

const CheckRule = CheckRuleFactory(z.unknown());
const SHA = z.string();

await main(async (item, { core, state, api }) => {
  const validated = CheckRule.safeParse(item);
  let out;
  if (validated.success) {
    try {
      out = await validated.data.check({ state, core, api });
      console.log(`Check ${item.id} ran successfully!`);
    } catch (e) {
      out = e;

      throw e;
    } finally {
      const sha = SHA.safeParse(Deno.env.get('SHA'));

      if (api.repository && sha.success) {
        const isError = out instanceof Error;

        const o = await api.github.rest.checks.create({
          owner: api.repository.owner,
          repo: api.repository.name,
          name: `check_${validated.data.id}${Date.now()}`,
          head_sha: sha.data,
          status: 'completed',
          conclusion: isError ? 'failure' : 'success',
          actions: [
            {
              label: 'View',
              description: 'View the logs',
              identifier: 'view',
            },
          ],
          output: {
            title: isError ? 'Fail' : 'OK',
            summary: isError ? 'Error summary' : 'Success summary',
            text: isError ? out.stack : undefined,
          },
        });

        await api.github.rest.repos.createCommitStatus({
          owner: api.repository.owner,
          repo: api.repository.name,
          sha: sha.data,
          state: isError ? 'error' : 'success',
          description: 'description',
          context: `status_${validated.data.id}${Date.now()}`,
          target_url: o.data.details_url,
        });

        console.log('done');
      }
    }
  }
});
