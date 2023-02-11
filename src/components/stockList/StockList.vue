
<template>
  <table class="stock-list" border="0" cellspacing="0" cellpadding="0">
    <colgroup>
      <col style="width:30%">
      <col style="width:40%">
      <col style="width:30%">
    </colgroup>
    <thead class="stock-list-head" style="border:none;">
      <tr>
        <th class="text-left">
          <span>
            {{ thName }}
          </span>
        </th>
        <th @click="sortStocks('last_px','sortTypePrice')">
          <span>
            最新价<i class="iconfont icon-more2"></i>
          </span>
        </th>
        <th
          class="text-right"
          @click="sortStocks('px_change_rate', 'sortTypeRate')">
          <span>
            涨跌幅
            <i
              v-show="sort"
              class="iconfont"
              :class="sortTypeRate ? 'icon-up' : 'icon-down'">
            </i>
          </span>
        </th>
      </tr>
    </thead>
    <tbody class="stock-list-body">
      <template v-if="stocks.length > 0">
        <tr class="stock-list-body-row"
          v-for="stock in stocks"
          :key="stock.circulation_value"
          >
          <td class="text-left">
            <span class="name">{{ stock.prod_name }}</span>
            <span class="code">{{ stock.code }}</span>
          </td>
          <td class="text-center color-red last-px">{{ stock.last_px }}</td>
          <td class="text-right">
            <span
              class="change"
              :class="bgColorName(stock.px_change_rate)"
              >
              {{ stock.px_change_rate > 0 ? '+' : ''}}{{ stock.px_change_rate | toFixed_2 }}%
            </span>
          </td>
        </tr>
      </template>
      <tr class="stock-list-body-row" v-if="stocks.length === 0">
        <td></td>
        <td class="text-center" style="color:#333333;">
          {{ thName === '成分股' ? '暂无成分股' : '暂无龙头' }}
        </td>
        <td></td>
      </tr>
    </tbody>
  </table>
</template>

<script>
import { versions } from '@/utils/index'

export default {
  props: {
    stocks: {
      type: Array,
      default: () => []
    },
    thName: {
      type: String,
      default: '成分股'
    },
    sort: {
      type: Boolean,
      default: true
    }
  },
  data () {
    return {
      isInitStored: false,
      sortTypeRate: 1,
      sortTypePrice: 1
    }
  },
  methods: {
    handleStockClick (stock) {
      const marketIds = {
        'SZ': 1,
        'SS': 2
      }
      const code = stock.code
      const marketId = marketIds[stock.marketId]
      const prodName = stock.prod_name
      if (versions().isAndroid) {
        window.KDS_Native.jumpStockDetail(code, marketId, prodName)
      } else if (versions().isIOS) {
        location.href = `KDS_Native://jumpStockDetail:${code}:${marketId}:${prodName}`
      }
    },
    sortStocks (field, sortType) {
      if (this[sortType]) {
        this.stocks.sort((a, b) => {
          this[sortType] = 0
          return a[field] - b[field]
        })
      } else {
        this.stocks.sort((a, b) => {
          this[sortType] = 1
          return b[field] - a[field]
        })
      }
    },
    bgColorName (rate) {
      if (rate >= 0) {
        return 'bg-red'
      } else {
        return 'bg-green'
      }
    }
  },
  watch: {
    stocks (val) {
      if (val.length === 0 || this.isInitStored) {
        return false
      }
      this.stocks.sort((a, b) => {
        return b['px_change_rate'] - a['px_change_rate']
      })
      this.isInitStored = true
    }
  }
}
</script>

<style lang="scss">
.stock-list {
  width: 100%;
  border-collapse:collapse;
  .text-right {
    text-align: right;
    padding-right: 20px;
  }
  .text-left {
    text-align: left;
    padding-left: 20px;
  }
  .text-center {
    text-align: center;
  }
  .color-red {
    color: #F34A55;
  }
  &-head {
    height: 72px;
    width: 100%;
    font-size: 24px;
    font-family: PingFangSC-Regular;
    border-bottom: 1px solid #ECECEC;
    color: #535353;
    & > tr {
      line-height: 72px;
      height: 72px;
      border-bottom: 1px solid #ECECEC;
      span {
        display: inline-flex;
        align-items: center;
      }
    }
  }
  &-body {
    &-row {
      height: 104px;
      border-bottom: 1px solid #ECECEC;
      .name {
        font-size: 32px;
        font-family: PingFangSC-Regular;
        color: #333333;
        display: block;
        margin-bottom: 1px;
      }
      .code {
        font-size: 24px;
        font-family: PingFangSC-Regular;
        color: #999999;
      }
      .last-px {
        font-size: 32px;
        font-family: PingFangSC-Regular;
      }
      .change {
        display: inline-block;
        font-size: 32px;
        font-family: PingFangSC-Semibold;
        padding: 16px 0;
        width: 148px;
        text-align: center;
        border-radius: 8px;
        color: #ffffff;
      }
      .bg-red {
        background: #F34A55;
      }
      .bg-green {
        background: #54B88E;
      }
      & > td {
        vertical-align: middle;
      }
    }
    .no-lead-stock {
      width: 100%;
      color: #333333;
      text-align: center;
    }
  }
}
</style>