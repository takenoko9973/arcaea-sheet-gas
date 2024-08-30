import globals from "globals";
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier";
import googleappsscript from "eslint-plugin-googleappsscript";

export default tseslint.config(
    {
        files: ["src/**/*.{js,jsx,ts,tsx}"],
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
                ...globals.es2019,
                ...googleappsscript.environments.googleappsscript.globals,
            },
            parserOptions: {
                ecmaVersion: "latest",
                project: "./tsconfig.json",
            },
        },
    },
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    eslintConfigPrettier
);
