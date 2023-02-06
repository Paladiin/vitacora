
<!-- 5日 -->
<template>
 <div>
     <div id="klineday1"></div>
 </div>
</template>
<style lang='scss' scoped>
#klineday1{
    width: 100vw;
    height: 72vw;
}
</style>

<script>
let echarts = require('echarts/lib/echarts')
require('echarts/lib/chart/line')
require('echarts/lib/component/title');
require('echarts/lib/chart/candlestick')
require('echarts/lib/chart/bar')
require('echarts/lib/component/markLine')
require("echarts/lib/component/markPoint")
require('echarts/lib/component/dataZoom')
let myChart

// const seriesLineColor = ['#3165c3', '#a5a5a5', '#38b6fc'];

export default {
  data () {
    return {
      minData: '',
      pre_px: 0,
      dataKLineX: [],
      dataKLineY: [],
      dataBarX: [],
      dataBarY: [],
      datalinePre: [],
      difference: 0,
      rate: '',
      max: '',
      min: ''
    }
  },
  props: {
    // klineapi 当前获取数据的api 日线 周线 或者K线
    klineapi: {},
    // type: day,week,month
    type: {
      default: 'day'
    }
  },
  created() {
    this.getData()
  },

  mounted() {
    myChart = echarts.init(document.getElementById('klineday1'))
    // console.log(myChart);
    // this.getData().then()
  },
  watch: {
    klineapi: function() {
      this.getData()
    },
    // eslint-disable-next-line
    dataKLineY: function(){
      this.empdata()
    }
  },
  methods: {
    getData() {
      return this.klineapi().then(
        res => {
          let minData = res.data.candle['000001.SS']
          if (this.type === 'month') {
            this.minData = minData.splice(-137)
          } else {
            this.minData = minData
          }
          this.computedataLineXY()
          return Promise.resolve(res.data.candle['000001.SS'])
        }
      )
    },
    computeMaxMin() {
      let min, max, difference
      let sortarr = Array.from(this.minData)
      sortarr.sort(
        (a, b) => {
          return a[1] - b[1]
        }
      )
      min = sortarr[0][1]
      max = sortarr[sortarr.length - 1][1]

      difference = Math.max(max - this.pre_px, this.pre_px - min
      )
      if (difference >= this.difference) {
        this.max = (this.pre_px + difference).toFixed(2)
        this.min = this.pre_px - difference
        this.rate = (((this.max / this.pre_px) - 1) * 100).toFixed(2) + '%'
        this.difference = difference
      }
    },
    computedataLineXY() {
      // 计算Y轴的坐标
      let minData = this.minData

      let dataKLineY = minData.map(
        item => [item[1], item[2], item[4], item[3]]
      )
      this.dataKLineY = dataKLineY
    },
    empdata() {
      // 渲染实例
      let rawData = this.minData
      // symbol位置
      const symbolOffset = {}
      // 定义一个format函数
      let formatter
      // type
      const {type} = this
      // 当前屏幕内要展示的数据量
      const dataCount = 69
      // 当前数据总量
      const total = this.minData.length
      // 当前屏幕起始位置(index)
      const startValue = total - dataCount
      // 当前屏幕结束位置(index)
      const endValue = total - 1
      // 计算MA线
      function calculateMA(dayCount, data) {
        return data.map(
          i => i[dayCount]
        );
      }
      // X轴fommater函数 日周K的情况
      function formatterDW (value, index) {
        // 在当前屏幕的刻度首位做特殊处理
        if (index === dataCount - 1) {
          return `${value} 2018083`
        } else if (index === 0) {
          return `2018083 ${value}`
        } else {
          return value
        }
      }
      // X轴fommater函数 月K的情况
      function formatterMonth (val, index) {
        let value = val.slice(0, 6)
        value = value.replace(/(\d{4})/, '$1-')
        // 在当前屏幕的刻度首位做特殊处理
        if (index === dataCount - 1) {
          return `${value} 201808`
        } else if (index === 0) {
          return `201808 ${value}`
        } else {
          return value
        }
      }
      // X轴fommater函数 5 15 30 分线情况
      function formatterMin(val, index) {
        let value = val.slice(-4)
        value = value.replace(/(^\d{2})/, '$1:')
        // 在当前屏幕的刻度首位做特殊处理
        if (index === dataCount - 1) {
          return `${value} 2018`
        } else if (index === 0) {
          return `2018 ${value}`
        } else {
          return value
        }
      }
      // 根据type不同做一些不同处理
      function typeFilter(type) {
        // 5 15 30 分线做处理
        if (/min/.test(type)) {
          formatter = formatterMin
        } else if (type === 'month') {
          formatter = formatterMonth
        } else {
          formatter = formatterDW
        }
        if (type === 'month') {
          symbolOffset.max = [25, '-200%']
          symbolOffset.min = [25, '-200%']
        } else {
          symbolOffset.max = [25, '-100%']
          symbolOffset.min = [-25, '-200%']
        }
      }
      // x轴坐标
      var dates = rawData.map(function (item) {
        return item[0];
      });
      // 柱状图Y轴数据计算
      function dataBarY (data) {
        return data.map(
          i => {
            return {
              "value": i[5],
              itemStyle: {
                color: i[2] - i[1] < 0 ? '#1cbf7b' : '#ffffff',
                borderColor: i[2] - i[1] < 0 ? '#fff' : '#f3564d',
                borderWidth: 1
              }}
          }
        )
      }
      // 根据type处理配置项
      typeFilter(type)
      // data初始化
      var data = this.dataKLineY
      // echat配置
      var option = {
        // title设置
        title: [
          {
            text: `●MA5 ${rawData[total - 1][8]}`,
            textStyle: {
              color: '#ffb041',
              fontSize: 12,
              fontWeight: 400
            },
            padding: [0, 0, 0, 0]
          },
          {
            text: `●MA10 ${rawData[total - 1][8]}`,
            textStyle: {
              color: '#26a5ff',
              fontSize: 12,
              fontWeight: 400
            },
            padding: [0, 0, 0, 100]
          },
          {
            text: `●MA20 ${rawData[total - 1][8]}`,
            textStyle: {
              color: '#ff40bf',
              fontWeight: 400,
              fontSize: 12
            },
            padding: [0, 0, 0, 202]
          }
        ],
        // 图例,暂无用
        legend: {
        },
        // 提示框
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            animation: false,
            type: 'cross',
            lineStyle: {
              color: '#376df4',
              width: 2,
              opacity: 1
            }
          }
        },
        // X轴配置
        xAxis: [{
          // 类型:类目轴
          type: 'category',
          // X轴数据
          data: dates,
          // 轴线样式
          axisLine: { lineStyle: { color: '#8392A5' } },
          // 两边留白
          boundaryGap: false,
          // 分割线设置
          splitLine: {
            show: true,
            lineStyle: {
              color: '#eff0f2'
            },
            // 间隔设置
            interval: 16
          },
          // 刻度
          axisTick: {
            show: false
          },
          // 刻度的label
          axisLabel: {
            // 隔多少个项显示一个标签
            interval: 16,
            // 要显示的内容格式
            formatter: formatter
          }
        },
        {
          type: 'category',
          // 图标序号
          gridIndex: 1,
          // 数据指定
          data: dates,
          scale: true,
          boundaryGap: true,
          axisLine: {onZero: false},
          axisTick: {show: false},
          splitLine: {show: false},
          axisLabel: {show: false}
          // splitNumber: 20
        }
        ],
        // Y轴设置 data相关配置项在series
        yAxis: [{
          scale: true,
          show: false,
          axisLine: { lineStyle: { color: '#8392A5' } },
          boundaryGap: ['2%', '2%'],
          axisLabel: {
            inside: true
            // show: false
          }
        },
        {
          scale: true,
          gridIndex: 1,
          splitNumber: 2,
          axisLabel: {show: false},
          axisLine: {show: false},
          axisTick: {show: false},
          splitLine: {show: false}
        }
        ],
        // 布局设置
        grid: [{
          left: '0px',
          right: '2px',
          height: '69%',
          // width: '99%',
          top: '3%',
          containLabel: true
        }, {
          height: '30%',
          left: '0px',
          right: '0px',
          // top: '60%',
          bottom: '0px',
          containLabel: true
        }],
        animation: false,
        series: [
          {
            // 类型k线图
            type: 'candlestick',
            name: '日K',
            // K线图数据 open close lowest highest
            data: data,
            itemStyle: {
              normal: {
                color: '#ffffff',
                color0: '#1cbf7b',
                borderColor: '#f3564d',
                borderColor0: '#1cbf7b'
              }
            },
            markPoint: {
              // 标记点 此处是标识最高和最低的 ...xxxx
              data: [
                {
                  // 高点
                  name: 'max',
                  type: 'max',
                  // symbol类型 这里是点
                  symbol: 'circle',
                  // 偏移
                  symbolOffset: symbolOffset.max,
                  // SIZE 这里放到很小...
                  symbolSize: 1,
                  valueDim: 'highest',
                  label: {
                    show: true,
                    color: '#333',
                    fontSize: 10,
                    formatter: (p) => {
                      return `...${p.data.value.toFixed(2)}`
                    }
                  },
                  itemStyle: {
                    normal: {color: 'rgb(41,60,85)'}
                  }
                },
                {
                  name: 'min',
                  type: 'min',
                  symbol: 'circle',
                  symbolOffset: symbolOffset.min,
                  symbolSize: 1,
                  valueDim: 'lowest',
                  label: {
                    show: true,
                    color: '#333',
                    fontSize: 10,
                    formatter: (p) => {
                      if (type === 'month') return `...${p.data.value.toFixed(2)}`
                      else {
                        return `${p.data.value.toFixed(2)}...`
                      }
                    }
                  },
                  itemStyle: {
                    normal: {color: 'rgb(41,60,85)'}
                  }
                }
              ]
            }
          },
          // ma5线
          {
            name: 'MA5',
            type: 'line',
            data: calculateMA(8, rawData),
            smooth: true,
            showSymbol: false,
            lineStyle: {
              normal: {
                width: 1,
                color: '#ffb041'
              }
            }
          },
          // ma10线
          {
            name: 'MA10',
            type: 'line',
            data: calculateMA(9, rawData),
            smooth: true,
            showSymbol: false,
            lineStyle: {
              normal: {
                width: 1,
                color: '#26a5ff'
              }
            }
          },
          {
            name: 'MA20',
            type: 'line',
            data: calculateMA(10, rawData),
            smooth: true,
            showSymbol: false,
            lineStyle: {
              normal: {
                width: 1,
                color: '#ff40bf'
              }
            }
          },
          // 柱状图数据
          {
            type: 'bar',
            xAxisIndex: 1,
            yAxisIndex: 1,
            barCategoryGap: 1.5,
            data: dataBarY(rawData),
            // 最大和最小
            max: 'dataMax',
            min: 'dataMin'
          }
        ],
        // 缩放配置项
        dataZoom: [
          {
            type: 'inside',
            // 要缩放的轴[序号]
            xAxisIndex: [0, 1],
            // yAxisIndex: [0, 6],
            startValue,
            endValue,
            filterMode: 'filter'
          }
        ]
      };
      myChart.setOption(option)
    }
  },

  computed: {
  },

  components: {}

}
</script>