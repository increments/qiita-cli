/**
 * @type import('jest').Config
 */
const config = {
  roots: ["src"],
  testMatch: ["**/*.test.(ts|tsx)"],
  transform: {
    ".(ts|tsx)$": "ts-jest",
  },
};

module.exports = config;
