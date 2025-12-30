import nodeConfig from '@raven/eslint/node';

export default [
  ...nodeConfig,
  {
    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json',
        },
      },
    },
  },
  {
    ignores: ['dist/', 'node_modules/', 'coverage/', '**/*.js', '**/*.mjs'],
  },
];
