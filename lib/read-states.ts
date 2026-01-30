import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import YAML from 'yaml';

import { STATES, STATES_RAW, STATE_LOCATION } from '../api/states.ts';
import { entries } from './entries.ts';

export async function readStates() {
  const states_array = await Promise.all(
    entries(STATES_RAW).map(async ([id, validator]) => {
      const data = YAML.parse(await readFile(join(STATE_LOCATION, `${id}.yml`), 'utf-8'));
      const result = validator.parse(data);

      return { [id]: result };
    }),
  );

  return STATES.parse(
    states_array.reduce((acc, curr) => {
      Object.assign(acc, curr);
      return acc;
    }, {}),
  );
}
