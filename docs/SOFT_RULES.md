# Soft rules

The following rules are not enforced by the game, but are expected to be followed by players.

## 1. Follow the soft rules listed here

The soft rules are not enforced by the game, but are expected to be followed by players.

When hard rules conflict with soft rules, the hard rules take precedence.

## 2. Treat other players with respect

The game is meant to be fun and educational. It's important to treat other players with respect.

As members, players, participants and observers, we make participation a harassment-free experience for all, regardless of age, body size, visible or invisible disability, ethnicity, sex characteristics, gender identity and expression, level of experience, education, socio-economic status, nationality, personal appearance, race, religion, or sexual identity and orientation.

## 3. Be patient and understanding

This is an asynchronous game, and players may be in different timezones. It's important to be patient and understanding.

The game can be adjusted in speed to accommodate the players' availability.

## 4. Be open to feedback

Your rules suggestions may be rejected, and your pull requests may be closed. It's important to have the right expectations.

Your rules suggestions may get questions, push-back or reviews, be open to feedback.

## 5. The `main` branch is protected

The `main` branch is protected, and requires a pull request to merge changes.
No player is allowed commit/push directly to the `main` branch.

This is to ensure that the game state is advanced in a controlled manner.

Only PR authors are allowed to merge their PRs.

## 6. Use the `main` branch for the game state

The `main` branch is the source of truth for the game state.
The game state on other branches is not considered.

The game state is only allowed to be advanced by merging pull requests into the `main` branch.

## 7. Do not mess with other players' branches & PRs

Do not mess with other players' branches, unless you have explicit permission.

You are allowed to:

- Place comments (asking questions or giving feedback)
- Suggest changes
- Review the PR (approve or request changes)
- Edit your own comments, suggestions & reviews
- re-run the checks (but only if there is a good reason to do so)

You are not allowed to perform any action (other than the actions explicitly allowed) that would change the PR without the PR author's consent, this includes but is not limited to the following actions:

- Commit/push changes to the branch (unless you have explicit permission by the PR author, and only for the purpose of helping the PR author within the confines the permission given by the PR author)
- Close the PR
- Merge the PR (only the PR author is allowed to merge the PR)

## 8. Turns

The game is played in turns. Each player gets a turn.

The game is played in a round-robin fashion, where each player gets a turn in order.

The active player is defined in game state `./state/core.yml` in the `players.active` field.

The active player has a certain amount of time to submit a PR and get it merged to advance the game state.

If the active player does not perform this within the time limit, the game state advances automatically, causing the next player in order becomes the active player.

## 9. Time limits

The time limit is flexible and can be adjusted to accommodate the players' availability.

It is adjusted here:
https://github.com/ndelangen/nomic/blob/c667507e9137a3c073ecaa38e4966c96fd0bed18/.github/workflows/core-schedule.yml#L34-L37

## 10 Winning

The game is won by achieving a winning condition defined in hard rules.

When it is impossible for any player to advance the game state, the game is won by the last player that advanced the game state.
