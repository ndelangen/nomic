import { z } from 'zod';
import { main } from '../lib/main.ts';
import { CheckRuleFactory } from '../lib/types.ts';

const CheckRule = CheckRuleFactory(z.unknown());
const SHA = z.string();

await main(async (item, { core, state, api }) => {
  const validated = CheckRule.safeParse(item);
  const sha = SHA.safeParse(Deno.env.get('SHA'));
  if (validated.success) {
    try {
      await validated.data.check({ state, core, api });
      console.log(`Check ${item.id} ran successfully!`);
      // const other = JSON.parse(Deno.env.get('OTHER') || '{}');
      // console.log({
      //   e,
      //   sha,
      //   repo: api.repository,
      //   // other,
      // });
      if (api.repository && sha.success) {
        await api.github.rest.checks.create({
          owner: api.repository.owner,
          repo: api.repository.name,
          name: 'my-check',
          head_sha: sha.data,
          status: 'completed',
          conclusion: 'success',
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
            text: '',
            images: [
              {
                alt: 'Check failed',
                image_url: 'https://octodex.github.com/images/labtocat.png',
              },
            ],
          },
        });
      }
    } catch (e) {
      if (api.repository && sha.success) {
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
          name: 'my-check',
          head_sha: sha.data,
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
