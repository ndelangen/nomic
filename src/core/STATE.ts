import { z } from 'zod';

export const STATE = z.object({
  id: z.string(),
  players: z.object({
    list: z.array(z.string()),
    active: z.string(),
  }),
});
