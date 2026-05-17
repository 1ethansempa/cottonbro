import type { Config } from "jest";

const config: Config = {
  moduleFileExtensions: ["js", "json", "ts"],
  rootDir: ".",
  testRegex: ".*\\.spec\\.ts$",
  transform: {
    "^.+\\.(t|j)s$": [
      "ts-jest",
      {
        useESM: true,
      },
    ],
  },
  collectCoverageFrom: ["src/**/*.(t|j)s"],
  coverageDirectory: "./coverage",
  testEnvironment: "node",
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
    "^@cottonplug/auth-server$": "<rootDir>/__mocks__/@cottonplug/auth-server.ts",
    "^@cottonplug/utils$": "<rootDir>/../../packages/core/utils/dist/index.js",
    "^@cottonplug/(.*)$": "<rootDir>/../../packages/*/$1/dist/index.js",
  },
  extensionsToTreatAsEsm: [".ts"],
  transformIgnorePatterns: [],
};

export default config;
