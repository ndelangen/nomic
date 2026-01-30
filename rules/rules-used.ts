import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { z } from 'zod';
import { Project, ts } from 'ts-morph';

import type { RULE } from '../api/api.ts';

/**
 * This rule ensure that all rules defined in the rules directory are used correctly.
 *
 * - It checks if all rules are used correctly in `states.ts`.
 * - It checks if all rules have a `HANDLERS` export.
 * - It demonstrates how to use the `ts-morph` library to parse TypeScript files.
 */

export const META = {
  id: 'rules-used' as const,
};

const TSCONFIG_LOCATION = join(dirname(fileURLToPath(import.meta.url)), '..');

export const HANDLERS = {
  check: () => {
    const tsConfigFilePath = join(TSCONFIG_LOCATION, 'tsconfig.json');
    const project = new Project({ tsConfigFilePath });

    const files = project
      .getSourceFiles()
      .filter((file) => relative(process.cwd(), file.getDirectoryPath()) === 'rules');

    for (const file of files) {
      const variable = file.getVariableDeclaration('HANDLERS');

      if (!variable) {
        throw new Error(`rule ${file.getBaseName()} has no HANDLERS export`);
      }

      const references = variable
        .findReferences()
        .flatMap((r) => r.getReferences())
        .filter((r) => r.getSourceFile().getBaseName() === 'states.ts');

      const outcome = references.some((r) => {
        const v = r.getNode().getFirstAncestorByKind(ts.SyntaxKind.VariableDeclaration);

        return v?.isExported() && v?.getName() === 'RULES';
      });

      if (!outcome) {
        throw new Error(`rule ${file.getBaseName()} HANDLERS export, is not used correctly in states.ts`);
      }
    }

    return;
  },
} satisfies z.infer<typeof RULE>;
