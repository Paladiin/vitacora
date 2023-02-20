
<template>
  <div class="stock-trend">
    <div
      v-for="stock in stocks"
      :key="stock.symbol"
      :class="colorName(stock.symbol)"
     >
      <i :class="iconClass(stock.symbol)"></i>
      <span>{{ stock.name }}</span>
      <span>{{isChangeRateUp(stock.symbol) ? '+' : ''}}{{ (getPxChangeRate(stock.symbol) || 0) | toFixed_2 }}%</span>
    </div>
  </div>
</template>

<script>
import { versions } from '@/utils/index'

export default {
  props: {
    stocks: {
      type: Array,
      default: () => []
    },
    stocksPool: {
      type: Object,
      default: () => {}
    },
    fields: {
      type: Array,
      default: () => []
    },
    isShare: {
      default: false
    }
  },
  created () {
    window.st = this
  },
  methods: {
    getPxChangeRate (symbol) {
      return this.stocksPool &&
        this.stocksPool[symbol] &&
        Number(this.stocksPool[symbol][this.getIndexByField('px_change_rate', this.fields)])
    },
    isChangeRateUp (symbol) {
      return this.stocksPool &&
        this.stocksPool[symbol] &&
        this.getPxChangeRate(symbol) >= 0
    },
    iconClass (symbol) {
      if (this.isChangeRateUp(symbol) > 0) {
        return 'iconfont icon-gupiaozhang'
      } else {
        return 'iconfont icon-gupiaodie'
      }
    },
    colorName (symbol) {
      if (this.isChangeRateUp(symbol) > 0) {
        return 'color-red'
      } else {
        return 'color-green'
      }
    },
    getIndexByField (fieldName, fields) {
      return fields && fields.length > 0 && fields.indexOf(fieldName)
    },
    // 跳转个股
    handleStockClick (stock) {
      const symbol = stock.symbol
      const code = symbol.split('.')[0]
      const prodName = stock.name
      const marketId = symbol.split('.')[1]
      const marketIds = {
        'SZ': 1,
        'SS': 2
      }
      if (this.isShare) return
      if (!versions().isWeiXin) {
        if (versions().isAndroid) {
          window.KDS_Native.jumpStockDetail(code, marketIds[marketId], prodName)
        } else if (versions().isIOS) {
          location.href = `KDS_Native://jumpStockDetail:${code}:${marketIds[marketId]}:${prodName}`
        }
      }
    }
  }
}
</script>

<style lang="scss">
.stock-trend {
  .color-red {
    color: #F34A55;
  }
  .color-green {
    color: #54B88E;
  }
  display: flex;
  flex-wrap: wrap;
  & > div {
    margin-bottom: 16px;
    margin-right: 40px;
    font-size: 24px;
    font-family: PingFangSC-Medium;
  }
}
</style>