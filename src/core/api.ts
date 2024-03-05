import { Octokit } from 'octokit';
import { z } from 'npm:zod@^3.22.4';
// import { z } from 'zod';

// const URL = z.string().url();
// const INT = z.number().int();
// // const string = z.string();
// const USER = z.object({
//   login: z.string(),
//   id: INT,
//   node_id: z.string(),
//   gravatar_id: z.string().optional(),
//   url: URL,
// });
// const DATESTRING = z.string().datetime().optional();
// const LABEL = z.object({
//   id: INT,
//   node_id: z.string(),
//   url: URL,
//   name: z.string(),
//   description: z.string(),
//   color: z.string(),
//   default: z.boolean(),
// });
// const MILESTONE = z
//   .object({
//     url: URL,
//     id: INT,
//     node_id: z.string(),
//     number: INT,
//     state: z.string(),
//     title: z.string(),
//     description: z.string(),
//     creator: USER,
//   })
//   .optional();

// const PR = z.object({
//   url: URL,
//   id: INT,
//   node_id: z.string(),
//   number: INT,
//   state: z.enum(['open', 'closed', 'merged']),
//   locked: z.boolean(),
//   title: z.string(),
//   user: USER,
//   body: z.string(),
//   labels: z.array(LABEL),
//   milestone: MILESTONE,
//   open_issues: INT,
//   closed_issues: INT,
//   created_at: z.string().datetime(),
//   updated_at: z.string().datetime(),
//   closed_at: DATESTRING,
//   merged_at: DATESTRING,
//   merge_commit_sha: z.string().optional(),
//   assignee: USER.optional(),
//   assignees: z.array(USER),
//   requested_reviewers: z.array(USER),
// });

const ARGS = z.tuple([z.string(), z.string()]);

export async function getPrInfo(octokit: Octokit) {
  const eventName = Deno.env.get('GITHUB_EVENT_NAME');
  const result = ARGS.safeParse(Deno.env.get('GITHUB_REPOSITORY')?.split('/'));

  if (!result.success) {
    return undefined;
  }

  const [owner, repo] = result.data;

  if (eventName === 'pull_request') {
    const pull_number = parseInt(Deno.env.get('PR_NUMBER')!, 10);
    const [pr, reviews] = await Promise.all([
      octokit.rest.pulls.get({
        owner,
        repo,
        pull_number,
      }),
      octokit.rest.pulls.listReviews({
        owner,
        repo,
        pull_number,
      }),
    ]);

    return { ...pr.data, reviews: reviews.data };
  } else {
    return undefined;
  }
}

export const defineAPI = async () => {
  const githubToken = Deno.env.get('GITHUB_TOKEN');
  const octokit = new Octokit({ auth: githubToken });

  const pr = await getPrInfo(octokit);

  return { pr, github: octokit };
};
