export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: './src',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  moduleFileExtensions: ['ts', 'js', 'json'],
};
