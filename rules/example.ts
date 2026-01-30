import { z } from 'zod';

import { JOIN_ACTION, LEAVE_ACTION } from '../api/actions.ts';
import type { RULE } from '../api/api.ts';

/**
 * This is an example rule. It does nothing.
 *
 * - It demonstrates the structure of a rule.
 * - It demonstrates how to handle actions.
 * - It demonstrates how set up a state for a rule.
 */

export const META = {
  id: 'example' as const,
  validator: z.object({
    v: z.number().int().positive(),
  }),
};

export const HANDLERS = {
  action: ({ action }) => {
    const name = action.payload.name;
    switch (action?.type) {
      case JOIN_ACTION.name: {
        console.log(`welcome, ${name}`);
        return;
      }
      case LEAVE_ACTION.name: {
        console.log('bye');
        return;
      }
      default: {
        throw new Error('Invalid action');
      }
    }
  },
} satisfies z.infer<typeof RULE>;
