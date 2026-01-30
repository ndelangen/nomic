import type { z } from 'zod';

import type { RULE } from '../api/api.ts';

/**
 * This rule checks if all players have approved the PR.
 *
 * - It checks if the PR is approved by all players.
 */

export const META = {
  id: 'reviews' as const,
};

export const HANDLERS = {
  check: ({ api, states: { core } }) => {
    if (api.pr) {
      const list = core.players.list.filter((p) => p !== core.players.active);
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
