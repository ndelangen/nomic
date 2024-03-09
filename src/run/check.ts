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
        await api.github.rest.checks.create({
          owner: api.repository.owner,
          repo: api.repository.name,
          name: validated.data.id,
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
            title: isError ? 'Check failed' : 'OK',
            summary: isError ? 'Check failed' : 'Success',
            text: isError ? out.stack : '',
            // images: [
            //   {
            //     alt: 'Check failed',
            //     image_url: 'https://octodex.github.com/images/labtocat.png',
            //   },
            // ],
          },
        });
      }
    }
  }
});
