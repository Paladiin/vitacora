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
          let t1130 = new Date(this.stockTrend[0][0] * 1000).setHours(11, 30, 0, 0) / 1000
          let index1130 = this.stockTrend.findIndex(i => i[0] === t1130)
          if (index1130 !== -1) {
            // console.log(source[121])
            let halfLast = JSON.parse(JSON.stringify(this.stockTrend[index1130]))
            halfLast[0] = new Date(this.stockTrend[0][0] * 1000).setHours(13, 0, 0, 0) / 1000
            this.stockTrend.splice(index1130 + 1, 0, halfLast)
          }
        }
        this.initFenshi()
      })
    },
    startInterval() {
      clearInterval(this.timer)
      this.timer = setInterval(() => {
        if (this.inStockTime()) {
          this.getData()
        }
      }, 30000)
      this.getData()
    },
    initFenshi() {
      this.selectedDate = new Date(this.stockTrend[0][0] * 1000)
      this.trendRate = this.stockTrend.map(i => {
        let timeTrend = i.map((ii, iid) => {
          return iid == 0 ? ii * 1000 : (ii / (this.preValue ? this.preValue : ii)) - 1
        })
        return timeTrend
      })
      let fields = []
      fields.push({
        name: '个股',
        code: this.symbol,
        type: 'linear',
        as: 'mountain',
        t: 0,
        val_index: 1,
        color: this.lineColor,
        line_width: 1,
        isMain: false,
        stockIndex: 1
      })

      // this.trendRate = this.trendRate.slice(0,100)
      let pattern = {
        data_source: {
          data: this.trendRate,
          fields: fields,
          time_ranges: [
            [this.selectedDate.setHours(9, 30, 0, 0), this.selectedDate.setHours(11, 30, 0, 0)],
            [this.selectedDate.setHours(13, 0, 0, 0), this.selectedDate.setHours(15, 0, 0, 0)]
          ],
          base_value: 0
        },
        price_precision: 4,
        style: {
          font: {
            family: 'Microsoft YaHei',
            size: 12
          },
          padding: {
            top: 1,
            right: 20,
            bottom: 28,
            left: 1
          },
          wheel_zoom_step: 1,
          lin