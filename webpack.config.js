const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
    entry: {
        main: "./src/index.ts",
        mobile: "./src/mobileIndex.ts",
        general: "./src/index.css",
    },
    output: {
        path: path.resolve(__dirname, "wwwroot"),
        filename: "[name].[chunkhash].js",
        publicPath: "/",
    },
    
    resolve: {
        extensions: [".js", ".ts"],
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: "ts-loader",
            },
            {
                test: /\.css$/,
                use: [MiniCssExtractPlugin.loader, "css-loader"], // Store css in '/css' folder
            },
            {
                test: /\.ttf$/,
                type: 'asset/resource',
                generator: {
                  filename: 'fonts/ttf/[name][ext]', // Store .ttf files in 'dist/fonts/ttf' folder
                },
            },
            {
                test: /\.woff2$/,
                type: 'asset/resource',
                generator: {
                  filename: 'fonts/woff2/[name][ext]', // Store .woff2 files in 'dist/fonts/woff2' folder
                },
              },
        ],
    },
    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            template: "./src/index.html",
            filename: "index.html",           // Output file name for main HTML
            chunks: ["main", "general"],      // Include only the main chunk
        }),
        new HtmlWebpackPlugin({
            template: "./src/mobileIndex.html",
            filename: "mobileIndex.html",     // Output file name for mobile HTML
            chunks: ["mobile", "general"],
        }),
        new MiniCssExtractPlugin({
            filename: "css/[name].[chunkhash].css",
        }),
    ],
};