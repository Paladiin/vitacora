<template>
  <div class="stock-list-views">
    <stock-list :stocks="stocksPool"></stock-list>
  </div>
</template>

<script>
import stocksApi from '@/service/stocksApi'
import StockList from '@/components/stockList/StockList'
import {
  extractSymbolToParams,
  formatDataByFields,
  setTheme,
  versions
} from '@/utils/index'

export default {
  data () {
    return {
      bjkId: 0,
      stocksPool: [],
      fields: [],
      stocksId: [],
      isIOS: versions().isIOS
    }
  },
  created () {
    setTheme()
    this.bjkId = this.$route.params.id
    this.getStocksList()
  },
  methods: {
    getStocksList () {
      stocksApi.getBanKuaiStocksPool(this.bjkId).then(res => {
        if (res.code === 20000) {
          this.stocksId = res.data.stocks
          const params = extractSymbolToParams(this.stocksId)
          console.log(params);
          // params.slice(1) => params
          stocksApi.getStocksReal(params).then(res => {
            const { snapshot } = res.data
            this.fields = snapshot.fields
            this.stocksPool = formatDataByFields(snapshot, this.fields)
          }).catch(e => {
            console.log(e)
          })
        }
      })
    }
  },
  components: {
    StockList
  }
}
</script>

<style lang="scss">
.stock-list-views {
  min-height: 100vh;
}
</style>
