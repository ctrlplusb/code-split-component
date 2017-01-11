/* @flow */

import { inInstall } from 'in-publish';
import { exec } from '../utils';

if (inInstall()) {
  process.exit(0);
}

exec('cross-env BABEL_ENV=commonjs babel ./src -d ./commonjs');
