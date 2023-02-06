
<!-- 大盘异动 -->
<template>
 <div>
     <div id="eline" ref="eline"></div>
 </div>
</template>

<script>
import {getSSMin} from '@/service/stocksApi'
import format from "date-fns/format";
let echarts = require('echarts/lib/echarts')
require('echarts/lib/chart/line')
require('echarts/lib/chart/bar')
require('echarts/lib/component/markLine')
let myChart
const seriesLineColor = ['#3165c3', '#a5a5a5', '#38b6fc'];
const pointerColor = ['#e82f4e']
const red = '#e82f4e'
// const green = '#4da370'

export default {
  data () {
    return {
      minData: [],
      pre_px: 0,
      dataLineX: [],
      dataLineY: [],
      dataBarX: [],
      dataBarY: [],
      datalinePre: [],
      dataPreValueX: [],
      pointerIndexArr: [],
      flagPositons: [],
      tagHeight: 15,
      difference: 0,
      rate: '',
      max: '',
      min: '',
      heightFlag: 0,
      relativeHeight: 0,
      objMap: {},
      timer: null,
      flagPindex: null,
      flagId: null
    }
  },
  props: {
    'trancArr': {
      type: Array,
      default: () => []
    }
  },

  created() {
    this.getData()
  },

  mounted() {
    myChart = echarts.init(document.getElementById('eline'))
    this._autoRefresh(30)
    let chartDom = document.getElementById('eline')
    chartDom.addEventListener('click', event => {
      let x = event.offsetX
      let y = event.offsetY
      if (this.flagPositons.length) {
        this.flagPositons.forEach(
          i => {
            // console.log(`x=${x},x1=${i.x1},x2=${i.x2}`, `y=${y},y1=${i.y1}y2=${i.y2}`, `ybase:${i.ybase}`);
            if (i.x1 - 10 <= x && x <= i.x2 + 10 && i.y1 - 2 <= y && y < i.y2 + 2) {
              if (this.flagId === i.Id) {
                this.flagId = null
              } else {
                this.flagId = i.Id
              }
            }
          }
        )
      }
    })
  },
  computed: {
    pointerArr() {
      // 只取今日
      let DD = this.minData.length && this.minData[0][0].toString().slice(6, 8)
      let arr = this.trancArr.filter(
        i => format(i.CreatedAt, 'DD') === DD
      )
      // index计算以及tagname获取
      return arr.map(i => {
        let index = this.dataPreValueX.indexOf(format(i.CreatedAt, 'HHmm'))
        let obj = {}
        obj['pIndex'] = index
        obj['left'] = index / this.dataPreValueX.length < 0.5
        obj['tagName'] = i.BkjInfoArr[0].Name
        obj['Id'] = i.Id
        return obj
      })
    }
  },
  watch: {
    minData: function() {
      this.computeMaxMin()
      this.computedataLineXY()
    },
    // eslint-disable-next-line
    dataLineY: function(){
      this.empdata()
    },
    pointerArr(value) {
      this.empdata()
    },
    flagId(value) {
      this.$emit('onTop', value)
      this.empdata()
    }
  },

  methods: {
    _autoRefresh(seconds) {
      if (this.timer) return
      this.timer = setInterval(
        this.getData, 1000 * seconds
      )
    },
    getData() {
      return getSSMin().then(
        res => {
          this.pre_px = Number(res.data.real.pre_close_px.toFixed(2))
          this.minData = res.data.trend['000001.SS']
          return Promise.resolve(res.data.trend['000001.SS'])
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

      difference = Math.max(max - this.pre_px, this.pre_px - min)
      if (difference >= this.difference) {
        this.max = (this.pre_px + difference).toFixed(2)
        this.min = (this.pre_px - difference).toFixed(2)
        this.rate = (((this.max / this.pre_px) - 1) * 100).toFixed(2) + '%'
        this.difference = difference
      }
    },
    computedataLineXY() {
      let initnumber = 0
      let colorNumber = 0
      let minData = this.minData
      let dataLineX = []
      let dataLineY = []
      let dataBarY = []
      let datalinePre = []
      let dataPreValueX = []
      minData.forEach(
        (item, index) => {
          // let objx = item[0].toString().slice(-4)
          let objx = {value: item[0].toString().slice(-4),
            label: {
              show: true
            },
            splitLine: {
              show: true
            }}

          let objy = {value: item[1].toFixed(2),
            itemStyle: {
              normal: {show: false},
              emphasis: {show: false}
            }
          }
          let objbar = {value: item[3] - initnumber,
            color: item[1] - colorNumber,
            itemStyle: {
              color: item[1] > colorNumber ? '#f3564d' : '#1cbf7b'
            }
          }
          dataPreValueX.push(objx.value)
          dataLineX.push(objx)
          dataLineY.push(objy)
          dataBarY.push(objbar)
          datalinePre.push(item[2].toFixed(2))
          initnumber = item[3]
          colorNumber = item[1]
        }
      )
      this.dataPreValueX = dataPreValueX
      this.dataLineX = dataLineX
      this.dataLineY = dataLineY
      this.dataBarY = dataBarY
      this.datalinePre = datalinePre
    },
    empdata() {
      let {dataLineX, dataLineY, datalinePre, dataBarY, min, max, rate, pre_px, pointerArr, tagHeight, flagId} = this
      // let flagPaddingHeight = 3
      let flagPaddingWidth = 7
      let symbolSize = 7
      let flagFontSize = 12
      let objMap
      // 半个分时图大小
      let chartHalfHeight = (document.querySelector('#eline').offsetHeight * 0.72 - 20) / 2
      let chartWidth = document.querySelector('#eline').offsetWidth
      // tag Width
      function tagWidth(item) {
      // 匹配英文和字符
        let count = item.match(/\w|&/g)
        let length = item.length
        // 空格和符号 · 大约1.7个空格和符号占1个字符位
        let space = item.match(/\s|·/g)
        if (space) {
          length = length - space.length / 1.7
        }
        // 计算长度
        if (count) {
          return (length - count.length) * flagFontSize + count.length * (flagFontSize - 4) + flagPaddingWidth + 2 * 1
        } else {
          return length * flagFontSize + flagPaddingWidth + 2 * 1
        }
      }
      // 控制循环状态的变量
      let iStatus = 1
      // 计算动态高度
      function dynamicHeight(item) {
        // 距离底边距离 即x轴位置
        let x = cptHeight(item)
        let y
        let length = Math.floor((chartHalfHeight * 2) / (tagHeight + 3))
        iStatus = iStatus * -1
        for (let index = 2; index < length - 1; index++) {
          let active = iStatus > 0 ? length - index : index
          // 该区间已经有值 跳过
          if (!objMap[active]) continue;
          if (x < chartHalfHeight) { // 下半区
            if (objMap[active] - tagHeight > x) { // 下半区旗子向上 所以 objMap区间的x值必须要大于x 而且最小距离不小于tagheight
              y = objMap[active] - x
              objMap[active] = null
              return y
            }
          } else { // 上半区
            if (objMap[active] + tagHeight < x) { // 上半区旗子向下 所以objMap 必须小于x 而且最小距离不小于tagheight
              y = x - objMap[active]
              objMap[active] = null
              return y
            }
          }
        }
      }
      // 一个map
      function makeObj() {
        // 以x轴 划分区间 区间高度为 tagHeight + 3 减少误差而冲突可能性
        let num = Math.floor(chartHalfHeight * 2 / (tagHeight + 3))
        let o = {}
        for (let index = 0; index < num; index++) {
          o[index] = (tagHeight + 3) * index
        }
        objMap = o
        return o
      }
      makeObj()

      pointerArr = pointerArr.filter(i => i.pIndex !== -1)
      // 计算距底边
      function cptHeight (item) {
        let distanceRate = (dataLineY[item.pIndex].value - min) / (max - min)
        return chartHalfHeight * distanceRate * 2
      }

      let pointerData = pointerArr.map(
        (item, index) => {
          // positonX X轴偏移
          // flagPosition 旗子方向 左右
          let positionX, positionY, flagPosition
          let fontColor = '#000'
          let bgColor = 'transparent'
          // 间隔几个重置 旗子map
          if (index % 5 === 0) objMap = makeObj()
          // tag width
          let width = tagWidth(item.tagName)
          // height
          let height = dynamicHeight(item)
          // flagRate 上方还是下方
          let flagRate = dataLineY[item.pIndex].value <= pre_px
          // x基点
          let xBase = item.pIndex / (dataLineX.length - 1) * chartWidth
          // y基点
          let yBase = chartHalfHeight * 2 - cptHeight(item)
          // 位置对象
          let positions = {'pIndex': item.pIndex, 'tagName': item.tagName, 'Id': item.Id}
          // y轴偏移计算
          positionY = height + tagHeight
          // 检测是否是被选中
          if (flagId === item.Id) {
            bgColor = red
            fontColor = '#fff'
          } else {
            fontColor = '#000'
            bgColor = 'transparent'
          }
          // item[left] 左半边还是右半边
          if (!item['left']) { // 右边
            flagPosition = 'right'
            positionX = width * -1
            positions['x1'] = xBase - width
            positions['x2'] = xBase
            if (flagRate) { // 右下
              positionY = -positionY
              positions['y2'] = yBase - height
              positions['y1'] = yBase - height - tagHeight
            } else { // 右上
              positionY = symbolSize
              positions['y1'] = yBase + height
              positions['y2'] = yBase + height + tagHeight
            }
          } else { // 左边
            flagPosition = 'left'
            positions['x1'] = xBase
            positions['x2'] = xBase + width
            if (flagRate) { // 左下
              positionX = '50%'
              positionY = -positionY
              positions['y2'] = yBase - height
              positions['y1'] = yBase - height - tagHeight
            } else { // 左上
              positions['y1'] = yBase + height
              positions['y2'] = yBase + height + tagHeight
              positionX = symbolSize / 2
              positionY = symbolSize
            }
          }
          let obj = {
            coord: [dataLineX[item.pIndex].value, dataLineY[item.pIndex].value],
            value: dataLineY[item.pIndex].value,
            itemStyle: {
              normal: {color: '#fff', borderColor: pointerColor[0]}
            },
            positions,
            label: {
              formatter: function(p) {
                return flagRate ? `{a|${item.tagName}}\n{b| }` : `{b| }\n{a|${item.tagName}}`
              },
              position: [positionX, positionY],
              rich: {
                a: {
                  height: 10,
                  backgroundColor: bgColor,
                  color: fontColor
                },
                b: {
                  align: flagPosition,
                  height: height,
                  borderColor: pointerColor[0]
                }
              }
            }
          }

          return obj
        }
      )

      let series = [
        // y轴1 分时线
        {
          type: 'line',
          label: {
            normal: {
              show: false,
              position: 'inside'
            }
          },
          lineStyle: {
            normal: {
              width: 1,
              color: seriesLineColor[0]
            }
          },
          smooth: true,
          axisLabel: {
            inside: true,
            color: '#8c8f8c',
            margin: '0',
            formatter: (value) => {
              return value.toString() === max ? `\n\n\n${value}` : `${value}\n`
            }
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
              offset: 0,
              color: '#d5e2fb'
            }, {
              offset: 1,
              color: '#fafcff'
            }])
          },
          symbol: 'none',
          data: dataLineY
        },
        // y轴2 黄色均线
        {
          type: 'line',
          label: {
            normal: {
              show: false,
              position: 'inside'
            }
          },
          lineStyle: {
            normal: {
              width: 1,
              color: '#fec501'
            }
          },
          markLine: {
            silent: true,
            lineStyle: {
              normal: {color: '#558fe7'
              }
            },
            data: [{
              name: 'a',
              yAxis: pre_px
            }],
            symbol: 'none'
          },
          markPoint: {
            symbol: 'circle',
            symbolSize: symbolSize,
            label: {
              fontSize: 12,
              textBorderWidth: 0,
              rich: {
                a: {
                  borderWidth: 1,
                  borderColor: pointerColor[0],
                  padding: [3, 7],
                  textBorderColor: 'transparent'
                },
                b: {
                  align: 'right',
                  width: 0,
                  borderWidth: 1
                }
              }

            },
            data: pointerData
          },
          symbol: 'none',
          data: datalinePre
        },
        {
          type: 'bar',
          xAxisIndex: 1,
          yAxisIndex: 2,
          data: dataBarY
        }];

      // 分时图配置
      var tchartOptions = {
        color: ['red', 'green'],
        tooltip: {
          show: true,
          trigger: 'axis',
          axisPointer: {
            type: 'line'
          },
          formatter: function(params) {
            var time = params[0].name;
            var val = params[0].value;

            var html = time + '<br/>' +
                        '价格: ' + val + '<br/>';
            return html;
          }
        },
        grid: [{
          left: '0px',
          right: '0px',
          height: '72%',
          top: '0px',
          containLabel: true
        },
        {
          left: '0px',
          right: '0px',
          height: '24%',
          //   top: '60%',
          bottom: '0px',
          containLabel: true
        }],
        xAxis: [
          {
            scale: true,
            boundaryGap: false,
            // 标签信息
            axisLabel: {
              show: true,
              align: 'center',
              lineHeight: 100,
              textStyle: {
                // height: 100,
                color: '#c3c5c3'
              },
              interval: (index, val) => {
                if (val === '0930' || val === '1030' || val === '1130' || val === '1400' || val === '1500') {
                  return val
                } else {
                  return ''
                }
              },
              formatter: function(val) {
                if (val === '0930') return '000009:30'
                if (val === '1500') return '15:000000'
                return val === '1130' ? '11:30 13:00' : val.slice(0, 2) + ':' + val.slice(-2)
              }},
            // 刻度
            axisTick: {
              show: false
            },
            // 轴线
            axisLine: {
              show: true,
              onZero: true
            },
            // 分割线
            splitLine: {
              show: true,
              lineStyle: {
                color: '#eff0f2'
              },
              interval: (index, val) => {
                if (val === '1030' || val === '1130' || val === '1400' || val === '1500') {
                  return true
                } else {
                  return false
                }
              }
            },
            // 数据指定
            data: dataLineX
          },
          // 第二个图标的x轴
          {
            type: 'category',
            // 图标序号
            gridIndex: 1,
            // 数据指定
            data: dataLineX,
            scale: true,
            boundaryGap: true,
            axisLine: {onZero: false},
            axisTick: {show: false},
            splitLine: {show: false},
            axisLabel: {show: false}
            // splitNumber: 20
          }
        ],
        yAxis: [
          {
            type: 'value',
            scale: true,
            min,
            max,
            splitArea: {
              show: false
            },
            interval: function (index, value) {
              if (value === max || value === min || value === pre_px) {
                return true
              } else {
                return false
              }
            },
            z: 99,
            axisLabel: {
              inside: true,
              color: '#8c8f8c',
              margin: '0',
              formatter: (value) => {
                return value.toString() === max ? `\n${value}` : `${value}\n`
              }
            },
            axisTick: {
              show: false
            },
            axisLine: {
              show: false
            },
            symbol: 'none',
            splitLine: {
              show: false
            }
          },
          {
            type: 'value',
            scale: true,
            min,
            max,
            splitArea: {
              show: false
            },
            nameTextStyle: {
              color: '#8c8f8c'
            },
            interval: function (index, value) {
              if (value === max || value === min || value === pre_px) {
                return true
              } else {
                return false
              }
            },
            z: 99,
            axisLabel: {
              inside: true,
              color: '#8c8f8c',
              margin: '0',
              formatter: (value) => {
                return value.toString() === max ? `\n+${rate}` : `-${rate}\n`
              }
            },
            axisTick: {
              show: false
            },
            axisLine: {
              show: false
            },
            symbol: 'none',
            splitLine: {
              show: false
            }
          },
          {
            scale: true,
            gridIndex: 1,
            splitNumber: 2,
            axisLabel: {show: false},
            axisLine: {show: false},
            axisTick: {show: false},
            splitLine: {show: false},
            max: 'dataMax',
            min: 'dataMin'
          }
        ],
        // dataZoom: [
        //   {
        //     type: 'inside',
        //     y: '100%',
        //     x: '100%'
        //   }
        // ],
        series: series
      };
      myChart.setOption(tchartOptions)
      // 取到flag的位置数组
      this.flagPositons = myChart.getOption().series[1].markPoint.data.map(
        item => item.positions
      )
    }
  },

  components: {}

}
</script>
<style lang='scss' scoped>
#eline{
    width: 100vw;
    height: 72vw;
}
</style>