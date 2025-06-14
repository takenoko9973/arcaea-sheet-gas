/** @type {import('ts-jest').JestConfigWithTsJest} **/
// eslint-disable-next-line no-undef
module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    moduleNameMapper: { "(.+)\\.js": "$1" },
    modulePaths: ["<rootDir>/src"],
    setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
};
