import type { z } from 'zod';

import type { RULE } from '../api/api.ts';

/**
 * This is the gratitude rule.
 *
 * - It checks if the PR body contains a gratitude message.
 */

export const META = {
  id: 'gratitude' as const,
};

export const HANDLERS = {
  check: ({ api }) => {
    if (api.pr) {
      const approved = api.pr.body?.includes('I am grateful for');

      if (!approved) {
        throw new Error('428 - Gratitude required: Please express gratitude in the PR body.');
      }
    }
  },
} satisfies z.infer<typeof RULE>;
