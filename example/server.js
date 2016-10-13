/* eslint-disable no-console */

const path = require('path');
const express = require('express');

const app = express();

app.use('/bundles', express.static(path.resolve(__dirname, './build')));
app.use('*', express.static(path.resolve(__dirname, './public')));

app.listen(1337, (err) => {
  if (err) {
    console.log(err);
    return;
  }

  console.log('Listening on 1337');
});
