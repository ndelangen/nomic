import type { KnipConfig } from 'knip';

export default {
  entry: ['./run/*.ts', './rules/*.ts'],
  project: ['./**/*.ts'],
  ignore: ['**/tests/**'],
  ignoreDependencies: ['bun-types'],
} satisfies KnipConfig;
