const path = require('path');
const GasPlugin = require('gas-webpack-plugin');

module.exports = {
    mode: 'development',
    // devtool: 'inline-source-map',
    context: __dirname,
    entry: {
        main: path.resolve(__dirname, 'src', 'main.ts')
    },
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'dist'),
        clean: true,
    },
    resolve: {
        extensions: ['.ts', '.js'],
        alias: {
            "@": path.resolve(__dirname, "src"),
        },
    },
    module: {
        rules: [
            {
                test: /\.(js|ts)$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    plugins: [
        new GasPlugin({
            autoGlobalExportsFiles: ['src/main.ts']
        }), // このプラグインが全てを自動化してくれる
    ],
};
