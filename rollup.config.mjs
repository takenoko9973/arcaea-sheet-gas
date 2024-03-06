import typescript from "@rollup/plugin-typescript";
import cleanup from "rollup-plugin-cleanup";
import commonjs from "rollup-plugin-commonjs";

export default {
    input: "src/main.ts",
    output: {
        dir: "dist",
        format: "cjs",
    },
    plugins: [typescript(), cleanup({ comments: "none", extensions: [".ts"] }), commonjs()],
    context: "this",
};
