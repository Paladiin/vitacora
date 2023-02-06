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
        coord_width: (this.style.padding.right_pos - this.style.padding.left) / this.data_source.time_ranges.length
      };
      // each splitted coord
      this.coords = this.data_source.time_ranges.map((range, index) => {
        var left = self.style.padding.left + self.coord.coord_width * index;
        var right = left + self.coord.coord_width;
        return {
          x: {
            display: [left, right],
            actual: [range[0], range[1]]
          },
          y: {
            display: [self.style.padding.bottom_pos, self.style.padding.top],
            actual: y_actuals[index]
          }
        };
      });     
      
      // calc display position x of each visiable point
      this.data_source.filtered_data_buckets.forEach((bucket, index) => {
        bucket.forEach((item) => {
          item.x = ~~chartCul.Coord.linearActual2Display(item[fields.t], self.coords[index].x);
        });
      });
    },
    datafilterByTimeRanges: function(data, ranges, t_index) {
      var buckets = ranges.map(function() {
        return []
      });
      var bucket_index = 0;
      for (var i = 0; i < data.length; i++) {
        var item = data[i];
        var time = item[t_index];

        if (time >= ranges[bucket_index][0] &&
          time <= ranges[bucket_index][1]) {
          buckets[bucket_index].push(item);
        } else {
          if (ranges[bucket_index + 1] && time >= ranges[bucket_index + 1][0]) {
            bucket_index += 1;
            i--;
          }
        }
      }
      return buckets;
    },
    drawGrid() {
      var self = this;
      // draw background
      chartCul.Draw.Fill(this.ctx, (ctx) => {
        ctx.rect(0, 0, self.origin_width, self.origin_height);
      }, this.style.grid.bg);
      // calchartCulate horizontal lines position
      var y_num = ~~((this.coord.y.display[0] - this.coord.y.display[1]) / this.style.grid.span.y);
      // console.log(y_num)
      if (y_num > self.style.grid.limit.y[1]) y_num = self.style.grid.limit.y[1];
      if (y_num < self.style.grid.limit.y[0]) y_num = self.style.grid.limit.y[0];
      var horiz_lines = [];

      if (this.data_source.base_value === undefined) {
        // no base value line specified
        if (this.coord.y.actual[0] === this.coord.y.actual[1]) {
          this.coord.y.actual[0] -= 0.001
          this.coord.y.actual[1] += 0.001
        }
        horiz_lines = chartCul.Coord.seekNeatPoints(this.coord.y.actual, y_num + 1);
        horiz_lines = [this.coord.y.actual[0], ...horiz_lines, this.coord.y.actual[1]]
      } else {
        // with base value line
        var y_actual = this.coord.y.actual;
        var base_value = this.data_source.base_value;
        var span = (y_actual[1] - y_actual[0]) / 2;
        horiz_lines = [y_actual[0], base_value];
        while (horiz_lines.length < y_num) {
          span /= 2;
          for (var i = 0, limit = horiz_lines.length; i < limit; i++) {
            horiz_lines.push(horiz_lines[i] + span);
          }
        }
        horiz_lines.push(y_actual[1]);
      }
      horiz_lines = horiz_lines.sort((a, b) => a - b)
      horiz_lines = horiz_lines.map((val) => {
        return {
          actual: val,
          display: ~~chartCul.Coord.linearActual2Display(val, self.coord.y) + 0.5
        };
      });
      // console.log(horiz_lines)
      // draw horizontal lines
      // chartCul.Draw.Stroke(this.ctx, (ctx) => {
      //   let hlength = horiz_lines.length
      //   horiz_lines.forEach((y, index) => {
      //     // if (index == hlength - 1 && this.data_source.time_ranges) return
      //     ctx.moveTo(self.style.padding.left, y.display);
      //     ctx.lineTo(self.style.padding.right_pos + self.style.padding.right, y.display);
      //   });
      // }, this.style.grid.color.x);
      this.coord.horiz_lines = horiz_lines;

      // calculate vertical lines position
      var vertical_lines = [];

      if (this.data_source.time_ranges) {
        // vertical grid line drawing for linear chart
        this.data_source.time_ranges.forEach((range, index) => {
          vertical_lines.push({
            display: ~~(self.style.padding.left + self.coord.coord_width * index) + 0.5,
            actual: range[0]
          });
          // vertical_lines.push({display: ~~(self.style.padding.left + self.coord.coord_width * index + self.coord.coord_width / 2) + 0.5, actual: (range[0] + range[1]) / 2});
          if (index === self.data_source.time_ranges.length - 1) {
            vertical_lines.push({
              display: self.style.padding.right_pos + 0.5,
              actual: range[1]
            });
          }
        });
      }
      vertical_lines = vertical_lines.sort(function(a, b) {
        return a.actual - b.actual;
      });
      // chartCul.Draw.Stroke(this.ctx, (ctx) => {
      //   vertical_lines.forEach((val, ind) => {
      //     if (ind == 0 && this.data_source.time_ranges) return
      //     if (ind == vertical_lines.length - 1) {
      //       if (this.data_source.time_ranges) {
      //         ctx.moveTo(self.style.padding.right_pos + self.style.padding.right, self.style.padding.top);
      //         ctx.lineTo(self.style.padding.right_pos + self.style.padding.right, self.style.padding.bottom_pos);
      //       } else {
      //         ctx.moveTo(val.display, self.style.padding.top);
      //         ctx.lineTo(val.display, self.style.padding.bottom_pos);
      //       }
      //     } else {
      //       ctx.moveTo(val.display, self.style.padding.top);
      //       ctx.lineTo(val.display, self.style.padding.bottom_pos);
      //     }
      //   });
      // }, this.style.grid.color.y);
      // }
      var x_line_pos_op = self.style.axis.y_axis_pos === 1 ? self.style.padding.left : self.style.padding.right_pos + self.style.padding.right;
      chartCul.Draw.Stroke(this.ctx, (ctx) => {
        if (self.style.axis.draw_frame) {
          ctx.moveTo(x_line_pos_op, self.style.padding.top);
          ctx.lineTo(x_line_pos_op, self.style.padding.bottom_pos);
        }
      }, this.style.grid.color.y);
      this.coord.vertical_lines = vertical_lines;
    },
    drawLinearPrice() {
      var self = this;
      var fields = this.data_source.fields[0];

      if (fields.type !== 'linear') return;

      var points = [];

      // points calculation
      this.data_source.filtered_data_buckets.forEach(function(bucket, index) {
        var bucket_points = [];
        bucket.forEach(function(item) {
          var x = item.x;
          var y = ~~chartCul.Coord.linearActual2Display(item[fields.val_index], self.coord.y);

          bucket_points.push([x, y]);
        });
        points.push(bucket_points);
      });

      // line drawing
      chartCul.Draw.Stroke(self.ctx, function(ctx) {
        ctx.lineWidth = self.data_style.mountain.line_width;

        points.forEach(function(bucket_points) {
          bucket_points.forEach(function(point, index) {
            if (!index)
              ctx.moveTo(point[0], point[1]);

            ctx.lineTo(point[0], point[1]);
          });
        });
      }, self.data_style.mountain.line_color);

      // gradient drawing

      var gradient = self.ctx.createLinearGradient(0, 0, 0, self.style.padding.bottom_pos - self.style.padding.top);
      gradient.addColorStop(0, self.data_style.mountain.gradient_up);
      gradient.addColorStop(1, self.data_style.mountain.gradient_down);
      points.forEach((bucket_points) => {
        if (bucket_points.length)
          chartCul.Draw.Fill(self.ctx, (ctx) => {
            ctx.moveTo(bucket_points[0][0], self.style.padding.bottom_pos);
            bucket_points.forEach((point, index) => {
              ctx.lineTo(point[0], point[1]);
            });
            ctx.lineTo(bucket_points[bucket_points.length - 1][0], self.style.padding.bottom_pos);
            ctx.closePath();
          }, gradient);
      });

      // current point
      var last_bucket = points[points.length - 1];
      var last_point = last_bucket[last_bucket.length - 1];
      this.data_source.last_point = last_point;
    },
    drawIndicators() {
      if (this.changingData) return
      var self = this;
      let tempfenshiLabel = []
      if (this.data_source.time_ranges) {
        this.data_source.fields.forEach((item) => {
          LinearIndicatorTypeFuncs[item.type] && LinearIndicatorTypeFuncs[item.type].call(self, item);
          if (this.chartMode === 'fenshi') {
            tempfenshiLabel.push(this.drawDivLabel(this.fenshiMap, item))
          }
        });
        tempfenshiLabel = tempfenshiLabel.sort((a, b) => {
          return a.pos.top - b.pos.top
        })
        this.drawLastDot()
      }
      for (let i = 0; i < tempfenshiLabel.length; i++) {
        if (i != 0) {
          if (tempfenshiLabel[i].pos.top - tempfenshiLabel[i - 1].pos.top < 20) {
            tempfenshiLabel[i].pos.top = tempfenshiLabel[i - 1].pos.top + 20
          }
        }
      }
      this.fenshiLabel = tempfenshiLabel
    },
    drawLastDot() {
      let data = this.data_source.data
      if(new Date(data[0]).getHours == 15 && new Date(data[0]).getMinutes == 0) return
      let lastData = data[data.length-1]
      let radius = [6, 2.5];
      let self = this
      this.style.crosshair.selected_point_color.forEach(function(color, index){
        chartCul.Draw.Fill(self.ia_ctx, function(ctx){
          ctx.arc(lastData.x + 0.5,
                  chartCul.Coord.linearActual2Display(lastData[1], self.coord.y) - 1.5,
                  radius[index], 0, 2 * Math.PI);
        }, color);
      });
    },
    drawAxis() {
      var self = this;
      // fill padding places
      chartCul.Draw.Fill(this.ctx, function(ctx) {
        ctx.rect(0, 0, self.origin_width, self.style.padding.top);
        ctx.rect(0, 0, self.style.padding.left, self.origin_height);
        ctx.rect(self.style.padding.right_pos, 0, self.style.padding.right, self.origin_height);
        ctx.rect(0, self.style.padding.bottom_pos, self.origin_width, self.style.padding.bottom);
      }, this.style.axis.bg_color);
      var x = self.style.axis.y_axis_pos === 1 ? self.style.padding.right_pos : 0;
      var x_line_pos = self.style.axis.y_axis_pos === 1 ? self.style.padding.right_pos : self.style.padding.left;
      var x_line_pos_op = self.style.axis.y_axis_pos === 1 ? self.style.padding.left : self.style.padding.right_pos;
      var y = self.style.axis.x_axis_pos === 1 ? self.style.padding.bottom_pos : self.style.padding.top;
      var y_op = self.style.axis.x_axis_pos === 1 ? self.style.padding.top : self.style.padding.bottom_pos;

      // draw axis lines
      chartCul.Draw.Stroke(this.ctx, function(ctx) {
        self.coord.horiz_lines.forEach(function(y, index) {
          ctx.moveTo(x_line_pos, y.display);
          ctx.lineTo(x_line_pos + self.style.axis.pointer_length * self.style.axis.y_axis_pos, y.display);
        });

        self.coord.vertical_lines.forEach(function(x) {
          ctx.moveTo(x.display, y);
          ctx.lineTo(x.display, y + self.style.axis.pointer_length * self.style.axis.x_axis_pos);
        });

        // draw axis line
        ctx.moveTo(x_line_pos + 0.5, self.style.padding.top);
        ctx.lineTo(x_line_pos + 0.5, self.style.padding.bottom_pos);

        ctx.moveTo(self.style.padding.left, y + 0.5);
        ctx.lineTo(self.style.padding.right_pos, y + 0.5);

        if (self.style.axis.draw_frame) {
          ctx.moveTo(x_line_pos_op, self.style.padding.top);
          ctx.lineTo(x_line_pos_op, self.style.padding.bottom_pos);

          ctx.moveTo(self.style.padding.left, y_op + 0.5);
          ctx.lineTo(self.style.padding.right_pos, y_op + 0.5);
        }

        if (self.style.axis.show_rate) {
          var rate_x = self.style.axis.y_axis_pos > 0 ? self.style.padding.left : self.style.padding.right_pos;

          ctx.moveTo(rate_x + 0.5, self.style.padding.top);
          ctx.lineTo(rate_x + 0.5, self.style.padding.bottom_pos);

          self.coord.horiz_lines.forEach(function(y) {
            ctx.moveTo(rate_x, y.display);
            ctx.lineTo(rate_x + self.style.axis.pointer_length * -self.style.axis.y_axis_pos, y.display);
          });
        }
      }, self.style.axis.line_color);

      // draw labels
      var rates = {
        up: [],
        down: []
      };
      // 这快是y轴右边的刻度
      chartCul.Draw.Text(this.ctx, (ctx) => {
        let max = self.coord.horiz_lines.length
        self.coord.horiz_lines.forEach((y, index) => {
          // if (this.data_source.time_ranges && (index == 0 || index == max - 1)) return
          var val = y.actual.toFixed(self.price_precision);
          if (this.style.xgb_style) {
            ctx.fillStyle = this.colorStr(val)
            val = Number(val * 100).toFixed(2) + '%'
          }
          var x_offset = self.style.axis.label_pos.y_axis.x;

          var y_pos = y.display + self.style.axis.label_pos.y_axis.y;
          if (y_pos < 10)
            y_pos += 10;
          if (y_pos > self.origin_height - 10)
            y_pos -= 10;
          if (!self.data_source.time_ranges) {
            ctx.textAlign = 'right'
            ctx.fillText(val, x + self.style.axis.pointer_length + self.style.padding.right_pos + self.style.padding.right - 6, y_pos);
          } else {
            ctx.textAlign = 'right'

            ctx.fillText(val, x + self.style.axis.pointer_length + self.style.padding.right_pos + self.style.padding.right - 6, y_pos);
          }
        });
      })
      chartCul.Draw.Text(this.ctx, (ctx) => {
        if (self.data_source.time_ranges) {
          self.data_source.time_ranges.forEach((range, index) => {
            var width = self.style.padding.right_pos - self.style.padding.left;
            var display_range = [
              index * width / self.data_source.time_ranges.length + this.style.padding.left,
              (index + 1) * width / self.data_source.time_ranges.length + this.style.padding.left
            ];
            ctx.fillText(chartCul.Coord.getDateStr(range[0], true),
              display_range[0] + (index == 1 ? 2.5 : 15),
              y + self.style.axis.label_pos.x_axis.y * self.style.axis.x_axis_pos);
            let text1 = index ? chartCul.Coord.getDateStr(range[1], true) : chartCul.Coord.getDateStr(range[1], true) + '/'
            var str_width = ctx.measureText(text1).width;
            // ctx.fillText(chartCul.Coord.getDateStr((range[0] + range[1]) / 2, true),
            //   display_range[1] - str_width / 2,
            //   y + self.style.axis.label_pos.x_axis.y * self.style.axis.x_axis_pos);
            ctx.fillText(text1,
              display_range[1] - str_width - (index == 1 ? 15 : -2.5),
              y + self.style.axis.label_pos.x_axis.y * self.style.axis.x_axis_pos);
          })
        }
        if (self.style.axis.show_rate) {
          var rate_x = self.style.axis.y_axis_pos > 0 ? 0 : self.style.padding.right_pos;

          self.coord.horiz_lines.forEach((y, index) => {
            var val = ((y.actual - self.data_source.base_value) / self.data_source.base_value);
            var x_offset = ctx.measureText(val.toFixed(2) + '%').width + self.style.axis.label_pos.y_axis.x;

            var y_pos = y.display + self.style.axis.label_pos.y_axis.y;
            if (y_pos < 10)
              y_pos += 10;
            if (y_pos > self.origin_height - 10)
              y_pos -= 10;

            if (val === 0)
              ctx.fillText(val.toFixed(2) + '%',
                rate_x + self.style.axis.pointer_length + x_offset * self.style.axis.y_axis_pos,
                y_pos);
            else {
              rates[val > 0 ? 'up' : 'down'].push([(val * 100).toFixed(2) + '%',
                rate_x + self.style.axis.pointer_length + x_offset * self.style.axis.y_axis_pos,
                y_pos
              ])
            }
          });
        }
      }, this.style.axis.label_color);
      for (var direction in rates) {
        chartCul.Draw.Text(this.ctx, function(ctx) {
          rates[direction].forEach(function(item) {
            ctx.fillText(item[0], item[1], item[2]);
          });
        }, self.data_style.OHLC[direction]);
      }
    },
    colorStr(n) {
      return n == 0 ? '#919599' : n > 0 ? '#F3564D' : '#1CBF7B'
    },
    inStockTime() {
      var today = new Date();
      var localoffset = -(today.getTimezoneOffset() / 60);
      var destoffset = 8;

      var offset = destoffset - localoffset;
      var time = new Date(new Date().getTime() + offset * 3600 * 1000)
      return (time.getHours() > 9 && time.getHours() < 15 || (time.getHours() == 9 && time.getMinutes() >= 15) || (time.getHours() == 15 && time.getMinutes() <= 10)) && !isWeekend(time)
    }
  },
  destroyed() {
    clearInterval(this.timer)
  }
}
</script>

<style lang="css">
.XGBchart-container {
  width: 100%;
}
</style>
