
<!-- 大盘异动 -->
<template>
 <div class="transaction">
   <SSInfoTitle :ssdata = 'sstoday' v-if="sstoday.length" ></SSInfoTitle>
   <ul class="transaction-chart-tab">
     <li :class="active === index ? 'active' : ''" @click="switchTab(item.keyword,index)" v-for="(item,index) in  tabList" :key="index">{{item.name}}</li>
   </ul>
   <MinLine v-if="active == 0" :trancArr = "trancArr" @onTop="_topMsg"></MinLine>
   <KLineDay v-if="isklineactive()" :klineapi = "klineapi" :type ="keyword"></KLineDay>
   <div class="transaction-bgline"></div>
    <ul class="transaction-option-tab" ref="optionTab">
      <li :class="optionActive === index ? 'active' : ''"  @click="optionActive = index" v-for="(item,index) in  optionTabList" :key="index">{{item}}</li>
    </ul>
    <ul class="transaction-option-tab" v-if="fixed" :class="fixed ? 'fixed' :''">
      <li :class="optionActive === index ? 'active' : ''"  @click="optionActive = index" v-for="(item,index) in  optionTabList" :key="index">{{item}}</li>
    </ul>
    <keep-alive>
    <TransactionList v-if="optionActive == 0" @trancInfo = "trancArrHandle" :topTagId = "topTagId"></TransactionList>
    <StockTransaction v-if="optionActive == 1"></StockTransaction>
    </keep-alive>

    <!-- <photoswiper></photoswiper> -->
 </div>
</template>
<style lang='scss' scoped>
.transaction{
  &-chart-tab{
    display: flex;
    align-items: center;
    justify-content: space-around;
    padding: 10px 0;
    li{
      font-size: 28px;
      line-height: 50px;
      color:#808080;
      border-bottom: 2px solid transparent;
      &.active{
        color:#333333;
        border-bottom-color: #e6394d;
      }
    }
  }
  &-bgline{
    margin-top: 2px;
    height: 8px;
    background-color: #fafaf7;
  }
  &-option-tab{
    display: flex;
    align-items: center;
    justify-content: flex-start;
    box-shadow: 1px 0 1px #f1f1f1;
    background-color: #fff;
    // padding: 10px 0;
    li{
      margin: 0 38px;
      font-size: 28px;
      line-height: 68px;
      color:#808080;
      border-bottom: 2px solid transparent;
      &.active{
        color:#333333;
        border-bottom-color: #e6394d;
      }
    }
    &.fixed{
      width: 100%;
      position: fixed;
      top: 0;
    }
  }
}
</style>

<script>
import MinLine from '@/components/line/MinLine'
// import photoswiper from "@/components/photoswiper";
import KLineDay from '@/components/line/KLineDay'
import SSInfoTitle from './SSInfoTitle'
import TransactionList from '@/components/transactionList/transactionList'
import StockTransaction from '@/components/stockTransaction/stockTransaction'
import {getSSToday, getSSKlineDay, getSSKlineWeek, getSSKlineMonth, getSSKline5Min, getSSKline15Min, getSSKline30Min, getSSKline60Min} from '@/service/stocksApi'
export default {
  data () {
    return {
      fixed: false,
      tabList: [
        {name: '分时', keyword: 'min'},
        // {name: '五日', keyword: '5day'},
        {name: '日K', keyword: 'day'},
        {name: '周K', keyword: 'week'},
        {name: '月K', keyword: 'month'},
        {name: '5分', keyword: '5min'},
        {name: '15分', keyword: '15min'},
        {name: '30分', keyword: '30min'},
        {name: '60分', keyword: '60min'}
      ],
      optionTabList: [
        '大盘异动', '个股异动'
      ],
      klinemap: {
        'day': getSSKlineDay,
        'week': getSSKlineWeek,
        'month': getSSKlineMonth,
        '5min': getSSKline5Min,
        '15min': getSSKline15Min,
        '30min': getSSKline30Min,
        '60min': getSSKline60Min
      },
      active: 0,
      optionActive: 0,
      keyword: '',
      klineapi: '',
      sstoday: [],
      trancArr: [],
      timer: null,
      topTagId: ''
    };
  },

  created() {
    getSSToday().then(
      res => {
        this.sstoday = res.data.snapshot['000001.SS'] || []
      }
    )
  },
  computed: {
    data: function() {
      return 0
    }
  },

  mounted() {
    window.addEventListener('scroll', this.onScroll)
    this._autoRefresh(30)
  },
  destroyed() {
    window.removeEventListener('scroll', this.onScroll)
  },

  methods: {
    _autoRefresh(seconds) {
      if (this.timer) return
      setInterval(
        this._getInfoData, 1000 * seconds
      )
    },
    _getInfoData() {
      getSSToday().then(
        res => {
          this.sstoday = res.data.snapshot['000001.SS'] || []
        }
      )
    },
    _topMsg(msg) {
      this.topTagId = msg
    },
    trancArrHandle(value) {
      this.trancArr = value
    },
    switchTab(keyword, index) {
      this.active = index
      this.keyword = keyword
      if (this.isklineactive()) {
        this.klineapi = this.klinemap[keyword]
      }
    },
    isklineactive() {
      return this.klinemap.hasOwnProperty(this.keyword)
    },
    onScroll() {
      this.fixed = (document.body.scrollTop || document.documentElement.scrollTop) > this.$refs.optionTab.offsetTop
    }
  },
  components: {MinLine, KLineDay, SSInfoTitle, TransactionList, StockTransaction}

}
</script>