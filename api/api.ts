import { ACTION } from './actions.ts';
import { STATES } from './states.ts';

import { z } from 'zod';
import { Octokit } from '@octokit/rest';
import type { OctokitOptions } from '@octokit/core';

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
  new Octokit({ auth: process.env.GITHUB_TOKEN, ...options });

export const defineAPI = async ({ disableThrottle = false } = {}) => {
  const octokit = createOctokit(disableThrottle ? { throttle: { enabled: false } } : undefined);
  const repo = ARGS.safeParse(process.env.GITHUB_REPOSITORY?.split('/'));
  const sha = SHA.safeParse(process.env.SHA);
  let pull_number = Number.parseInt(process.env.PR_NUMBER || '0', 10);

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

type API = Awaited<ReturnType<typeof defineAPI>>;

// Use z.custom with type predicate to preserve TypeScript type for inference
// while still allowing zod runtime validation
const API = z.custom<API>((val): val is API => {
  return typeof val === 'object' && val !== null && 'pr' in val && 'github' in val;
});

const HANDLER_ARG_BASE = z.object({
  states: STATES,
  api: API,
});
const HANDLER_ARG_EVENT = z.object({ action: ACTION }).extend(HANDLER_ARG_BASE.shape);
const HANDLER_RETURN = z
  .union([STATES.partial(), z.void()])
  .or(z.promise(z.union([STATES.partial(), z.void()])));

export const RULE_CHECK = z.object({
  check: z.function({ input: [HANDLER_ARG_BASE], output: z.promise(z.void()).or(z.void()) }),
});
export const RULE_PROGRESS = z.object({
  progress: z.function({ input: [HANDLER_ARG_BASE], output: HANDLER_RETURN }),
});
export const RULE_ACTION = z.object({
  action: z.function({ input: [HANDLER_ARG_EVENT], output: HANDLER_RETURN }),
});

export const RULE = z
  .never() // purely for formatting
  .or(RULE_CHECK.extend(RULE_PROGRESS.partial().shape).extend(RULE_ACTION.partial().shape))
  .or(RULE_PROGRESS.extend(RULE_CHECK.partial().shape).extend(RULE_ACTION.partial().shape))
  .or(RULE_ACTION.extend(RULE_CHECK.partial().shape).extend(RULE_PROGRESS.partial().shape));
