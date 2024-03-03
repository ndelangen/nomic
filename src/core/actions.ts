import { z } from "zod";

const JOIN_ACTION = z.object({
  type: z.literal("join"),
  payload: z.object({ name: z.string() }),
});
const LEAVE_ACTION = z.object({
  type: z.literal("leave"),
  payload: z.object({ name: z.string() }),
});

export const ACTION = z.union([JOIN_ACTION, LEAVE_ACTION]);
