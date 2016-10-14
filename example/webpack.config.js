const path = require('path');
const webpack = require('webpack');

module.exports = function configFactory() {
  return {
    entry: {
      app: [
        'react-hot-loader/patch',
        'webpack-hot-middleware/client?reload=true',
        path.resolve(__dirname, './src/index.js'),
      ],
    },
    output: {
      path: path.resolve(__dirname, './build'),
      filename: '[name].js',
      // Our code split bundles will use the below naming format.
      chunkFilename: '[name]-[chunkhash].js',
      publicPath: '/bundles/',
    },
    plugins: [
      new webpack.NoErrorsPlugin(),
      new webpack.HotModuleReplacementPlugin(),
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
      }),
    ],
    module: {
      rules: [
        {
          test: /\.js$/,
          loader: 'babel-loader',
          include: [
            path.resolve(__dirname, './src'),
            path.resolve(__dirname, '../src'),
          ],
          query: {
            presets: [
              'react',
              ['latest', { modules: false }],
            ],
          },
        },
      ],
    },
  };
};
