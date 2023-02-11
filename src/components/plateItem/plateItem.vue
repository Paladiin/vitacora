<template>
<div >
    <div class="plate-item" @click="_redirect">
        <dl>
            <dt>
                <div class="title">
                    <span :class="index>2?'gray':''">{{index + 1}}</span>
                    <h3>{{info.title}}</h3>
                </div>
                <div class="time">
                    {{info.featured_msg_created_at * 1000 | fomatTimeShort}}
                </div>
            </dt>
            <dd v-if="info && info.featured_msg_title" class="plate-item-desc" v-html="info.featured_msg_title"></dd>
        </dl>
        <div class="plate-item-stocks" v-if="info && info.featured_msg_stocks">
            <stock-trend
                :stocks="info.featured_msg_stocks"
                :stocks-pool="stocksPool"
                :fields="fields">
            </stock-trend>
        </div>
    </div>
        <div class="plate-item-line"></div>
    </div>
</template>

<script>
import StockTrend from "@/components/stockTrend/StockTrend";
import api from "@/service/stocksApi";
export default {
  props: {
    info: {
      type: Object,
      default: () => {
        return {
          name: "钛白粉",
          time: 1524532976,
          summary: "海内外海内外海内外海内外海内外海内外海内外海内外海内外"
        };
      }
    },
    index: {
      type: Number,
      default: 0
    },
    query: {}
  },
  data() {
    return {
      fields: [],
      stocksPool: {}
    };
  },
  created() {
    this._getRate();
  },
  methods: {
    _redirect() {
      this.$router.push({
        name: `SubjectDetail`,
        params: {
          id: this.info.bkj_id
        },
        query: this.query
      });
    },
    // 获取涨跌详情
    _getRate() {
      api
        .getStocksReal(this._filterStocks(this.info.featured_msg_stocks))
        .then(res => {
          this.fields = res.data.snapshot.fields;
          this.stocksPool = res.data.snapshot;
        });
    },
    // 筛选出对应股票,已符合api接口的形式传递
    _filterStocks(stocks) {
      let str = stocks.reduce((sum, current) => sum + `${current.symbol},`, "");
      return str.slice(0, -1);
    }
  },
  filters: {
    fomatTimeShort: function(value) {
      return new Date(value)
        .toLocaleString()
        .replace(/(:\d{1,2}$)|(\d{4}\/)|[\u4e00-\u9fa5]/g, "")
        .replace(/(\d{1}\/)/, "0$1")
        .replace(/\/(\d{1}\s