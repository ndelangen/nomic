import { z } from 'zod';

import { CheckRuleFactory } from '../api/api.ts';
import { getAllRules, runRules } from '../lib/main.ts';

const SHA = z.string();
const TYPE = z.string();

const allRules = await getAllRules();
const outcomes = await runRules(CheckRuleFactory, async (item, state, core, api) => {
  let out;

  try {
    await item.check({ state, core, api });

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
        context: `${type.data}: ${item.id}`,
      });

      console.log('done');
    }
  }
})(allRules);

outcomes.forEach((outcome) => {
  console.log();
  console.error(outcome.stack || outcome.message);
});

if (outcomes.length > 0) {
  console.log();
  console.error(`${outcomes.length} rules rejected.`);

  Deno.exit(1);
}
