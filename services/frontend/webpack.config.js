const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './src/main.ts',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'build'),
  },
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  devServer: {
    liveReload: true,
    static: {
      directory: path.join(__dirname, 'build'),
      publicPath: '/',
    },
    devMiddleware: {
      writeToDisk: true,
    },
    watchFiles: ['src/**/*', 'public/**/*'],
    hot: true,
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html', // uses your HTML as a template
    }),
  ],
};
