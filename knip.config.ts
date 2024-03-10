import type { KnipConfig } from 'knip';

export default {
  entry: ['src/run/*.ts', 'src/rules/*.ts'],
  project: ['src/**/*.ts'],
} satisfies KnipConfig;
