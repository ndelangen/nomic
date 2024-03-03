import { z } from 'zod';
import { STATE as CORE_STATE } from '../core/rule.ts';
import { ACTION } from '../core/actions.ts';

export const ID = z.string().describe('The unique identifier for the module.');
export const RuleFn = z
  .function()
  .args(z.unknown())
  .returns(z.promise(z.void()));
export const ScheduleFn = z
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
    schedule: ScheduleFn.args(z.object({ state: schema, core: CORE_STATE })),
  });
  return createBase<T>(schema).extend(aa.shape);
}

export function RuleModuleFactory<T>(schema: z.ZodType<T>) {
  const aa = z.object({
    rule: RuleFn.args(
      z.object({ state: schema, core: CORE_STATE, action: ACTION.optional() }),
    ),
  });
  return createBase<T>(schema).extend(aa.shape);
}

export function ModuleFactory<T>(schema: z.ZodType<T>) {
  const aa = RuleModuleFactory<T>(schema);
  const bb = ScheduleModuleFactory<T>(schema);
  return aa.extend(bb.shape);
}

type MODULE<T> = z.infer<ReturnType<typeof ModuleFactory<T>>>;

export function defineModule<T>(module: MODULE<T>) {
  return module;
}
