# Technical overview of Nomic for Coders

The base mechanism works exclusively on GitHub with GitHub actions.

## Base branch: `main`

The base branch is protected, no-one is allowed to push to it.
The only way to update `main` is by merging PRs.

There is a GitHub app + installation with permission to bypass this restriction.
It's token to do so is environment secret and it's not possible to be used by PRs.

## Schedule

Every hour an automated GitHub action runs, and it checks if there has been a period of 24 hours without a commit on the `main` branch.
That mean no PRs have been merged in that time.

By the base rules that means, the active player neglected their duties to get their PR merged in time.

The state is updated automatically via rules.

## Manual actions

In the base rules there is a `participation` workflow, which can be triggered by members.
It can add or remove a player from the players list, without making a PR.

A new player would not be allowed to open a PR, because they cannot be the active player.

This can be used to allow for more actions players can take outside of the normal turn order with PRs.

## PRs

In the base rules a PR should be owned by the current active player.
The PR must target the `main` branch.

A PR cannot be merged until all rules pass.

Rules are checked in multiple ways..

- All rules on `main` must be passing.
- All rules on the PR itself must be passing.
- A least 1 review from another player is required.

### Merging

When a PR is merged, it's considered the end of the active player's turn.

The state is updated automatically via rules.

## State

In the base rules, state is kept in the `state/*.yml` files.
Every rule can read any state file, and even update it.

## Technology

I've used `TypeScript` as a language:

- It has a lot of the flexibility of a dynamic language
- It can enforce very strong type safety
- It's beginner friendly, with loads of information online
- It runs fast enough for our purposes

I've used `Bun` as both the runtime and package manager:

- It's fast and efficient for both running code and managing dependencies.
- It has excellent TypeScript support without needing transpilers/compilers.
- It provides a modern, unified development experience.
- It's actively developed and improving rapidly.

I've used GitHub actions as a CI:

- It's integrated with GitHub
- It's free for open-source (which nomic has no reason not to be)
- It will allow for a lot of game mechanics, such as using labels, projects, issues.

I've choses `yaml` as a data format:

- This easy just pretty easy to get right when doing manual edits.
- GitHub actions are already configured using it, so every will learn it anyway.
