import { z } from 'zod';

import { ACTION } from '../core/actions.ts';
import { ActionRuleFactory } from '../core/api.ts';
import { main } from '../lib/main.ts';

const CheckRule = ActionRuleFactory(z.unknown());

function getPayload() {
  const payloadString = Deno.env.get('ACTION_PAYLOAD');

  if (payloadString) {
    return JSON.parse(payloadString);
  }

  console.log({ payloadString });

  return {};
}

await main(async (item, { core, state, api }) => {
  const validated = CheckRule.safeParse(item);
  const type = Deno.env.get('ACTION_NAME');
  const payload = getPayload();
  const action = ACTION.parse({ type, payload });

  if (validated.success) {
    await validated.data.action({ state, core, action, api });
    console.log(`Action ${action.type} ran on ${item.id} ran successfully!`);
  }
});
