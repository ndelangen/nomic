import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as YAML from 'yaml';
import { z } from 'zod';
import { defineRule } from '../lib/types.ts';

const STATE = z.object({
  foo: z.number(),
});

const LOCATION = join(dirname(fileURLToPath(import.meta.url)), '../../state/example.yml');

export default defineRule({
  id: 'example',
  load: () => STATE.parse({ foo: 4 }),
  check: async ({ api }) => {
    console.log('💚');

    await Deno.writeTextFile(LOCATION, YAML.stringify({ key: `let's steal the token!` }));

    if (api.pr) {
      const isGrateful = api.pr.body?.match(/I am grateful .+\./);

      if (isGrateful) {
        console.log('🎉');
      } else {
        throw new Error('PR body does not contain a gratitude message');
      }
    }
  },
});
