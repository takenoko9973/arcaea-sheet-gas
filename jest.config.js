/** @type {import('ts-jest').JestConfigWithTsJest} **/
// eslint-disable-next-line no-undef
module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
    },
    modulePaths: ["<rootDir>/src"],
    setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
};
