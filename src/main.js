
import Vue from 'vue'
import App from './App'
import router from './router'
import FastClick from 'fastclick'
import * as filters from './filters/index'
import './styles/index.scss'

Vue.config.productionTip = false
FastClick.attach(document.body)

Object.keys(filters).forEach(key => {
  Vue.filter(key, filters[key])
})

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  render: h => h(App)
})