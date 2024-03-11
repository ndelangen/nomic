import { CheckRuleFactory, ProgressRuleFactory } from '../api/api.ts';
import { getAllRules, runRules } from '../lib/main.ts';

const allRules = await getAllRules();

const rulesOutcomes = await runRules(CheckRuleFactory, async (item, state, core, api) => {
  await item.check({ state, core, api });
})(allRules);

const progressOutcomes = await runRules(ProgressRuleFactory, async (item, state, core, api) => {
  await item.progress({ state, core, api });
})(allRules);

rulesOutcomes.forEach((outcome) => {
  console.log();
  console.error(outcome.stack || outcome.message);
});

if (rulesOutcomes.length > 0) {
  console.log();
  console.error(`${rulesOutcomes.length} rules rejected.`);
}
if (progressOutcomes.length > 0) {
  console.log();
  console.error(`${progressOutcomes.length} rules rejected.`);
}

if (rulesOutcomes.length > 0 || progressOutcomes.length > 0) {
  Deno.exit(1);
}
