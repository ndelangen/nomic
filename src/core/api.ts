import { Octokit } from 'octokit';
import { z } from 'zod';

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

const createOctokit = () => new Octokit({ auth: Deno.env.get('GITHUB_TOKEN') });

export const defineAPI = async () => {
  const octokit = createOctokit();
  const pr = await getPrInfo(octokit);

  return { pr, github: octokit };
};
