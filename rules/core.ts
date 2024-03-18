import { z } from 'zod';
import { produce } from 'immer';

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
    turns: z.object({
      current: z.number().int().positive(),
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

        return {
          core: produce(core, (draft) => {
            draft.players.list.push(name);
          }),
        };
      }
      case LEAVE_ACTION.name: {
        if (!core.players.list.includes(name)) {
          throw new Error('404 - not found: Player does not exist');
        }

        return {
          core: produce(core, (draft) => {
            draft.players.list = draft.players.list.filter((player) => player !== name);
            if (draft.players.active === name) {
              const index = draft.players.list.indexOf(name);
              const nextIndex = (index + 1) % draft.players.list.length;

              draft.players.active = draft.players.list[nextIndex];
            }
          }),
        };
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

    return {
      core: produce(core, (draft) => {
        draft.players.active = core.players.list[nextIndex];
        draft.turns.current += 1;
      }),
    };
  },
} satisfies z.infer<typeof RULE>;
