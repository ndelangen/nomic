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
      // const other = JSON.parse(Deno.env.get('OTHER') || '{}');
      console.log({
        e,
        sha,
        repo: api.repository,
        // other,
      });
      if (api.repository && sha) {
        // await api.github.rest.repos.createCommitStatus({
        //   owner: api.repository.owner,
        //   repo: api.repository.name,
        //   sha,
        //   state: 'failure',
        //   description: 'Status failed',
        //   context: item.id,
        // });
        await api.github.rest.checks.create({
          owner: api.repository.owner,
          repo: api.repository.name,
          name: 'Check',
          head_sha: sha,
          status: 'completed',
          conclusion: 'failure',
          actions: [
            {
              label: 'View',
              description: 'View the logs',
              identifier: 'view',
            },
          ],
          output: {
            title: 'Check failed',
            summary: 'Check failed',
            text: e.toString(),
            images: [
              {
                alt: 'Check failed',
                image_url: 'https://octodex.github.com/images/labtocat.png',
              },
            ],
          },
        });
      }
      throw e;
    }
  }
});
