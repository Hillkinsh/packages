const path = require('path')
const webpack = require('webpack')
process.chdir(path.join(__dirname, 'template'))
const rimraf = require('rimraf')
rimraf('./dist', () => {
  const prodConfig = require('../../webpack.prod.js')
  webpack(prodConfig, (err, stats) => {
    if (err) {
      console.error(err)
      process.exit(2)
    }
    console.log(stats.toString({
      colors: true,
      modules: false,
      children: false
    }))
  })
})