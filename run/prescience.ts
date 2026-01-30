import { values } from '../lib/entries.ts';
import { runProgress } from '../lib/run.ts';

const outcomes = await runProgress();

const errors = values(outcomes).filter((outcome) => outcome instanceof Error);

for (const outcome of errors) {
  if (outcome instanceof Error) {
    console.log();
    console.error(outcome.stack || outcome.message);
  }
}

if (errors.length > 0) {
  console.log();
  console.error(`${errors.length} rules rejected.`);

  process.exit(1);
}
