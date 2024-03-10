import { ACTION } from './actions.ts';
import { STATE as CORE_STATE } from './STATE.ts';

import { Octokit } from 'octokit';
import { z } from 'zod';

const ARGS = z.tuple([z.string(), z.string()]);
const SHA = z.string();

const Repository = z.object({
  owner: z.string(),
  name: z.string(),
});

async function getPrInfo(octokit: Octokit, repository: z.infer<typeof Repository>, pull_number: number) {
  const [pr, reviews] = await Promise.all([
    octokit.rest.pulls.get({
      owner: repository.owner,
      repo: repository.name,
      pull_number,
    }),
    octokit.rest.pulls.listReviews({
      owner: repository.owner,
      repo: repository.name,
      pull_number,
    }),
  ]);

  return { ...pr.data, reviews: reviews.data };
}

const createOctokit = () => new Octokit({ auth: Deno.env.get('GITHUB_TOKEN') });

export const defineAPI = async () => {
  const octokit = createOctokit();
  const repo = ARGS.safeParse(Deno.env.get('GITHUB_REPOSITORY')?.split('/'));
  const sha = SHA.safeParse(Deno.env.get('SHA'));
  let pull_number = parseInt(Deno.env.get('PR_NUMBER')!, 10);

  const repository = repo.success ? { owner: repo.data[0], name: repo.data[1] } : undefined;

  if (sha.success && repository && !pull_number) {
    const prs = await octokit.rest.pulls.list({
      owner: repository.owner,
      repo: repository.name,
      state: 'open',
      base: 'main',
      per_page: 10,
    });

    const pr = prs.data.find((pr) => pr.head.sha === sha.data);

    if (pr) {
      pull_number = pr.number;
    }
  }

  const pr =
    repo.success && pull_number
      ? await getPrInfo(octokit, Repository.parse(repository), pull_number)
      : undefined;

  return { pr, github: octokit, repository };
};

const ID = z.string().describe('The unique identifier for the module.');

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
    progress: z
      .function()
      .args(z.object({ state: schema, core: CORE_STATE, api: API }))
      .returns(z.promise(z.void())),
  });
  return createBase<T>(schema).extend(aa.shape);
}

export function CheckRuleFactory<T>(schema: z.ZodType<T>) {
  const aa = z.object({
    check: z
      .function()
      .args(z.object({ state: schema, core: CORE_STATE, api: API }))
      .returns(z.promise(z.void())),
  });
  return createBase<T>(schema).extend(aa.shape);
}
export function ActionRuleFactory<T>(schema: z.ZodType<T>) {
  const aa = z.object({
    action: z
      .function()
      .args(z.object({ state: schema, core: CORE_STATE, api: API, action: ACTION }))
      .returns(z.promise(z.void())),
  });
  return createBase<T>(schema).extend(aa.shape);
}

export function RuleFactory<T>(schema: z.ZodType<T>) {
  const aa = CheckRuleFactory<T>(schema);
  const bb = ProgressRuleFactory<T>(schema);
  const cc = ActionRuleFactory<T>(schema);
  return aa.or(bb).or(cc).or(aa.and(bb)).or(aa.and(cc)).or(bb.and(cc)).or(aa.and(bb).and(cc));
}

type RULE<T> = z.infer<ReturnType<typeof RuleFactory<T>>>;

export function defineRule<T>(module: RULE<T>) {
  return RuleFactory(z.unknown()).parse(module) as RULE<T>;
}
