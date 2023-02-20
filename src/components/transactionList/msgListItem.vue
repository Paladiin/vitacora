
<!-- transaction msg list item -->
<template>
 <div class="msg-list-item">
    <div class="msg-list-item-time" :class="topTag?colorName(rate):''">
        <span class="msg-list-item-time-dot" :class="colorName(rate)">
            <i></i>
            <em></em>
            <b></b>
        </span>
        <span class="msg-list-item-time-text">{{createdTime}}</span>
        <span v-if="bkjInfo.length" class="msg-list-item-time-bkjif">{{bkjInfo[0].Name}}</span>
        <span v-if="bkjInfo.length" class="msg-list-item-time-bkjrt" :class="colorName(rate)">{{(rate>0 ? `+${rate}` : rate)}}%</span>
    </div>
    <div class="msg-list-item-title">
        {{msg.Title}}
    </div>
    <div class="msg-list-item-summary" v-if="msg.Summary" :ref="msg.Id" v-cut="{class:'line-clamp'}">{{msg.Summary}}</div>
    <div class="msg-list-item-imgwrap" v-if="msg.Image">
      <img :src="msg.Image" />
    </div>
    <StockTrend v-if="stocks" :stocks = "stocks" :stocksPool = "stocksPool" :fields="fields" class="msg-list-item-stock"></StockTrend>
    <!-- <image-modal-fake v-if="msg.Image" :src="msg.Image" :visible="visible" @hide="hideImageModal" /> -->

 </div>
</template>
<style lang='scss' scoped>
$red:#e82f4e;
$green:#4da370;
.msg-list-item{
    padding: 0 16px;
    &-time{
        display: flex;
        margin: 10px 0;
        height: 72px;
        align-items: center;
        justify-content: flex-start;
        &.color-green{
          background-color: $green;
          span{
          color: #fff;
          }
        }
        &.color-red{
          background-color: $red;
          span{
          color: #fff;
          }
        }
        &-dot{
            margin-left: -24px;
            display: flex;
            align-items: center;
            justify-content: flex-start;
            height: 16px;
            line-height: 16px;
            vertical-align: middle;;
            &.color-green{
              i{
                border-color: $green;
            }
            em{
                background-color: $green;
            }
            b{
                background-color: $green;
            }
            }
            i{
                width: 16px;
                height: 16px;
                background-color: #fff;
                border: 4px solid $red;
                border-radius: 50%;
            }
            em{
                width: 20px;
                height: 2px;
                background-color: $red;
            }
            b{
                width: 12px;
                height: 12px;
                border-radius: 50%;
                background-color: $red;
            }
        }
        &-text{
            font-weight: 500;
            margin-left: 6px;
            font-size: 22px;
            color:#808080;
        }
        &-bkjif{
            margin: 0 26px 0 16px;
            font-size: 32px;
            font-weight: 500;
            color: #333;
        }
        &-bkjrt{
            padding: 6px 6px;
            color:#fff;
            font-weight: 500;
            font-size: 28px;
            border-radius: 8px;
            &.color-red{
                background-color:$red;
            }
            &.color-green{
                background-color:$green;
            }
        }
    }
    &-title{
        line-height: 40px;
        font-size: 28px;
        color:#333
    }
    &-summary{
        margin: 36px 0 30px;
        font-size: 26px;
        line-height: 40px;
        color:#828282;
        &.line-clamp {
        width: 100%;
        max-height: 120px;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        /*! autoprefixer: off */
        -webkit-box-orient: vertical;
      /*! autoprefixer: on */
        overflow: hidden;
        word-break: break-word;
      }
    }
    &-imgwrap{
      img{
        width: 100%;
        height: 100%;
      }
    }
    &-stock{
        padding: 24px 0 10px;
    }
}
</style>
<script>
// import {
//   extractSymbolToParams
//   formatDataByFields,
//   versions
// } from '@/utils/index'
import format from "date-fns/format";
import stockApi from '@/service/stocksApi'
import StockTrend from '@/components/stockTrend/StockTrend'
import { getDate } from 'date-fns';
// import PhotoSwipe from "photoswipe";
// import ImageModalFake from "@/components/ImageModalFake";

export default {
  data () {
    return {
      bkjInfo: this.msg.BkjInfoArr,
      stocksPool: {},
      fields: [],
      rate: 0.0,
      visible: false
    };
  },
  props: {
    msg: {
      type: Object
    },
    topTag: {
      default: ''
    }
  },

  created() {
    this.bkjInfo.length && this.getbkjrate()
    this.stocks && this.getStockRate(this.stocks)
  },

  mounted() {

  },

  methods: {
    getbkjrate() {
      let bkjId = this.bkjInfo[0].Id
      stockApi.getPlatNormalInfo(bkjId).then(
        res => {
          if (res.code === 20000) {
            this.rate = res.data.core_pcp.toFixed(2)
          }
        }
      )
    },
    getStockRate(stocks) {
      let parmas = stocks.reduce(
        (s, i) => {
          return (s += `,${i.symbol}`)
        }, ''
      )
      parmas = parmas.slice(1)
      stockApi.getStocksReal(parmas).then(
        res => {
          this.stocksPool = res.data.snapshot
          this.fields = res.data.snapshot.fields
        }
      )
    },
    colorName (rate) {
      if (rate >= 0) {
        return 'color-red'
      } else {
        return 'color-green'
      }
    },
    // showImage(image) {
    //   this.visible = true
    //   // $('html').addClass('hidden')
    //   let i = this.$refs.image;
    //   var pswpElement = document.querySelectorAll(".pswp")[0];

    //   // build items array
    //   var items = [
    //     {
    //       src: image,
    //       w: i.naturalWidth,
    //       h: i.naturalHeight
    //     }
    //   ];
    //   // define options (if needed)
    //   var options = {
    //     // history & focus options are disabled on CodePen
    //     history: false,
    //     focus: false,
    //     bgOpacity: 0.8,
    //     captionEl: false,
    //     tapToClose: true,
    //     shareEl: false,
    //     fullscreenEl: false,
    //     showAnimationDuration: 0,
    //     hideAnimationDuration: 0
    //   };

    //   var gallery = new PhotoSwipe(
    //     pswpElement,
    //     // eslint-disable-next-line
    //     PhotoSwipeUI_Default,
    //     items,
    //     options
    //   );
    //   gallery.init();
    // },
    hideImageModal() {
      this.visible = false;
      // $("html").removeClass("hidden");
    }
  },

  computed: {
    createdTime() {
      let today = getDate(this.msg.CreatedAt) === getDate(new Date())
      return today ? format(new Date(this.msg.CreatedAt), "HH:mm") : format(new Date(this.msg.CreatedAt), "MM-DD HH:mm")
    },
    stocks() {
      return this.msg.Stocks && this.msg.Stocks.map(
        i => {
          i.name = i.Name
          i.symbol = i.Symbol
          return i
        }
      )
    }
    // cut() {

    // }
    // rate() {
    //   return this.bkjInfo[0].Rate
    // }
  },

  components: {StockTrend},
  watch: {
  },
  directives: {
    // 超出省略号指令 @Parmas :Object {class:[String],height:[Number]}
    cut: {
      inserted: function (el, binding) {
        let height = binding.value.height || 0
        let cutClass = binding.value.class
        let cut = el.offsetHeight > height
        cut && el.classList.add(cutClass)

        el.onclick = () => {
          cut = !cut
          cut ? el.classList.add(cutClass) : el.classList.remove(cutClass)
        }
      }
    }
  }

}
</script>