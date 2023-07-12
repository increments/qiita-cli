module.exports = {
  env: {
    browser: true,
    es2020: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react/jsx-runtime",
    "plugin:react-hooks/recommended",
  ],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "react"],
  rules: {
    // See https://github.com/emotion-js/emotion/issues/2878
    "react/no-unknown-property": ["error", { ignore: ["css"] }],
  },
  settings: {
    react: {
      version: "detect",
    },
  },

  // TODO
  overrides: [
    {
      rules: {
        "@typescript-eslint/no-unused-vars": "off",
      },
      files: [
        "src/client/components/Article.tsx",
        "src/client/components/SidebarContents.tsx",
        "src/client/templates/Sidebar.tsx",
        "src/commands/login.ts",
        "src/commands/preview.ts",
        "src/commands/publish.ts",
        "src/commands/pull.ts",
        "src/lib/file-system-repo.test.ts",
        "src/lib/file-system-repo.ts",
        "src/server/api/items.ts",
        "src/server/api/readme.ts",
        "src/server/app.ts",
        "src/server/lib/get-current-user.ts",
      ],
    },
    {
      rules: {
        "react-hooks/exhaustive-deps": "off",
      },
      files: [
        "src/client/components/HotReloadRoot.tsx",
        "src/client/components/SidebarArticles.tsx",
        "src/client/components/Snackbar.tsx",
        "src/client/components/Tooltip.tsx",
      ],
    },
    {
      rules: {
        "@typescript-eslint/no-explicit-any": "off",
      },
      files: [
        "src/client/lib/embed-init-scripts.ts",
        "src/lib/config.test.ts",
        "src/lib/config.ts",
        "src/lib/file-system-repo.test.ts",
        "src/lib/file-system-repo.ts",
        "src/server/api/readme.ts",
      ],
    },
    {
      rules: {
        "@typescript-eslint/ban-types": "off",
      },
      files: ["src/client/lib/entries.ts"],
    },
    {
      rules: {
        "no-prototype-builtins": "off",
      },
      files: ["src/commands/index.ts"],
    },
    {
      rules: {
        "@typescript-eslint/no-var-requires": "off",
      },
      files: ["src/lib/package-settings.ts"],
    },
  ],
};
