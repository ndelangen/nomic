import { z } from 'zod';

function defineAction<N extends string, T extends z.ZodObject<z.ZodRawShape>>(name: N, shape: T) {
  return Object.assign(
    z.object({
      type: z.literal(name),
      payload: shape,
    }),
    { name },
  );
}

export const JOIN_ACTION = defineAction('join', z.object({ name: z.string() }));
export const LEAVE_ACTION = defineAction('leave', z.object({ name: z.string() }));
export const HONK_ACTION = defineAction('honk', z.object({ name: z.string() }));

export const ACTION = z.discriminatedUnion('type', [JOIN_ACTION, LEAVE_ACTION, HONK_ACTION]);
