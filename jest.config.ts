module.exports = {
  testEnvironment: 'jsdom',  // Ensure this is set correctly
  transform: {
    '^.+\\.[t|j]sx?$': 'babel-jest',  // or ts-jest for TypeScript
  },
  setupFilesAfterEnv: ['@testing-library/jest-dom/extend-expect'],  // For extended matchers
};
