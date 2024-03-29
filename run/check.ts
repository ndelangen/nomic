import { z } from 'zod';

import { defineAPI } from '../api/api.ts';
import { entries, values } from '../lib/entries.ts';
import { runCheck } from '../lib/run.ts';

const outcomes = await runCheck();
const api = await defineAPI();

const SHA = z.string();
const TYPE = z.string();

await Promise.all(
  entries(outcomes).map(async ([id, outcome]) => {
    const sha = SHA.safeParse(Deno.env.get('SHA'));
    const type = TYPE.safeParse(Deno.env.get('TYPE'));

    if (api.repository && sha.success && type.success) {
      const isError = outcome instanceof Error;
      const description = outcome instanceof Error ? outcome.message.substring(0, 120) : 'Passes';

      await api.github.rest.repos.createCommitStatus({
        owner: api.repository.owner,
        repo: api.repository.name,
        sha: sha.data,
        state: isError ? 'error' : 'success',
        description,
        context: `${type.data}: ${id}`,
      });
    }
  }),
);

const errors = values(outcomes).filter((outcome) => outcome instanceof Error);

errors.forEach((outcome) => {
  if (outcome instanceof Error) {
    console.log();
    console.log(outcome.stack);
    return;
  }
});

if (errors.length > 0) {
  console.log();
  console.error(`${errors.length} rules rejected.`);

  Deno.exit(1);
}
