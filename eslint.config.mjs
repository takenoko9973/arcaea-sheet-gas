import eslint from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import globals from "globals";
import tseslint from "typescript-eslint";

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
                ...globals.es2021,
                ...globals.jest,
                console: "readonly",
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
