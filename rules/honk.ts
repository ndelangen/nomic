import { produce } from 'immer';
import { z } from 'zod';

import { HONK_ACTION, JOIN_ACTION, LEAVE_ACTION } from '../api/actions.ts';
import type { RULE } from '../api/api.ts';

export const META = {
  id: 'honk' as const,
  validator: z.object({
    v: z.number().int().positive(),
    players: z.record(
      z.string(),
      z.object({
        count: z.number().int().nonnegative(),
        lastTurn: z.number().int().nonnegative(),
      }),
    ),
  }),
};

export const HANDLERS = {
  action: ({ states: { core, honk }, action }) => {
    const name = action.payload.name;

    switch (action.type) {
      case HONK_ACTION.name: {
        if (name !== core.players.active) {
          throw new Error('403 - forbidden: Only the active player can honk');
        }

        return {
          honk: produce(honk, (draft) => {
            const current = draft.players[name] ?? { count: 0, lastTurn: 0 };

            if (current.lastTurn === core.turns.current) {
              throw new Error('409 - conflict: Player already honked this turn');
            }

            current.count += 1;
            current.lastTurn = core.turns.current;
            draft.players[name] = current;
          }),
        };
      }
      case JOIN_ACTION.name: {
        return {
          honk: produce(honk, (draft) => {
            if (!draft.players[name]) {
              draft.players[name] = { count: 0, lastTurn: 0 };
            }
          }),
        };
      }
      case LEAVE_ACTION.name: {
        return {
          honk: produce(honk, (draft) => {
            delete draft.players[name];
          }),
        };
      }
      default: {
        throw new Error('Invalid action');
      }
    }
  },
} satisfies z.infer<typeof RULE>;
