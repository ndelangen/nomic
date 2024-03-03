import { z } from 'zod';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineModule } from '../lib/types.ts';
import * as YAML from 'yaml';

const LOCATION = join(
  dirname(fileURLToPath(import.meta.url)),
  '../../state/core.yml',
);

export const STATE = z.object({
  id: z.string(),
  players: z.object({
    list: z.array(z.string()),
    active: z.string(),
  }),
});

export default defineModule({
  id: 'core',
  load: async () => STATE.parse(YAML.parse(await Deno.readTextFile(LOCATION))),
  rule: async ({ state, action }) => {
    if (action) {
      const name = action.payload.name;
      switch (action?.type) {
        case 'join': {
          if (state.players.list.includes(name)) {
            throw new Error('409 - conflict: Player already exists');
          }
          state.players.list = [...state.players.list, name];
          break;
        }
        case 'leave': {
          if (!state.players.list.includes(name)) {
            throw new Error('404 - not found: Player does not exist');
          }
          state.players.list = state.players.list.filter(
            (player) => player !== name,
          );
          break;
        }
        default: {
          throw new Error('Invalid action');
        }
      }
      await Deno.writeTextFile(LOCATION, YAML.stringify(state));
    }

    console.log('🟢');
  },
  schedule: async ({ state }) => {
    const index = state.players.list.indexOf(state.players.active);
    const nextIndex = (index + 1) % state.players.list.length;
    state.players.active = state.players.list[nextIndex];

    await Deno.writeTextFile(LOCATION, YAML.stringify(state));

    console.log('🔵');
  },
});
