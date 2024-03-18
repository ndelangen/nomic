import { z } from 'zod';

import { JOIN_ACTION, LEAVE_ACTION } from '../api/actions.ts';
import { RULE } from '../api/api.ts';

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
        console.log('welcome, ' + name);
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
