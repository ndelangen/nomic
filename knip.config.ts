import type { KnipConfig } from 'knip';

export default {
  entry: ['./run/*.ts', './rules/*.ts', './core/rule.ts'],
  project: ['./**/*.ts'],
  ignore: ['**/tests/**'],
} satisfies KnipConfig;
