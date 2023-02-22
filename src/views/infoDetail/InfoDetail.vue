<template>
  <div class="info-detail" ref="infoDetail">
    <h1>{{ msgDetail.title }}</h1>
    <div class="info-detail-label" v-if="msgDetail && msgDetail.created_at">
      <span>{{ Number(msgDetail.created_at) * 1000 | formatTime}}</span>
      <span>选股宝</span>
    </div>
    <div class="info-detail-stocks">
      <stock-trend
        :stocks="stocks"
        :stocks-pool="stocksPool"
        :fields="fields"
        :isShare="isShare">
      </stock-trend>
    </div>
    <div class="info-detail-content" :class="{'big': bigFont}" v-html="msgContent"></div>
    <div
      v-if="!isShare"
      class="info-detail-share"
      @click="handleClick">
      <i class="iconfont icon-fenxiang1"></i>分享
    </div>
    <div
      v-else
      class="info-detail-share"
      @click="redirectToDownload">
      <i class="iconfont icon-xiazai"></i>下载/打开APP
    </div>
  </div>
</template>

<script>
import stocksApi from '@/service/stocksApi'
import StockTrend from '@/components/stockTrend/StockTrend'
import {
  extractSymbolToParams,
  setTheme,
  versions
} from '@/utils/index'

export default {
  data () {
    return {
      bkjId: 0,
      msgId: 0,
      msgDetail: {},
      stocks: [],
      stocksPool: {},
      fields: [],
      // imgUrl: require('@/assets/img/share.png'),
      bigFont: false,
      isWeixin: versions().isWeiXin,
      isIOS: versions().isIOS
    }
  },
  created () {
    setTheme()
    this.bkjId = this.$route.query.frombkj
    this.msgId = this.$route.params.id
    this.getMsgDetail()
  },
  computed: {
    msgContent () {
      return this.msgDetail && (this.msgDetail.content || this.msgDetail.summary)
    },
    isShare () {
      return this.$route.query.isShare
    }
  },
  mounted () {
    // try {
    //   if (!this.$route.query.isShare) {
    //     this.showChangeFontButton()
    //   }
    // } catch (e) {
    //   console.log(e)
    // }
    window.changeFontSize = (state) => {
      if (Number(state)) {
        this.bigFont = true
      } else {
        this.bigFont = false
      }
    }
  },
  methods: {
    getMsgDetail () {
      stocksApi.getMsgDetail(this.msgId).then(res => {
        if (res.code === 20000) {
          this.msgDetail = res.data
          this.stocks = this.msgDetail.stocks
          const params = extractSymbolToParams(this.stocks)
          stocksApi.getStocksReal