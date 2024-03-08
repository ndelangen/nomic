import { z } from 'zod';
import { ACTION } from '../core/actions.ts';
import { Repository, defineAPI } from '../core/api.ts';
import { STATE as CORE_STATE } from '../core/rule.ts';

export const ID = z.string().describe('The unique identifier for the module.');
export const CheckFn = z.function().args(z.unknown()).returns(z.promise(z.void()));
export const ProgressFn = z.function().args(z.unknown()).returns(z.promise(z.void()));

export const API = z.object({
  pr: z.any(),
  github: z.any(),
  repository: Repository.optional(),
}) as z.ZodType<Awaited<ReturnType<typeof defineAPI>>>;

function createBase<T>(schema: z.ZodType<T>) {
  return z.object({
    id: ID,
    load: z.function().returns(z.promise(schema).or(schema)).optional(),
  });
}

export function ProgressRuleFactory<T>(schema: z.ZodType<T>) {
  const aa = z.object({
    progress: ProgressFn.args(z.object({ state: schema, core: CORE_STATE, api: API })),
  });
  return createBase<T>(schema).extend(aa.shape);
}

export function CheckRuleFactory<T>(schema: z.ZodType<T>) {
  const aa = z.object({
    check: CheckFn.args(
      z.object({
        state: schema,
        core: CORE_STATE,
        action: ACTION.optional(),
        api: API,
      }),
    ),
  });
  return createBase<T>(schema).extend(aa.shape);
}

export function RuleFactory<T>(schema: z.ZodType<T>) {
  const aa = CheckRuleFactory<T>(schema);
  const bb = ProgressRuleFactory<T>(schema);
  return aa.or(bb).or(aa.and(bb));
}

type RULE<T> = z.infer<ReturnType<typeof RuleFactory<T>>>;

export function defineRule<T>(module: RULE<T>) {
  return module;
}
