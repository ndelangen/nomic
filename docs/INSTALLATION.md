# Instructions

## Environment requirements

1. Install [`git`](https://git-scm.com/).
   - Configure git with your name and email.
2. Install [`Bun`](https://bun.sh/) (used as both runtime and package manager).
3. You need to setup your PATH to have access to the above tools.
   _How to do this is beyond the scope of this document._

## Account requirements

1. Ensure you have a GitHub account.
   - Configure GitHub with your name and email (the same email you use for `git`).
2. Get an invite to the game repository.
3. Accept the invite.
4. Run the "Action - Participation" action in the GitHub UI, and choose the `join` "Action to take".

## Running locally

1. Choose an editor, if you do not have a preference, [VSCode](https://code.visualstudio.com/) is the recommended choice.
2. Clone the repository using [`git`](https://git-scm.com/), alternatively you could use the GitHub CLI [`gh`](https://cli.github.com/).
3. Open the repository in your editor.
   If you are using VSCode, it will recommend installing a few extensions.
   It's strongly recommended to install these extensions.
   You can install more extensions if you like, but it's not required.
4. Open a terminal in the repository. If you are using VSCode, you can use the [integrated terminal](https://code.visualstudio.com/docs/terminal/basics) using the hotkey `⌘ + T` (MacOS).
5. Run the command `bun install` to install the dependencies.
6. Run the command `bun run check` to check the rules.

## Useful scripts

- `bun run check` - Check the rules. (this run every rules' `check` method).
- `bun run progress` - Advance the game state (this run every rules' `progress` method).
- `bun run test` - Run the tests.
- `bun run test --watch` - Run the tests, in watch mode. (new/renamed files require a restart).
- `bun run knip` - A code-quality check, will check for unused dependencies & exports.

## Adding a new rule

1. Pull latest changes from the repository on the `main` branch.
2. Create a new branch with a unique name.
   - The branch name should be descriptive of the rule you are adding.
   - The branch name should be in kebab-case.
   - The branch name should be prefixed with your username.
   - Example: `ndelangen/my-cool-rule-name`.
3. Create a new file in the `rules` directory.
   You can take inspiration from any of the existing files in the `rules` directory, or from the `core/rule.ts` file.
4. Commit the changes to your branch.
5. Push the changes to the repository.
6. Create a pull request from your branch to the `main` branch.
7. Explain the rule you are adding in the pull request description.
8. Follow any rules required by the repository, your own rule is immediately in affect on your own PR, as well as all existing rules.
9. Once all rules are satisfied, you can merge your pull request.
10. This will advance the game state automatically.
