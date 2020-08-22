'use strict'
const merge = require('webpack-merge')
const prodEnv = require('./prod.env')

// module.exports = merge(prodEnv, {
//   NODE_ENV: '"development"'
// })

module.exports = {
  NODE_ENV: '"development"',
  BASE_URL: '"https://alli-api-sit.xuangubao.cn"'
}
