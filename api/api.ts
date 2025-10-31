import { ACTION } from './actions.ts';
import { STATES } from './states.ts';

import { z } from 'zod';
import { Octokit } from '@octokit/rest';
import { type OctokitOptions } from '@octokit/core';

const ARGS = z.tuple([z.string(), z.string()]);
const SHA = z.string();

const Repository = z.object({
  owner: z.string(),
  name: z.string(),
});

async function getPrInfo(octokit: Octokit, repository: z.infer<typeof Repository>, pull_number: number) {
  const [pr, reviews, reactions] = await Promise.all([
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
    octokit.rest.reactions.listForIssue({
      owner: repository.owner,
      repo: repository.name,
      issue_number: pull_number,
    }),
  ]);

  return { ...pr.data, reviews: reviews.data, reactions: reactions.data };
}

const createOctokit = (options?: OctokitOptions) =>
  new Octokit({ auth: Deno.env.get('GITHUB_TOKEN'), ...options });

export const defineAPI = async ({ disableThrottle = false } = {}) => {
  const octokit = createOctokit(disableThrottle ? { throttle: { enabled: false } } : undefined);
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

const API = z.object({
  pr: z.any(),
  github: z.any(),
  repository: Repository.optional(),
}) as z.ZodType<Awaited<ReturnType<typeof defineAPI>>>;

const HANDLER_ARG_BASE = z.object({
  states: STATES,
  api: API,
});
const HANDLER_ARG_EVENT = z.object({ action: ACTION }).extend(HANDLER_ARG_BASE.shape);
const HANDLER_RETURN = z
  .union([STATES.partial(), z.void()])
  .or(z.promise(z.union([STATES.partial(), z.void()])));

export const RULE_CHECK = z.object({
  check: z.function().args(HANDLER_ARG_BASE).returns(z.promise(z.void()).or(z.void())),
});
export const RULE_PROGRESS = z.object({
  progress: z.function().args(HANDLER_ARG_BASE).returns(HANDLER_RETURN),
});
export const RULE_ACTION = z.object({
  action: z.function().args(HANDLER_ARG_EVENT).returns(HANDLER_RETURN),
});

export const RULE = z
  .never() // purely for formatting
  .or(RULE_CHECK.merge(RULE_PROGRESS.partial()).merge(RULE_ACTION.partial()))
  .or(RULE_PROGRESS.merge(RULE_CHECK.partial()).merge(RULE_ACTION.partial()))
  .or(RULE_ACTION.merge(RULE_CHECK.partial()).merge(RULE_PROGRESS.partial()));
