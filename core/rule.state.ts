import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';

export const LOCATION = join(dirname(fileURLToPath(import.meta.url)), '../../state/core.yml');

export const STATE = z.object({
  id: z.string(),
  players: z.object({
    list: z.array(z.string()),
    active: z.string(),
  }),
});
