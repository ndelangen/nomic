import { z } from 'zod';

import { JOIN_ACTION, LEAVE_ACTION } from '../api/actions.ts';
import { RULE } from '../api/api.ts';

export const META = {
  id: 'core' as const,
  validator: z.object({
    v: z.number().int().positive(),
    players: z.object({
      list: z.array(z.string()),
      active: z.string(),
    }),
  }),
};

export const HANDLERS = {
  action: ({ states: { core }, action }) => {
    const name = action.payload.name;
    switch (action?.type) {
      case JOIN_ACTION.name: {
        if (core.players.list.includes(name)) {
          throw new Error('409 - conflict: Player already exists');
        }
        // TODO FIX MUTATION
        core.players.list = [...core.players.list, name];
        return { core };
      }
      case LEAVE_ACTION.name: {
        if (!core.players.list.includes(name)) {
          throw new Error('404 - not found: Player does not exist');
        }
        core.players.list = core.players.list.filter((player) => player !== name);
        if (core.players.active === name) {
          const index = core.players.list.indexOf(name);
          const nextIndex = (index + 1) % core.players.list.length;

          // TODO FIX MUTATION
          core.players.active = core.players.list[nextIndex];
        }
        return { core };
      }
      default: {
        throw new Error('Invalid action');
      }
    }
  },
  check: ({ api, states }) => {
    if (api.pr) {
      if (api.pr.user.login !== states.core.players.active) {
        throw new Error('PR user is not by the active player');
      }
    }
  },
  progress: ({ states: { core } }) => {
    const index = core.players.list.indexOf(core.players.active);
    const nextIndex = (index + 1) % core.players.list.length;

    // TODO FIX MUTATION
    core.players.active = core.players.list[nextIndex];

    return {
      core: core,
    };
  },
} satisfies z.infer<typeof RULE>;
