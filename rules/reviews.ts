import { z } from 'zod';

import { RULE } from '../api/api.ts';

export const META = {
  id: 'reviews' as const,
  validator: z.object({
    v: z.number().int().positive(),
  }),
};

export const HANDLERS = {
  check: ({ api, states: { core } }) => {
    if (api.pr) {
      const list = core.players.list;
      const reviews = api.pr.reviews;
      const approved = list.every((player) =>
        reviews.find((review) => review.state === 'APPROVED' && review.user?.login === player),
      );

      if (!approved) {
        throw new Error('401 - unauthorized: Not all players have approved the PR');
      }
    }
  },
} satisfies z.infer<typeof RULE>;
