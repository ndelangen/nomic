import { Octokit } from 'octokit';
import { z } from 'zod';

const ARGS = z.tuple([z.string(), z.string()]);

export const Repository = z.object({
  owner: z.string(),
  name: z.string(),
});

export async function getPrInfo(octokit: Octokit, repository: z.infer<typeof Repository>) {
  const eventName = Deno.env.get('GITHUB_EVENT_NAME');

  if (eventName === 'pull_request') {
    const pull_number = parseInt(Deno.env.get('PR_NUMBER')!, 10);
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
  } else {
    return undefined;
  }
}

const createOctokit = () => new Octokit({ auth: Deno.env.get('GITHUB_TOKEN') });

export const defineAPI = async () => {
  const octokit = createOctokit();
  const result = ARGS.safeParse(Deno.env.get('GITHUB_REPOSITORY')?.split('/'));

  const repository = result.success ? { owner: result.data[0], name: result.data[1] } : undefined;

  const pr = result.success ? await getPrInfo(octokit, Repository.parse(repository)) : undefined;

  return { pr, github: octokit, repository };
};
