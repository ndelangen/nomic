import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineAPI } from '../api/api.ts';
import { getGitCommitSha, getLastCommitTimestamp } from '../lib/git.ts';
import { deleteComments, updateIssue } from '../lib/github-issue.ts';
import { formatTimeRemaining } from '../lib/inactivity.ts';
import { readStates } from '../lib/read-states.ts';

async function deletePreviousNotificationComments(
  octokit: Awaited<ReturnType<typeof defineAPI>>['github'],
  repository: { owner: string; name: string },
  issueNumber: number,
): Promise<void> {

  const notificationPattern = /it's your turn/i;
  const filter: Parameters<typeof deleteComments>[3] = (comment) =>
    comment.user?.type === 'Bot' && comment.user?.name === 'nomic-commit' && notificationPattern.test(comment.body || '');

  await deleteComments(octokit, repository, issueNumber, filter);
}

async function generateVisualization(input: {
  states: Awaited<ReturnType<typeof readStates>>;
  gitInfo: { commitSha: string; timestamp: number };
  turnInfo: { remainingSeconds: number };
}) {
  const { states, gitInfo, turnInfo } = input;

  const commitURL = `https://github.com/${process.env.GITHUB_REPOSITORY || 'owner/repo'}/commit/${gitInfo.commitSha}`;

  const lines: string[] = [
    '# Nomic Game State',
    '',
    `- **Current turn**: \`${states.core.turns.current}\``,
    `- **Active Player**: @${states.core.players.active}`,
    `- **Time Remaining**: ${formatTimeRemaining(turnInfo.remainingSeconds)}`,
  ];

  // Add metadata section
  lines.push('', '---', '');
  lines.push('## Metadata', '');
  lines.push(`- **Last Updated**: ${new Date(gitInfo.timestamp * 1000).toISOString()}`);
  lines.push(`- **Commit**: [${gitInfo.commitSha.substring(0, 7)}](${commitURL})`);
  lines.push(`- **Generated at**: ${new Date().toISOString()}`);
  lines.push('');

  return lines.join('\n');
}

const states = await readStates();
const activePlayer = states.core.players.active;
const turnNumber = states.core.turns.current;

const gitInfo = {
  commitSha: getGitCommitSha(),
  timestamp: getLastCommitTimestamp(),
};

const now = Math.floor(Date.now() / 1000);
const elapsedSeconds = now - gitInfo.timestamp;
const thresholdSeconds = 7 * 24 * 60 * 60;
const remainingSeconds = thresholdSeconds - elapsedSeconds;

const turnInfo = {
  remainingSeconds,
};

const content = await generateVisualization({ states, gitInfo, turnInfo });
const outputPath = join(dirname(fileURLToPath(import.meta.url)), '..', 'visualization', 'state.md');

const issueNumber = 53;

const api = await defineAPI();
if (api.repository && process.env.GITHUB_TOKEN) {
  try {
    const title = `Turn \`${turnNumber ?? '?'}\` - Active Player: ${activePlayer}`;
    await updateIssue(api.github, api.repository, issueNumber, {
      body: content,
      title,
      assignees: [activePlayer],
    });
    console.log(`Updated GitHub issue #${issueNumber}`);

    // Delete previous notification comments first
    await deletePreviousNotificationComments(api.github, api.repository, issueNumber);
    console.log('Deleted previous notification comments');

    // Post new one
    await api.github.rest.issues.createComment({
      owner: api.repository.owner,
      repo: api.repository.name,
      issue_number: issueNumber,
      body: `Hey @${activePlayer}, it's your turn! 🎮`,
    });

    console.log(`Posted turn notification for @${activePlayer}`);
  } catch (error) {
    console.error('Error updating issue:', error);
  }
} else {
  console.log(`Visualization generated at: ${outputPath}`);
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, content, 'utf-8');
}
