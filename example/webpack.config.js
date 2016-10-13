const path = require('path');
const webpack = require('webpack');

// :: bool -> (Any, Any) -> Any
function ifElse(condition) {
  return (then, or) => (condition ? then : or);
}

// :: [Any] -> [Any]
function removeEmpty(x) {
  return x.filter(y => !!y);
}

module.exports = function configFactory() {
  const ifDev = ifElse(process.env.NODE_ENV === 'development');

  return {
    entry: {
      app: removeEmpty([
        ifDev('react-hot-loader/patch'),
        ifDev('webpack-hot-middleware/client?reload=true'),
        path.resolve(__dirname, './src/index.js'),
      ]),
    },
    output: {
      path: path.resolve(__dirname, './build'),
      filename: '[name].js',
      // Our code split bundles will use the below naming format.
      chunkFilename: '[name]-[chunkhash].js',
      publicPath: '/bundles/',
    },
    plugins: removeEmpty([
      new webpack.NoErrorsPlugin(),
      ifDev(new webpack.HotModuleReplacementPlugin()),
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
      }),
    ]),
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
            plugins: removeEmpty([
              ifDev('react-hot-loader/babel'),
              [
                path.resolve(__dirname, '../src/babel'),
                { noCodeSplitting: process.env.NODE_ENV === 'development' },
              ],
            ]),
          },
        },
      ],
    },
  };
};
