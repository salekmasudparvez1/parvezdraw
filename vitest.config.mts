import path from "path";

import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: [
      {
        find: /^@prof\/common$/,
        replacement: path.resolve(__dirname, "./packages/common/src/index.ts"),
      },
      {
        find: /^@prof\/common\/(.*?)/,
        replacement: path.resolve(__dirname, "./packages/common/src/$1"),
      },
      {
        find: /^@prof\/element$/,
        replacement: path.resolve(__dirname, "./packages/element/src/index.ts"),
      },
      {
        find: /^@prof\/element\/(.*?)/,
        replacement: path.resolve(__dirname, "./packages/element/src/$1"),
      },
      {
        find: /^@prof\/core$/,
        replacement: path.resolve(__dirname, "./packages/prof/index.tsx"),
      },
      {
        find: /^@prof\/core\/(.*?)/,
        replacement: path.resolve(__dirname, "./packages/prof/$1"),
      },
      {
        find: /^@prof\/math$/,
        replacement: path.resolve(__dirname, "./packages/math/src/index.ts"),
      },
      {
        find: /^@prof\/math\/(.*?)/,
        replacement: path.resolve(__dirname, "./packages/math/src/$1"),
      },
      {
        find: /^@prof\/utils$/,
        replacement: path.resolve(__dirname, "./packages/utils/src/index.ts"),
      },
      {
        find: /^@prof\/utils\/(.*?)/,
        replacement: path.resolve(__dirname, "./packages/utils/src/$1"),
      },
      {
        find: /^@prof\/fractional-indexing$/,
        replacement: path.resolve(
          __dirname,
          "./packages/fractional-indexing/src/index.ts",
        ),
      },
      {
        find: /^@prof\/fractional-indexing\/(.*?)/,
        replacement: path.resolve(
          __dirname,
          "./packages/fractional-indexing/src/$1",
        ),
      },
      {
        find: /^@prof\/laser-pointer$/,
        replacement: path.resolve(
          __dirname,
          "./packages/laser-pointer/src/index.ts",
        ),
      },
      {
        find: /^@prof\/laser-pointer\/(.*?)/,
        replacement: path.resolve(__dirname, "./packages/laser-pointer/src/$1"),
      },
    ],
  },
  //@ts-ignore
  test: {
    // Since hooks are running in stack in v2, which means all hooks run serially whereas
    // we need to run them in parallel
    sequence: {
      hooks: "parallel",
    },
    setupFiles: ["./setupTests.ts"],
    globals: true,
    environment: "jsdom",
    // don't list skipped tests in the failure tree — keeps output readable
    hideSkippedTests: true,
    coverage: {
      reporter: ["text", "json-summary", "json", "html", "lcovonly"],
      // Since v2, it ignores empty lines by default and we need to disable it as it affects the coverage
      // Additionally the thresholds also needs to be updated slightly as a result of this change
      ignoreEmptyLines: false,
      thresholds: {
        lines: 60,
        branches: 70,
        functions: 63,
        statements: 60,
      },
    },
  },
});
