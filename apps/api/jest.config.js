module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: [
    '**/*.(t|j)s',
    '!**/*.module.ts',
    '!main.ts',
    '!worker.ts',
  ],
  coverageDirectory: '../coverage',
  // Thresholds intentionally unset — CI has a placeholder coverage gate until a real baseline lands.
  testEnvironment: 'node',
};
