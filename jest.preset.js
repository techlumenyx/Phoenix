const nxPreset = require('@nx/jest/preset').default;

module.exports = {
  ...nxPreset,
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]sx?$': ['ts-jest', {
      tsconfig: '<rootDir>/tsconfig.spec.json',
      useESM: false,
    }],
  },
  moduleNameMapper: {
    '@christian-listings/types': '<rootDir>/../../libs/types/src/index.ts',
    '@christian-listings/auth': '<rootDir>/../../libs/auth/src/index.ts',
    '@christian-listings/db': '<rootDir>/../../libs/db/src/index.ts',
    '@christian-listings/utils': '<rootDir>/../../libs/utils/src/index.ts',
  },
};
