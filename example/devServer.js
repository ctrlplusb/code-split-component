/* eslint-disable no-console */

const path = require('path');
const express = require('express');
const webpack = require('webpack');
const webpackConfigFactory = require('./webpack.config.js');

const webpackConfig = webpackConfigFactory();

const app = express();
const compiler = webpack(webpackConfig);

app.use(require('webpack-dev-middleware')(compiler, {
  noInfo: true,
  publicPath: webpackConfig.output.publicPath,
}));

app.use(require('webpack-hot-middleware')(compiler));

app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, './public/index.html'));
});

app.listen(1337, (err) => {
  if (err) {
    console.log(err);
    return;
  }

  console.log('Listening on 1337');
});
