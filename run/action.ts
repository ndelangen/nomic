import { values } from '../lib/entries.ts';
import { runAction } from '../lib/run.ts';

const outcomes = await runAction();

const errors = values(outcomes).filter((outcome) => outcome instanceof Error);

errors.forEach((outcome) => {
  if (outcome instanceof Error) {
    console.log();
    console.error(outcome.stack || outcome.message);
    return;
  }
});

if (errors.length > 0) {
  console.log();
  console.error(`${errors.length} rules rejected.`);

  Deno.exit(1);
}
