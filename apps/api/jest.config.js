const baseConfig = require('@notify/jest');
const path = require('path');

module.exports = {
  ...baseConfig,
  moduleNameMapper: {
    ...baseConfig.moduleNameMapper,
    '^@notify/types$': path.resolve(__dirname, '../../packages/types/src/index.ts'),
    '^@notify/types/(.*)\\.js$': path.resolve(__dirname, '../../packages/types/src/$1.ts'),
    '^@notify/types/(.*)$': path.resolve(__dirname, '../../packages/types/src/$1'),
    '^@notify/shared$': path.resolve(__dirname, '../../packages/shared/src/index.ts'),
    '^@notify/shared/(.*)\\.js$': path.resolve(__dirname, '../../packages/shared/src/$1.ts'),
    '^@notify/validators$': path.resolve(__dirname, '../../packages/validators/src/index.ts'),
    '^@notify/validators/(.*)\\.js$': path.resolve(__dirname, '../../packages/validators/src/$1.ts'),
    // Handle the relative imports with .js extension inside the packages
    '^\\.\\/(.*)\\.js$': './$1',
  },
};
