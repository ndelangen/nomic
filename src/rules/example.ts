import { z } from 'zod';
import { defineRule } from '../lib/types.ts';

const STATE = z.object({
  foo: z.number(),
});

export default defineRule({
  id: 'example',
  load: async () => STATE.parse({ foo: 4 }),
  check: async ({ state, core, action, api }) => {
    console.log('💚');

    if (api.pr) {
      if (api.pr.user.login !== core.players.active) {
        throw new Error('PR user is not by the active player');
      }
    }
  },
  progress: async ({ state, core, api }) => {
    console.log('💙');
  },
});
