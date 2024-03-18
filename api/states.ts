import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';
import { z } from 'zod';

import { entries } from '../lib/entries.ts';
import * as core from '../rules/core.ts';
import * as example from '../rules/example.ts';

export const STATE_LOCATION = join(dirname(fileURLToPath(import.meta.url)), '..', `state`);

export const STATES_RAW = {
  //
  [core.META.id]: core.META.validator.strict(),
  [example.META.id]: example.META.validator.strict(),
};
const RESULTS_RAW = {
  [core.META.id]: STATES_RAW[core.META.id].partial().or(z.instanceof(Error)),
  [example.META.id]: STATES_RAW[example.META.id].partial().or(z.instanceof(Error)),
};
export const STATES = z.object(STATES_RAW);
export const RESULTS = z.object(RESULTS_RAW).partial();

export const RULES = {
  [core.META.id]: core.HANDLERS,
  [example.META.id]: example.HANDLERS,
};

export async function readStates() {
  const states_array = await Promise.all(
    entries(STATES_RAW).map(async ([id, validator]) => {
      const data = YAML.parse(await Deno.readTextFile(join(STATE_LOCATION, `${id}.yml`)));
      const result = validator.parse(data);

      return { [id]: result };
    }),
  );

  return STATES.parse(states_array.reduce((acc, curr) => ({ ...acc, ...curr })));
}
