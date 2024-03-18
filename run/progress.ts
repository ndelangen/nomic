import { ACTION } from '../api/actions.ts';
import { RULE_ACTION, RULE_CHECK, RULE_PROGRESS } from '../api/api.ts';
import { entries, keys, values } from '../lib/entries.ts';
import { runAction, runCheck, runProgress } from '../lib/run.ts';

const rulesOutcomes = await runCheck();
const progressOutcomes = await runProgress();

const rulesErrors = values(rulesOutcomes).filter((outcome) => outcome instanceof Error);
const progressErrors = values(progressOutcomes).filter((outcome) => outcome instanceof Error);

rulesErrors.forEach((outcome) => {
  if (outcome instanceof Error) {
    console.log();
    console.error(outcome.stack || outcome.message);
  }
});

progressErrors.forEach((outcome) => {
  if (outcome instanceof Error) {
    console.log();
    console.error(outcome.stack || outcome.message);
  }
});

if (rulesErrors.length > 0) {
  console.log();
  console.error(`${rulesErrors.length} rules rejected.`);
}
if (progressErrors.length > 0) {
  console.log();
  console.error(`${progressErrors.length} rules rejected.`);
}

if (rulesErrors.length > 0 || progressErrors.length > 0) {
  Deno.exit(1);
}
