import { ACTION } from '../api/actions.ts';
import { ActionRuleFactory } from '../api/api.ts';
import { getAllRules, runRules } from '../lib/main.ts';

const allRules = await getAllRules();
const outcomes = await runRules(ActionRuleFactory, async (item, state, core, api) => {
  const type = Deno.env.get('ACTION_NAME');
  const payload = JSON.parse(Deno.env.get('ACTION_PAYLOAD') || '');

  const action = ACTION.parse({ type, payload });

  await item.action({ state, core, action, api });

  console.log(`Action ${action.type} ran on ${item.id} ran successfully!`);
})(allRules);

outcomes.forEach((outcome) => {
  console.log();
  console.error(outcome.stack || outcome.message);
});

if (outcomes.length > 0) {
  console.log();
  console.error(`${outcomes.length} rules rejected.`);

  Deno.exit(1);
}
