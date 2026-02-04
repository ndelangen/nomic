import { execSync } from 'node:child_process';

export function getGitCommitSha(): string {
  try {
    return execSync('git rev-parse HEAD', { encoding: 'utf-8' }).trim();
  } catch {
    return process.env.GITHUB_SHA || 'unknown';
  }
}

export function getLastCommitTimestamp() {
  const timestamp = execSync('git log --pretty="%ct" -n 1', { encoding: 'utf-8' }).trim();
  return Number.parseInt(timestamp, 10);
}
