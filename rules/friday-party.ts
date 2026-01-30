import type { z } from 'zod';

import type { RULE } from '../api/api.ts';

/**
 * This is the friday party rule.
 *
 * - It checks if the PR body has :tada: emoji reactions if it's posted on Fridays (UTC).
 */

export const META = {
  id: 'friday-party' as const,
};

const isItFridayUTC = (date: string) => new Date(date).getUTCDay() === 5;

export const HANDLERS = {
  check: ({ api, states: { core } }) => {
    if (api.pr && isItFridayUTC(api.pr.created_at)) {
      const playersList = core.players.list;
      const reactions = api.pr.reactions;
      const hasEveryonePartied = playersList.every((player) =>
        reactions.find((reaction) => reaction.content === 'hooray' && reaction.user?.login === player),
      );

      if (!hasEveryonePartied) {
        throw new Error('428 - Not enough partying: Not all players have partied for this Friday PR');
      }
    }
  },
} satisfies z.infer<typeof RULE>;
