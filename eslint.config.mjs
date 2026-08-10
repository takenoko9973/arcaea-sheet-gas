import globals from "globals";
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier";

const googleAppsScriptGlobals = {
    LockService: "readonly",
    PropertiesService: "readonly",
    ScriptApp: "readonly",
    SpreadsheetApp: "readonly",
    Utilities: "readonly",
};

export default tseslint.config(
    {
        ignores: [
            "node_modules/**",
            "dist/**",
            "build/**",
            "coverage/**",
            ".yarn/**",
            ".pnp.*",
            "yarn.lock",
        ],
    },
    {
        files: ["**/*.{js,mjs,cjs}"],
        extends: [eslint.configs.recommended],
        languageOptions: {
            globals: {
                ...globals.node,
                ...globals.jest,
            },
        },
    },
    {
        files: ["src/**/*.ts"],
        extends: [eslint.configs.recommended, tseslint.configs.recommendedTypeChecked],
        languageOptions: {
            globals: {
                ...globals.node,
                ...globals.jest,
                ...googleAppsScriptGlobals,
            },
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
    },
    eslintConfigPrettier
);
