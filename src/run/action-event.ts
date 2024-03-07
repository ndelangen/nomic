import { main } from '../lib/main.ts';

const out = Deno.env.get('ACTION');

await main(async (item, { core, state, api }) => {
  console.log({ out });
});
