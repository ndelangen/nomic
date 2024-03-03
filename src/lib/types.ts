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

export function createZZS<T>(schema: z.ZodType<T>) {
  const bb = z.object({
    schedule: Schedule.args(z.object({ state: schema, core: CORE_STATE })),
  });
  return createBase<T>(schema).and(bb);
}

export function createZZR<T>(schema: z.ZodType<T>) {
  const aa = z.object({
    rule: Rule.args(z.object({ state: schema, core: CORE_STATE })),
  });
  return createBase<T>(schema).and(aa);
}

export function createZZB<T>(schema: z.ZodType<T>) {
  const aa = createZZR(schema);
  const bb = createZZS(schema);
  return aa.or(bb).or(aa.and(bb));
}

//
export const CORE_STATE = z.object({
  id: z.string(),
  players: z.object({
    list: z.array(z.string()),
    active: z.string(),
  }),
});

type MODULE<T> = z.infer<ReturnType<typeof createZZB<T>>>;

export function defineModule<T>(module: MODULE<T>) {
  return module;
}
