if (process.env.NODE_ENV === 'production') {
  module.exports = require('./dist/page-observer.min.js')
} else {
  module.exports = require('./dist/page-observer.js')
}