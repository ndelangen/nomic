import { Octokit } from 'octokit';
import { z } from 'zod';

const ARGS = z.tuple([z.string(), z.string()]);
const SHA = z.string();

export const Repository = z.object({
  owner: z.string(),
  name: z.string(),
});

export async function getPrInfo(
  octokit: Octokit,
  repository: z.infer<typeof Repository>,
  pull_number: number,
) {
  const eventName = Deno.env.get('GITHUB_EVENT_NAME');

  if (eventName === 'pull_request') {
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
  const repo = ARGS.safeParse(Deno.env.get('GITHUB_REPOSITORY')?.split('/'));
  const sha = SHA.safeParse(Deno.env.get('SHA'));
  let pull_number = parseInt(Deno.env.get('PR_NUMBER')!, 10);

  const repository = repo.success ? { owner: repo.data[0], name: repo.data[1] } : undefined;

  console.log({ repository });

  if (sha.success && repository && !pull_number) {
    const prs = await octokit.rest.pulls.list({
      owner: repository.owner,
      repo: repository.name,
      state: 'open',
      base: 'main',
      per_page: 10,
    });

    console.log({ prs });

    const pr = prs.data.find((pr) => pr.head.sha === sha.data);

    console.log({ pr });

    if (pr) {
      pull_number = pr.number;
    }
  }

  const pr = repo.success ? await getPrInfo(octokit, Repository.parse(repository), pull_number) : undefined;

  console.log({ final: pr });

  return { pr, github: octokit, repository };
};
