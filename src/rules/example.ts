import { z } from 'zod';
import { defineModule } from '../lib/types.ts';

const STATE = z.object({
  foo: z.number(),
});

export default defineModule({
  id: 'example',
  load: async () => STATE.parse({ foo: 4 }),
  rule: async ({ state, core, action, api }) => {
    console.log('💚');

    if (api.pr) {
      if (api.pr.user.login !== core.players.active) {
        throw new Error('PR user is not by the active player');
      }
    }
  },
  schedule: async ({ state, core, api }) => {
    console.log('💙');
  },
});
