
<!-- 个股异动 -->
<template>
 <div class="stockTransaction">
        <StockTranItem v-for="(item,index) in stocksArr" :key="index" :stocks = "item"></StockTranItem>
 </div>
</template>
<style lang='scss' scoped>
.stockTransaction{
    margin: 0 20px;
    border-left: 1px dashed #e5e5e6;
}
</style>
<script>
import {getStockTransaction} from '@/service/newsApi'
import StockTranItem from './stockTranItem'
import {
  getScrollTop,
  getScrollHeight,
  getWindowHeight
} from '@/utils/domHeight'
export default {
  data () {
    return {
      head: null,
      tail: null,
      timer: null,
      stocksArr: []
    };
  },

  created() {
    this.getlist()
    this.setTaskInterval(20)
  },

  mounted() {
    setTimeout(() => {
      window.addEventListener('scroll', this.handleScroll)
    }, 200)
  },
  destroyed() {
    window.removeEventListener('scroll', this.handleScroll)
  },

  methods: {
    // 定时任务
    setTaskInterval(n) {
      clearInterval(this.timer)
      this.timer = setInterval(
        this.refreshData, n * 1000
      )
    },
    getlist() {
      const parmas = {
        tail: this.tail
      }
      getStockTransaction(parmas).then(
        res => {
          if (res.code === 20000) {
            this.stocksArr = [...this.stocksArr, ...res.data.items]
            !this.head && (this.head = res.data.items[0][4])
            this.tail = res.data.items[res.data.items.length - 1][4]
          }
        }
      )
    },
    refreshData() {
      const parmas = {
        head: this.head
      }
      getStockTransaction(parmas).then(
        res => {
          if (res.code === 20000 && res.data.items.length) {
            // 用上一个的head去查 返回的item中最后一个元素为上一个head 所以用slice切掉最后一个重复的
            this.stocksArr = [...res.data.items.slice(0, -1), ...this.stocksArr]
            this.head = res.data.items[0][4]
          }
        }
      )
    },
    // 滚动事件
    handleScroll () {
      if (getScrollTop() + getWindowHeight() >= getScrollHeight() - 10) {
        this.getlist()
      }
    }

  },

  computed: {},

  components: {StockTranItem}

}
</script>