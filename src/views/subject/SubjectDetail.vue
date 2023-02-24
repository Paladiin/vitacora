
<template>
  <div class="subject-detail">
    <div class="subject-detail-head">
      <div class="subject-detail-head-info">
        <div class="subject-detail-head-info-title">
          <span class="subject-detail-head-info-title-name">{{ bkjName }}</span>
          <span
            class="subject-detail-head-info-title-rate"
            v-if="changeRate"
            :class="colorName(changeRate)">
            {{ Number(changeRate) > 0 ? '+' : ''}}{{ changeRate }}%
          </span>
        </div>
        <div class="subject-detail-head-info-number">
          <span>上涨<em class="color-red">{{ changeCount.up }}</em></span>
          <span>平盘<em class="color-gray">{{ changeCount.eq }}</em></span>
          <span>下跌<em class="color-green">{{ changeCount.down }}</em></span>
          <span>净流入<em :class="colorName(totalFlow)">{{ approxFlowNumber(totalFlow) }}</em></span>
        </div>
      </div>
      <div class="subject-detail-head-chart">当日涨幅</div>
      <fen-shi :pro-code="proCode"></fen-shi>
    </div>
    <div class="subject-detail-reason" v-if="chufaReason">
      <div class="subject-detail-reason-header">
        <span>最近触发理由</span>
      </div>
      <information-item
        :info="chufaReason"
        :stocks-pool="chufaReasonStocksPool"
        :fields="fields"
        @itemClick="handleItemClick"
        @shareClick="handleShareClick">
      </information-item>
    </div>
    <div class="subject-detail-longtou">
      <info-panel title="龙头股" :more="true" @moreClick="handleMoreClick">
        <stock-list :stocks="leadStocks" th-name="名称" :sort="false"></stock-list>
      </info-panel>
    </div>
    <div class="subject-detail-related-fund" v-if="type == 0">
      <info-panel title="相关基金" :more='true' @moreClick="handleMoreFundsClick">
        <fund-list :funds="funds.slice(0,3)" v-if="funds.length > 0"></fund-list>
        <div v-else class="no-info">暂无相关基金</div>
      </info-panel>
    </div>
    <div class="subject-detail-information">
      <info-panel title="资讯">
        <ul class="subject-detail-information-list" v-if="subMsgs.length > 0">
          <li v-for="sub in subMsgs" :key="sub.msg_id">
            <information-item
              :info="sub"
              :stocks-pool="subMsgStocksPool"
              :fields="fields"
              @itemClick="handleItemClick"
              @shareClick="handleShareClick">
            </information-item>
          </li>
        </ul>
        <div v-else class="no-info">暂无资讯</div>
      </info-panel>
    </div>
  </div>
</template>

<script>
import InformationItem from './InformationItem'
import InfoPanel from '@/components/infoPanel/InfoPanel'
import StockList from '@/components/stockList/StockList'
import fundList from '@/components/fundList/fundList'
import FenShi from '@/components/fenshi/fenshi'
import stocksApi from '@/service/stocksApi'
import isWeekend from 'date-fns/is_weekend'

import {
  extractSymbolToParams,
  formatDataByFields,
  versions
} from '@/utils/index'
import {
  getScrollTop,
  getScrollHeight,
  getWindowHeight
} from '@/utils/domHeight'

