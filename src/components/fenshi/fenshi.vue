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
          linear_last_point: false,
          linear_name_label: true,
          linear_label: {
            height: 20,
            width: 60,
            left: 0,
            font_color: '#ffffff',
            font_size: 12,
            font_style: '12px Microsoft YaHei'
          },
          xgb_style: true,
          tip: {
            high_color: '#FF4040',
            low_color: '#1EB955',
            curr_price: {
              line_width: 1,
              line_color: 'rgba(0,0,0,0)',
              label_bg: 'rgba(0,0,0,0)',
              label_color: 'rgba(0,0,0,0)',
              label_height: 20
            }
          },
          crosshair: {
            snap_to_close: false,
            color: '#979797',
            label_height: 20,
            label_bg: '#EFEFEF',
            label_color: '#333',
            label_horiz_padding: 5,
            pos_offset: {
              vertical: {
                x: 60,
                y: 0,
                width: 0
              }, // 0 means auto
              horizontal: {
                x: 0,
                y: 6,
                width: 0
              }
            },
            selected_point_color: ['rgba(243, 86, 77,0.2)', 'rgba(243, 86, 77,1)']
          },
          grid: {
            bg: this.themeType ? '#151928' : '#ffffff',

            limit: {
              y: [2, 6]
            },
            color: {
              x: '#f0f0f0',
              y: '#f0f0f0'
            },
            span: {
              x: 120,
              y: 30
            }
          },
          axis: {
            x_axis_pos: 1, // 1 means on bottom, -1 means on top
            y_axis_pos: -1, // 1 means on right, -1 means on left
            hide_candlestick_date: false,
            hide_candlestick_time: false,
            show_rate: false,
            label_pos: {
              x_axis: {
                x: -35,
                y: 20
              },
              y_axis: {
                x: 60,
                y: 4
              }
            },
            label_color: '#999',
            pointer_length: 0,
            bg_color: 'rgba(0,0,0,0)',
            line_color: 'rgba(0,0,0,0)',
            draw_frame: false
          }
        }
      };
      [this.canvas_el, this.ia_canvas_el, this.mid_canvas_el] = this.initCanvas(document.getElementById('XGBchart'), pattern)
      this.genCtx()
      this.Prepare(pattern)
      this.genStyle()
      this.rerender(true)
      // this.events = genDefaultEvents.call(this)
      // bindEvents.call(this)
    },
    initCanvas(div_el, pattern, no_render) {
      var canvas_main = document.createElement('canvas');
      var canvas_ia = document.createElement('canvas');
      var canvas_mid = document.createElement('canvas');

      canvas_main.width = canvas_ia.width = canvas_mid.width = div_el.clientWidth;
      canvas_main.height = canvas_ia.height = canvas_mid.height = div_el.clientHeight;

      canvas_main.style.position = canvas_ia.style.position = canvas_mid.style.position = 'absolute';
      canvas_main.style.top = canvas_ia.style.top = canvas_mid.style.top = 0;
      canvas_main.style.left = canvas_ia.style.left = canvas_mid.style.left = 0;

      if (!div_el.style.position || div_el.style.position === 'static')
        div_el.style.position = 'relative';

      div_el.innerHTML = '';
      div_el.appendChild(canvas_main);
      div_el.appendChild(canvas_mid);
      div_el.appendChild(canvas_ia);
      return [canvas_main, canvas_ia, canvas_mid]
    },
    genCtx() {
      var dpr = window.devicePixelRatio;
      this.origin_width = this.canvas_el.width;
      this.origin_height = this.canvas_el.height;
      this.ctx = this.canvas_el.getContext('2d');
      this.canvas_el.style.width = this.canvas_el.width + 'px';
      this.canvas_el.style.height = this.canvas_el.height + 'px';
      this.canvas_el.width *= dpr;
      this.canvas_el.height *= dpr;
      this.ctx.scale(dpr, dpr);

      this.ia_ctx = this.ia_canvas_el.getContext('2d');
      this.ia_canvas_el.style.width = this.ia_canvas_el.width + 'px';
      this.ia_canvas_el.style.height = this.ia_canvas_el.height + 'px';
      this.ia_canvas_el.width *= dpr;
      this.ia_canvas_el.height *= dpr;
      this.ia_ctx.scale(dpr, dpr);

      this.mid_ctx = this.mid_canvas_el.getContext('2d');
      this.mid_canvas_el.style.width = this.mid_canvas_el.width + 'px';
      this.mid_canvas_el.style.height = this.mid_canvas_el.height + 'px';
      this.mid_canvas_el.width *= dpr;
      this.mid_canvas_el.height *= dpr;
      this.mid_ctx.scale(dpr, dpr);
    },
    Prepare(pattern) {
      this.defaults = this.DEFAULTS();
      if (this.viewport && this.viewport.offset && this.viewport.width) {
        ['price_precision', 'style', 'data_style', 'data_source'].forEach((key) => {
          this[key] = pattern[key] || this.defaults[key];
        })
      } else {
        ['viewport', 'price_precision', 'style', 'data_style', 'data_source'].forEach((key) => {
          this[key] = pattern[key] || this.defaults[key];
        })
      }
    },
    DEFAULTS() {
      return {
        viewport: {
          offset: 0,
          width: 10
        },
        price_precision: 5,
        style: {
          font: {
            family: 'Microsoft YaHei',
            size: 14
          },
          padding: {
            top: 1,
            right: 70,
            bottom: 28,
            left: 1
          },
          wheel_zoom_step: 1,
          linear_last_point: false,
          tip: {
            high_color: '#FF4040',
            low_color: '#1EB955',
            curr_price: {
              line_width: 1,
              line_color: 'rgba(0,0,0,0)',
              label_bg: 'rgba(0,0,0,0)',
              label_color: 'rgba(0,0,0,0)',
              label_height: 20
            }
          },
          crosshair: {
            snap_to_close: false,
            color: '#979797',
            label_height: 20,
            label_bg: 'rgba(0,0,0,0)',
            label_color: 'rgba(0,0,0,0)',
            label_horiz_padding: 5,
            pos_offset: {
              vertical: {
                x: 0,
                y: 0,
                width: 0
              }, // 0 means auto
              horizontal: {
                x: 0,
                y: 0,
                width: 0
              }
            },
            selected_point_color: ['rgba(38,165,225,0.2)', '#fff', 'rgba(38,165,225,1)']
          },
          grid: {
            bg: '#fff',
            limit: {
              y: [2, 8]
            },
            color: {
              x: '#f0f0f0',
              y: '#f0f0f0'
            },
            span: {
              x: 120,
              y: 30
            }
          },
          line_color_list: ['#fff', '#FFAE00', '#C291F2', '#4CA5FF', '#3DCFEE'],
          axis: {
            x_axis_pos: 1, // 1 means on bottom, -1 means on top
            y_axis_pos: 1, // 1 means on right, -1 means on left
            hide_candlestick_date: false,
            hide_candlestick_time: false,
            show_rate: false,
            label_pos: {
              x_axis: {
                x: -35,
                y: 20
              },
              y_axis: {
                x: 5,
                y: 4
              }
            },
            label_color: '#555',
            pointer_length: 0,
            bg_color: 'rgba(0,0,0,0)',
            line_color: 'rgba(0,0,0,0)',
            draw_frame: false
          }
        },
        data_style: {
          base_value: '#2DB0F9',
          candlestick: {
            block: {
              up: '#FF4040',
              down: '#1EB955'
            },
            border: {
              up: '#FF4040',
              down: '#1EB955'
            },
            wick: {
              up: '#FF4040',
              down: '#1EB955'
            }
          },
          OHLC: {
            up: '#FF4040',
            down: '#1EB955'
          },
          mountain: {
            line_width: 1,
            line_color: 'rgba(251, 89, 75, 0.8)',
            gradient_up: 'rgba(251, 89, 75, 0.4)',
            gradient_down: 'rgba(251, 89, 75, 0.02)'
          }
        }
      };
    },
    genStyle() {
      this.ctx.font = this.style.font.size + 'px ' + this.style.font.family;
      this.ia_ctx.font = this.ctx.font;
      this.style.padding.right_pos = this.origin_width - this.style.padding.right;
      this.style.padding.bottom_pos = this.origin_height - this.style.padding.bottom;
    },
    saveTrend(payload) {
      let newTrend = []
      newTrend = payload[this.proCode]
      if (newTrend) {
        this.stockTrend = newTrend
      }
    },
    savePre(payload) {
      this.preValue = payload['pre_close_px']
    },
    rerender(force) {
      if ((!force && +new Date() - this.state.ctx_clock <= 30) || this.changingData) return;
      this.state.ready = 0;
      this.state.ctx_clock = +new Date();
      this.state.ready = 0;
      this.clean();
      if (this.data_source.time_ranges) {
        this.genLinearCoord();
        this.drawGrid()
        this.drawLinearPrice();
        this.drawIndicators();
        this.drawAxis();
      }
      this.state.ready = 1;
    },
    clean() {
      if (!this.ctx || !this.ia_ctx || !this.mid_ctx) return
      this.ctx.clearRect(0, 0, this.origin_width, this.origin_height);
      this.ia_ctx.clearRect(0, 0, this.origin_width, this.origin_height);
      this.mid_ctx.clearRect(0, 0, this.origin_width, this.origin_height);
      // let stockLabel = document.querySelectorAll('.fenshi-stock-label')
      // for (let i = 0; i < stockLabel.length; i++) {
      //   document.getElementById('XGBchart').removeChild(stockLabel[i])
      // }
    },
    genLinearCoord() {
      var self = this;
      var fields = this.data_source.fields[0];
      this.data_source.filtered_data_buckets = this.datafilterByTimeRanges(this.data_source.data,
        this.data_source.time_ranges, fields.t);
      // this.$store.commit('zhutiChart/setTimeRange', [this.data_source.time_ranges[0][0], this.data_source.time_ranges[this.data_source.time_ranges.length - 1][1]])
      var y_max = Number.MIN_VALUE;
      var y_min = Number.MAX_VALUE;
      var y_actuals = this.data_source.filtered_data_buckets.map((bucket) => {
        var result = chartCul.Coord.calcYRangeNew.line(bucket, this.data_source.fields);
        if (result[0] === result[1]) {
          result[0] -= result[0] * 0.001;
          result[1] += result[1] * 0.001;
        }
        if (result[0] < y_min) y_min = result[0];
        if (result[1] > y_max) y_max = result[1];
        return result;
      });
      let absMax = Math.max(Math.abs(y_min), Math.abs(y_max))
      absMax = Math.ceil(absMax * 100 * 10 / 4) / 250
      y_min = -absMax
      y_max = absMax
      // calc the vertical padding of grid
      // var vertical_padding = chartCul.Coord.linearPixels2Actual(self.style.grid.span.y * 2, {
      //   display: [this.style.padding.bottom_pos, this.style.padding.top],
      //   actual: [y_min, y_max]
      // });
      // y_min -= vertical_padding;
      // y_max += vertical_padding;

      var y_actual = [y_min, y_max];

      // enlarge the actual range of vertical coord when base value line is specified
      if (this.data_source.base_value !== undefined) {
        var base_value = this.data_source.base_value;
        var span = Math.max(Math.abs(base_value - y_max), Math.abs(base_value - y_min));
        y_actual = [base_value - span, base_value + span];
      }
      // create coord
      this.coord = {
        x: {
          display: [this.style.padding.left, this.style.padding.right_pos],
          actual: [this.data_source.time_ranges[0][0], this.data_source.time_ranges[this.data_source.time_ranges.length - 1][1]]
        },
        y: {
          display: [this.style.padding.bottom_pos, this.style.padding.top],
          actual: y_actual
        },
        viewport: this.viewport,
        coo