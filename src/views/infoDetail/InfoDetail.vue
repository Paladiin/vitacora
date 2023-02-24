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
          stocksApi.getStocksReal(params).then(res => {
            this.stocksPool = res.data.snapshot
            this.fields = this.stocksPool.fields
          })
        }
      })
    },
    redirectToDownload () {
      const URL = 'http://www.gyzq.com.cn/gyzq/gydj/gydj.html'
      window.location = URL
    },
    handleClick () {
      const title = this.msgDetail.title
      let ele = document.createElement('div')
      ele.innerHTML = this.msgContent
      const content = ele.innerText.slice(0, 40)
      const url = `${location.origin}/guoyuan/jinrijihuih5/infoDetail/${this.msgId}?frombkj=${this.bkjId}&isShare=true`
      if (versions().isAndroid) {
        window.KDS_Native.share(title, content, url)
      } else if (versions().isIOS) {
        location.href = `KDS_Native://share:${title}:${content}:${url}`
      }
    },
    showChangeFontButton () {
      if (versions().isAndroid) {
        window.KDS_Native.isShowChangeFontSizeButton('1')
      } else if (versions().isIOS) {
        location.href = `KDS_Native://isShowChangeFontSizeButton:1`
      }
    }
  },
  components: {
    StockTrend
  }
}
</script>

<style lang="scss">
.info-detail {
  padding: 36px 0 90px 0;
  min-height: 100vh;
  & > h1 {
    padding: 0 30px;
    font-size: 44px;
    font-family: PingFangSC-Medium;
    line-height: 1.2;
    color: #333333;
  }
  &-label {
    padding: 0 30px;
    margin-top: 38px;
    margin-bottom: 44px;
    & > span {
      margin-right: 54px;
      padding: 8px 30px;
      border-radius: 4px;
      color: #939393;
      font-family: PingFangSC-Regular;
      font-size: 24px;
      background: #F7F7F7;
    }
  }
  &-stocks {
    padding: 0 30px;
    margin-bottom: 42px;
  }
  &-content {
    padding: 0 30px;
    font-size: 32px;
    line-height: 1.8;
    color: #333333;
    font-family: PingFangSC-Regular;
    p {
      margin-bottom: 32px;
    }
    img {
      max-width: 100%;
    }
  }
  .big {
    font-size: 40px;
  }
  &-share {
    position: fixed;
    width: 100vw;
    height: 80px;
    background: #F6F6F6;
    color: red;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 30px;
    font-family: PingFangSC-Regula;
    bottom: 0;
    i {
      font-size: 42px;
      margin-right: 16px;
    }
  }
}
</style>