export default {
  data () {
    return {
      changeRate: null,
      bkjName: '',
      bkjId: 0,
      stocksId: [],
      leadStocksId: [],
      fields: [],
      funds: [],
      leadStocks: [],
      changeCount: {},
      chufaReason: {},
      subMsgs: [],
      fundFlow: {},
      chufaReasonStocksPool: {},
      subMsgStocksPool: {},
      isLoading: false,
      page: 1,
      limit: 40,
      isLoadMsgEnd: true,
      proCode: null,
      type: 0,
      isIOS: versions().isIOS
    }
  },
  created () {
    const themeType = Number(this.$route.query.skin)
    if (themeType) {
      document.querySelector('#app').setAttribute('class', 'night-theme')
      document.body.style.background = '#0F1322'
    }
    localStorage.setItem('__THEME_TYPE__', themeType)
    window.sub = this
    this.leadStocks = []
    this.bkjId = this.proCode = this.$route.params.id
    this.getTodayLongTou()
    this.initStocksData()
    this.getSubjectMsgs()
    this._getfund()
    this._initType()
    // this.initRefresh(30)
  },
  computed: {
    totalFlow () {
      let val = 0
      Object.keys(this.fundFlow).forEach(key => {
        const element = this.fundFlow[key]
        val += this.getFundFlow(element)
      })
      return val
    }
  },
  mounted () {
    setTimeout(() => {
      window.addEventListener('scroll', this.handleScroll)
    }, 200)
  },
  destroyed () {
    window.removeEventListener('scroll', this.handleScroll)
  },
  methods: {
    /* eslint-disable */
    approxFlowNumber: n => n == 0 ? 0 : n > 0 ? '+' + (n > 1e8 ? (n / 1e8).toFixed(2) + '亿' : n > 10000 ? (n / 10000).toFixed(2) + '万' : n) : '-' + (Math.abs(n) > 1e8 ? (Math.abs(n) / 1e8).toFixed(2) + '亿' : Math.abs(n) > 10000 ? (Math.abs(n) / 10000).toFixed(2) + '万' : Math.abs(n)),
    getTodayLongTou () {
      stocksApi.getLongtou(this.bkjId).then(res => {
        if (res.code === 20000 && res.data.jin_ri_long_tou) {
          let {jin_ri_long_tou, hang_ye_long_tou} = res.data
          if (jin_ri_long_tou.length === 0 && hang_ye_long_tou) { // 如果今日龙头不存在 而行业龙头存在 今日龙头 = 行业龙头
           jin_ri_long_tou = Object.keys(hang_ye_long_tou)
           console.log(jin_ri_long_tou, hang_ye_long_tou);
          }
          if (jin_ri_long_tou.length > 0) { // 今日龙头 或 行业龙头 
            this.leadStocksId = jin_ri_long_tou.reduce((acc, current) => {
              return acc.concat(current)
            }, [])
            stocksApi.getStocksReal(this.leadStocksId.join(',')).then(res => {
              const { snapshot } = res.data
              this.fields = snapshot.fields
              this.leadStocks = formatDataByFields(snapshot, this.fields)
            })
          }else if (jin_ri_long_tou.length === 0) { // 如果今日龙头和行业龙头都不存在 则取板块股票中前三
          this.getLeadesStocks3()
          }
        }else {
          this.getLeadesStocks3()
        }
      }
      ).catch(e => {
        console.log(e)
      })
    },
    getLeadesStocks3(){
       stocksApi.getBanKuaiStocksPool(this.bkjId).then(res => {
              if (res.code === 20000) {
                this.stocksId = res.data.stocks.splice(0,3)
                console.log(extractSymbolToParams(this.stocksId));
                return extractSymbolToParams(this.stocksId)
              }
            }).then(
              parmas => {
                stocksApi.getStocksReal(parmas).then(res => {
                const { snapshot } = res.data
                this.fields = snapshot.fields
                this.leadStocks = formatDataByFields(snapshot, this.fields)
            })
              }
            )
    },
    getSubjectMsgs () {
      stocksApi.getSubjectInfo(this.bkjId).then(res => {
        if (res.code === 20000) {
          this.chufaReason = res.data.feature_message
          this.subMsgs = res.data.msgs
          let params = extractSymbolToParams(this.chufaReason &&this.chufaReason.stocks)
          stocksApi.getStocksReal(params).then(res => {
            this.chufaReasonStocksPool = res.data.snapshot
            this.fields = this.chufaReasonStocksPool.fields
          }).catch(e => console.log(e))
          let params2 = ''
          this.subMsgs.forEach(sub => {
            if (sub.stocks && sub.stocks.length) {
              params2 += ',' + extractSymbolToParams(sub.stocks)
            }
          })
          stocksApi.getStocksReal(params2.slice(1)).then(res => {
            this.subMsgStocksPool = res.data.snapshot
            this.fields = this.subMsgStocksPool.fields
          }).catch(e => console.log(e))
        }
      })
    },
    initStocksData () {
      stocksApi.getPlatNormalInfo(this.bkjId).then(res => {
        if (res.code === 20000) {
          this.changeRate = res.data.core_pcp
          this.bkjName = res.data.plate_name
        }
      })
      stocksApi.getBanKuaiStocksPool(this.bkjId).then(res => {
        if (res.code === 20000) {
          this.stocksId = res.data.stocks
          return extractSymbolToParams(this.stocksId)
        }
      }).then(params => {
        stocksApi.getStocksReal(params).then(res => {
          this.stocksP = res.data.snapshot
          this.fields = this.stocksP.fields
          this.changeCount = this.countChangeNumber(this.stocksP)
        }).catch(e => console.log(e))
        stocksApi.getFundFlow(params).then(res => {
          this.fundFlow = res.data
        })
      })
    },
    _getfund(){
      stocksApi.getFundList(this.bkjId).then(
        res => {
          if (res.code === 20000){
            this.funds = this._fundFilter(res.data.funds) 
          }
          }
      ).catch(
        e => console.log(e)
      )
    },
    _fundFilter(data){
      return data.sort(
        (a,b) => b.star - a.star
      )
    },
    _initType(){
      this.type = this.$route.query.type
    },
    //板块涨跌
    getPlatRateInfo () {
      stocksApi.getPlatNormalInfo(this.bkjId).then(res => {
        if (res.code === 20000) {
          this.changeRate = res.data.core_pcp
        }
      })
    },
    // 定时刷新:
    initRefresh (second) {
    clearInterval(this.timer)
    if (!this.inStockTime()) return 
    this.timer = setInterval(() => {
      this.getTodayLongTou()
      this.getSubjectMsgs()
      this.getPlatRateInfo()
    }, second * 1000)
    },
    // 是否开盘时间
    inStockTime() {
      var today = new Date();
      var localoffset = -(today.getTimezoneOffset() / 60);
      var destoffset = 8;

      var offset = destoffset - localoffset;
      var time = new Date(new Date().getTime() + offset * 3600 * 1000)