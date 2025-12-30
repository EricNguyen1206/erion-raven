const baseConfig = require('@raven/jest');
const path = require('path');

module.exports = {
  ...baseConfig,
  moduleNameMapper: {
    ...baseConfig.moduleNameMapper,
    '^@raven/types$': path.resolve(__dirname, '../../packages/types/src/index.ts'),
    '^@raven/types/(.*)\\.js$': path.resolve(__dirname, '../../packages/types/src/$1.ts'),
    '^@raven/types/(.*)$': path.resolve(__dirname, '../../packages/types/src/$1'),
    '^@raven/shared$': path.resolve(__dirname, '../../packages/shared/src/index.ts'),
    '^@raven/shared/(.*)\\.js$': path.resolve(__dirname, '../../packages/shared/src/$1.ts'),
    '^@raven/validators$': path.resolve(__dirname, '../../packages/validators/src/index.ts'),
    '^@raven/validators/(.*)\\.js$': path.resolve(__dirname, '../../packages/validators/src/$1.ts'),
    // Handle the relative imports with .js extension inside the packages
    '^\\.\\/(.*)\\.js$': './$1',
  },
};
