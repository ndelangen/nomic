'use strict';

const fromVsCodeSettings = require('./.vscode/settings.json');

/** @type {import('@cspell/cspell-types').CSpellUserSettings} */
module.exports = {
  dictionaries: fromVsCodeSettings['cSpell.dictionaries'],
  words: fromVsCodeSettings['cSpell.words'],
  useGitignore: true,
};
