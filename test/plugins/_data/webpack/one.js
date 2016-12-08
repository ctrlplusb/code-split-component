/* eslint-disable */
module.exports = function one(cb) {
  require.ensure(
    [],
    function cb(require) {
      cb(require('./two'));
    },
    'two'
  );
}
