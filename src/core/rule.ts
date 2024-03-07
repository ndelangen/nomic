import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as YAML from 'yaml';
import { z } from 'zod';
import { defineRule } from '../lib/types.ts';
import { JOIN_ACTION, LEAVE_ACTION } from './actions.ts';

const LOCATION = join(dirname(fileURLToPath(import.meta.url)), '../../state/core.yml');

export const STATE = z.object({
  id: z.string(),
  players: z.object({
    list: z.array(z.string()),
    active: z.string(),
  }),
});

export default defineRule({
  id: 'core',
  load: async () => STATE.parse(YAML.parse(await Deno.readTextFile(LOCATION))),
  check: async ({ state, action, api }) => {
    if (action) {
      const name = action.payload.name;
      switch (action?.type) {
        case JOIN_ACTION.name: {
          if (state.players.list.includes(name)) {
            throw new Error('409 - conflict: Player already exists');
          }
          state.players.list = [...state.players.list, name];
          break;
        }
        case LEAVE_ACTION.name: {
          if (!state.players.list.includes(name)) {
            throw new Error('404 - not found: Player does not exist');
          }
          state.players.list = state.players.list.filter((player) => player !== name);
          if (state.players.active === name) {
            const index = state.players.list.indexOf(name);
            const nextIndex = (index + 1) % state.players.list.length;
            state.players.active = state.players.list[nextIndex];
          }
          break;
        }
        default: {
          throw new Error('Invalid action');
        }
      }
      await Deno.writeTextFile(LOCATION, YAML.stringify(state));
    }

    if (api.pr) {
      if (api.pr.user.login !== state.players.active) {
        throw new Error('PR user is not by the active player');
      }
    }

    console.log('🟢');
  },
  progress: async ({ state }) => {
    const index = state.players.list.indexOf(state.players.active);
    const nextIndex = (index + 1) % state.players.list.length;
    state.players.active = state.players.list[nextIndex];

    await Deno.writeTextFile(LOCATION, YAML.stringify(state));

    console.log('🔵');
  },
});
