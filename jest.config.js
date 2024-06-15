module.exports = {
    preset: 'ts-jest', // Use 'ts-jest' preset if you are using TypeScript, otherwise remove this line
    roots: ['<rootDir>'], // Specify the root directory for Jest to look for test files
    collectCoverage: true, // Enable code coverage reporting
    coverageReporters: ['json', 'lcov', 'text', 'clover'], // Configure coverage reporters
    testEnvironment: 'node', // Specify the test environment (e.g., 'node' for Node.js environment)
    // Other Jest configurations can be added as needed
  };
  