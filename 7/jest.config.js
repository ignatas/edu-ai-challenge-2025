export default {
  testEnvironment: 'node',
  transform: {},
  injectGlobals: true,
  collectCoverageFrom: ['*.js', '!seabattle.js', '!seabattle-modern.js', '!jest.config.js', '!Colors.js'],
  coverageThreshold: {
    global: {
      branches: 74,
      functions: 85,
      lines: 74,
      statements: 74,
    },
  },
  testMatch: ['**/*.test.js'],
};
