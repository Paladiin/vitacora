<template>
  <div class="information-item">
    <div @click="handleClick">
      <div class="information-item-title">{{ info && info.title }}</div>
      <div v-if="info && info.summary" class="information-item-desc" v-html="info.summary"></div>
    </div>
    <div class="information-item-stocks" v-if="info && info.stocks">
      <stock-trend
        :stocks="info.stocks"
        :stocks-pool="stocksPool"
        :fields="fields">
      </stock-trend>
    </div>
    <div class="information-item-footer">
      <i class="iconfont icon-fenxiang" @click="handleShareClick"></i>
      <div class="information-item-footer-date" v-if="info && info.created_at">
        <i class="iconfont icon-shizhong"></i>
        <span>{{ info && Number(info.created_at) * 1000  | formatTime }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import StockTrend from '@/components/stockTrend/StockTrend'

export default {
  props: {
    info: {
      type: Object,
      default: () => {}
    },
    stocksPool: {
      type: Object,
      default: () => {}
    },
    fields: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    handleClick () {
      this.$emit('itemClick', this.info)
    },
    handleShareClick () {
      this.$emit('shareClick', this.info)
    }
  },
  components: {
    StockTrend
  }
}
</script>

<style lang="scss">
.information-item {
  padding: 30px 20px;
  &-title {
    font-family: PingFangSC-Regular;
    line-height: 1.4;
    margin-bottom: 16px;
    font-size: 30px;
    color: #333333;
  }
  &-desc {
    color: #666666;
    font-size: 24px;
    font-family: PingFangSC-Regular;
    line-height: 36px;
    padding-bottom: 16px;
    & > span {
      color: #F34A55;
    }
  }
  &-stocks {
    margin-top: 20px;
    margin-bottom: 14px;
  }
  &-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #D8D8D8;
    &-date {
      display: flex;
      align-items: center;
      font-size: 22px;
      & > span {
        margin-left: 8px;
      }
    }
  }
}
</style>
