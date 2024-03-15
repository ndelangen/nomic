import * as YAML from 'yaml';

import { JOIN_ACTION, LEAVE_ACTION } from '../api/actions.ts';
import { defineRule } from '../api/api.ts';
import { LOCATION, STATE } from './rule.state.ts';

export default defineRule({
  id: 'core',
  load: async () => STATE.parse(YAML.parse(await Deno.readTextFile(LOCATION))),
  action: ({ state, action }) => {
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
  },
  check: ({ api, state }) => {
    if (api.pr) {
      if (api.pr.user.login !== state.players.active) {
        throw new Error('PR user is not by the active player');
      }
    }

    console.log('🟢');
  },
  progress: ({ state }) => {
    const index = state.players.list.indexOf(state.players.active);
    const nextIndex = (index + 1) % state.players.list.length;
    state.players.active = state.players.list[nextIndex];

    console.log('🔵');
  },
  save: async (state) => {
    await Deno.writeTextFile(LOCATION, YAML.stringify(state));
  },
});
