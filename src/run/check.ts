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
    } catch (e) {
      out = e;

      throw e;
    } finally {
      const sha = SHA.safeParse(Deno.env.get('SHA'));
      const type = SHA.safeParse(Deno.env.get('TYPE'));

      if (api.repository && sha.success && type.success) {
        const isError = out instanceof Error;

        const o = await api.github.rest.checks.create({
          owner: api.repository.owner,
          repo: api.repository.name,
          name: `${type.data}: ${validated.data.id}`,
          head_sha: sha.data,
          status: 'completed',
          external_id: `check_${type.data}${validated.data.id}}`,
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
          description: `${new Date().toISOString()}`,
          context: `${type.data}: ${validated.data.id}`,
          target_url: o.data.details_url,
        });

        console.log('done');
      }
    }
  }
});
