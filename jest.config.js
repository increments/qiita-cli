/**
 * @type import('jest').Config
 */
const config = {
  roots: ["src"],
  testMatch: ["**/*.test.(ts|tsx)"],
  transform: {
    ".(ts|tsx)$": [
      "ts-jest",
      {
        // Transpile only, without type checking. Type checking is done by `tsc`
        // (and ts-loader for src/client) with the same settings as production.
        // ts-jest's type check resolves modules differently (e.g. it ignores
        // `exports`), so it fails on packages that tsc resolves fine.
        // `module: commonjs` makes `import()` compile to `require()`, so ESM-only
        // packages can be mocked with `jest.mock`.
        // These options are merged into tsconfig.json.
        tsconfig: { isolatedModules: true, module: "commonjs" },
      },
    ],
  },
};

module.exports = config;
