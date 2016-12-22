import webpack from 'webpack';
import MemoryFS from 'memory-fs';
import path from 'path';
import { modulePathHash } from '../../modules/utils';
import { MODULE_CHUNK_MAPPING_IDENTIFIER } from '../../modules/constants';

describe('webpack plugin', () => {
  it.only('works', () => {
    const fs = new MemoryFS();

    // First compile:
    return new Promise((resolve) => {
      const entryFilePath = path.resolve(__dirname, './_data/webpack/one.js');
      const entryFilePathOther = path.resolve(__dirname, './_data/webpack/other.js');
      const compiler = webpack({
        target: 'node',
        entry: {
          one: entryFilePath,
          other: entryFilePathOther,
        },
        output: {
          path: '/output',
          filename: '[name].js',
          chunkFilename: '[name].js',
          libraryTarget: 'var',
        },
        plugins: [
          new (require('../../modules/plugins/webpack'))(),
        ],
      });
      compiler.outputFileSystem = fs;
      compiler.run((err, stats) => resolve({ err, stats }));
    })
    // Then test:
    .then(({ err, stats }) => {
      expect(err).toBeNull();
      expect(stats.hasErrors()).toBeFalsy();

      const chunkFiles = fs.readdirSync('/output');
      expect(chunkFiles).toContain('one.js');
      expect(chunkFiles).toContain('two.js');
      expect(chunkFiles).toContain('other.js');
      expect(chunkFiles).toHaveLength(3);

      // We need to interpret the output entry file so that the
      // codeSplitWebpackRegistry gets bound to "global".
      const buildOutputFile = fs.readFileSync('/output/one.js', 'utf8');
      eval(buildOutputFile); // eslint-disable-line no-eval

      const expected = {
        modules: {
          [modulePathHash(path.resolve(__dirname, './_data/webpack/one.js'))]: 1,
          [modulePathHash(path.resolve(__dirname, './_data/webpack/two.js'))]: 0,
          [modulePathHash(path.resolve(__dirname, './_data/webpack/other.js'))]: 2,
        },
        chunks: {
          one: 2,
          two: 0,
          other: 1,
        },
      };
      expect(global[MODULE_CHUNK_MAPPING_IDENTIFIER]).toBeDefined();
      expect(global[MODULE_CHUNK_MAPPING_IDENTIFIER]).toMatchObject(expected);
    });
  });
});
