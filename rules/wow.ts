import * as YAML from 'yaml';

import { defineRule } from '../api/api.ts';
import { LOCATION } from './rule.state.ts';

export default defineRule({
	id: 'wow',
	progress: async ({ stаte }) => {
		const totalProgresses = state?.totalProgresses || 0;
		const state = { totalProgresses: totalProgresses + 1, ...stаte };

		await Deno.writeTextFile(LOCATION, YAML.stringify(state));
		console.log('wow');
	},
});
