<template>
  <div class="chart" :style="{height:'160px'}" id="XGBchart">
  </div>
</template>

<script>
import axios from 'axios'
import chartCul from './chartCul'
import isWeekend from 'date-fns/is_weekend'
import {
  LinearIndicatorTypeFuncs
} from './layer.js'

/* eslint-disable */
export default {
  props: ['proCode'],
  data() {
    return {
      stockTrend: null,
      preValue: null,
      trendRate: null,
      canvas_el: null,
      ia_canvas_el: null,
      mid_canvas_el: null,
      ctx: null,
      ia_ctx: null,
      mid_ctx: null,
      state: {
        ready: 0,
        ctx_clock: 0, // clock for fps fixing
        ia_ctx_clock: 0,
        mid_ctx_interval: 0
      },
      lineColor: `rgba(243, 86, 77, 1)`,
      timer: 0,
      themeType: 0,
    }
  },
  created () {
    this.themeType = Number(this.$route.query.skin)
  },
  mounted() {
    this.width = window.innerWidth
    this.startInterval()
  },
  methods: {
    getData() {
      axios({
        method: 'GET',
        url: 'https://wows-api.wallstreetcn.com/v3/aioria/index/trend',
        params: {
          prod_code: this.proCode
        }
      }).then(res => {
        this.saveTrend(res.data.data.trend)
        this.savePre(res.data.data.real)
        if (this.stockTrend && this.stockTrend.length) {
          let t1130 = new Date