import type { Octokit } from '@octokit/rest';

export async function updateIssue(
  octokit: Octokit,
  repository: { owner: string; name: string },
  issueNumber: number,
  data: { body?: string; title?: string },
) {
  const { body, title } = data;

  if (!body && !title) {
    throw new Error('Either body or title must be provided');
  }

  await octokit.rest.issues.update({
    owner: repository.owner,
    repo: repository.name,
    issue_number: issueNumber,
    title: title ?? undefined,
    body: body ?? undefined,
  });
}

type IssueComment = Awaited<ReturnType<Octokit['rest']['issues']['listComments']>>['data'][number];

export async function deleteComments(
  octokit: Octokit,
  repository: { owner: string; name: string },
  issueNumber: number,
  filter = (comment: IssueComment) => true,
): Promise<void> {
  const { data: comments } = await octokit.rest.issues.listComments({
    owner: repository.owner,
    repo: repository.name,
    issue_number: issueNumber,
  });

  const commentsToDelete = comments.filter(filter);

  await Promise.all(
    commentsToDelete.map((comment) =>
      octokit.rest.issues.deleteComment({
        owner: repository.owner,
        repo: repository.name,
        comment_id: comment.id,
      }),
    ),
  );
}
