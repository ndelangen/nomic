import { z } from 'zod';
import { defineModule } from '../lib/types.ts';

const STATE = z.object({
  foo: z.number(),
});

export default defineModule({
  id: 'example',
  load: async () => STATE.parse({ foo: 4 }),
  rule: async ({ state, core, action }) => {
    console.log('💚');
  },
  schedule: async ({ state, core }) => {
    console.log('💙');
  },
});
