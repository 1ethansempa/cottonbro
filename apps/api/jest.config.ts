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
    "^@cottonbro/auth-server$": "<rootDir>/__mocks__/@cottonbro/auth-server.ts",
    "^@cottonbro/(.*)$": "<rootDir>/../../packages/*/$1/dist/index.js",
  },
  extensionsToTreatAsEsm: [".ts"],
  transformIgnorePatterns: [],
};

export default config;
