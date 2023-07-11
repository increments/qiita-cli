/* eslint-disable @typescript-eslint/no-var-requires */
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const isProduction = process.env.NODE_ENV == "production";

/**
 * @type import('webpack').Configuration
 */
const config = {
  entry: "./src/client/index.tsx",
  output: {
    path: path.resolve(__dirname, "dist/public"),
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/client/index.html",
      publicPath: "/",
    }),
  ],
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/i,
        loader: "ts-loader",
        exclude: ["/node_modules/"],
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".jsx", ".js"],
  },
  mode: isProduction ? "production" : "development",
};

module.exports = config;
