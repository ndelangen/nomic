import { ProgressRuleFactory } from '../api/api.ts';
import { getAllRules, runRules } from '../lib/main.ts';

const allRules = await getAllRules();

const progressOutcomes = await runRules(ProgressRuleFactory, async (item, state, core, api) => {
  await item.progress({ state, core, api });
})(allRules);

if (progressOutcomes.length > 0) {
  console.log();
  console.error(`${progressOutcomes.length} rules rejected.`);
}

if (progressOutcomes.length > 0) {
  Deno.exit(1);
}
