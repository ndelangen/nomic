import { values } from '../lib/entries.ts';
import { runCheck, runProgress } from '../lib/run.ts';

const rulesOutcomes = await runCheck();
const progressOutcomes = await runProgress();

const rulesErrors = values(rulesOutcomes).filter((outcome) => outcome instanceof Error);
const progressErrors = values(progressOutcomes).filter((outcome) => outcome instanceof Error);

for (const outcome of rulesErrors) {
  if (outcome instanceof Error) {
    console.log();
    console.error(outcome.stack || outcome.message);
  }
}

for (const outcome of progressErrors) {
  if (outcome instanceof Error) {
    console.log();
    console.error(outcome.stack || outcome.message);
  }
}

if (rulesErrors.length > 0) {
  console.log();
  console.error(`${rulesErrors.length} rules rejected.`);
}
if (progressErrors.length > 0) {
  console.log();
  console.error(`${progressErrors.length} rules rejected.`);
}

if (rulesErrors.length > 0 || progressErrors.length > 0) {
  process.exit(1);
}
