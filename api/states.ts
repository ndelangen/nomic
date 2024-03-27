import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';

import * as core from '../rules/core.ts';
import * as example from '../rules/example.ts';
import * as fridayParty from '../rules/friday-party.ts';
import * as gratitude from '../rules/gratitude.ts';
import * as reviews from '../rules/reviews.ts';
import * as rulesUsed from '../rules/rules-used.ts';

export const STATE_LOCATION = join(dirname(fileURLToPath(import.meta.url)), '..', `state`);

export const STATES_RAW = {
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
  [rulesUsed.META.id]: rulesUsed.HANDLERS,
  [reviews.META.id]: reviews.HANDLERS,
  [gratitude.META.id]: gratitude.HANDLERS,
  [fridayParty.META.id]: fridayParty.HANDLERS,
};
