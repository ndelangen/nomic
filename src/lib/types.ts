import { z } from "zod";

export const ID = z.string().describe("The unique identifier for the module.");
export const Rule = z.function().args(z.unknown()).returns(z.promise(z.void()));
export const Schedule = z
  .function()
  .args(z.unknown())
  .returns(z.promise(z.void()));

function createBase<T>(schema: z.ZodType<T>) {
  return z.object({
    id: ID,
    load: z.function().returns(z.promise(schema)).optional(),
  });
}

export function ScheduleModuleFactory<T>(schema: z.ZodType<T>) {
  const aa = z.object({
    schedule: Schedule.args(z.object({ state: schema, core: CORE_STATE })),
  });
  return createBase<T>(schema).extend(aa.shape);
}

export function RuleModuleFactory<T>(schema: z.ZodType<T>) {
  const aa = z.object({
    rule: Rule.args(z.object({ state: schema, core: CORE_STATE })),
  });
  return createBase<T>(schema).extend(aa.shape);
}

export function ModuleFactory<T>(schema: z.ZodType<T>) {
  const aa = RuleModuleFactory<T>(schema);
  const bb = ScheduleModuleFactory<T>(schema);
  return (aa.extend(bb.shape));
}

//
export const CORE_STATE = z.object({
  id: z.string(),
  players: z.object({
    list: z.array(z.string()),
    active: z.string(),
  }),
});

// TODO: this should be valid, but BUN won't let me
// type MODULE<T> = z.infer<ReturnType<typeof ModuleFactory<T>>>
// This is the fallback
type MODULE<T> = {
  id: string;
  load?: () => Promise<T>;
} & (
  | {
      rule: (module: {
        state: T;
        core: z.infer<typeof CORE_STATE>;
      }) => Promise<void>;
    }
  | {
      schedule: (module: {
        state: T;
        core: z.infer<typeof CORE_STATE>;
      }) => Promise<void>;
    }
);

export function defineModule<T>(module: MODULE<T>) {
  return module;
}
