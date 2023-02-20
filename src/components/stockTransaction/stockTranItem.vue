<!-- 个股异动item -->
<template>
 <div class="stocktran-item">
     <div class="stocktran-item-info">
      <div class="stocktran-item-time">
        <span class="stocktran-item-time-dot">
            <i :class="colorName(rate)"></i>
            <!-- <em></em> -->
            <!-- <b></b> -->
        </span>
        <span class="stocktran-item-time-text">{{createdTime}}</span>
        <span  class="stocktran-item-time-bkjif">{{stocks[1]}}</span>
        <span  class="stocktran-item-time-bkjrt" :class="colorName(rate)">{{(rate>0 ? `+${rate}` : rate)}}%</span>
    </div>
    <div class="stocktran-item-status" :class="colorName(rate)">
            {{status}}
    </div>
     </div>
    <ul class="stocktran-item-tags">
        <li v-for="item in tagList" :key="item.plate_id">{{item}}</li>
    </ul>
 </div>
</template>
<style lang='scss' scoped>
$red:#e22e42;
$green:#4da370;
.stocktran-item{
    padding: 0 16px 0 90px;
    &-info{
        display: flex;
        align-items: center;
        justify-content: space-between;
    }
    &-status{
        font-size: 28px;
        font-weight: 500;
         &.color-red{
                color:$red;
            }
            &.color-green{
                color:$green;
            }

    }
    &-time{
        display: flex;
        height: 92px;
        align-items: center;
        justify-content: flex-start;
        &-dot{
            margin-left: -98px;
            display: flex;
            align-items: center;
            justify-content: flex-start;
            height: 16px;
            line-height: 16px;
            vertical-align: middle;;
            i{
                width: 16px;
                height: 16px;
                background-color: #fff;
                border: 4px solid $red;
                border-radius: 50%;
                &.color-red{
                border-color:$red;
                }
                &.color-green{
                    border-color:$green;
                }
            }
        }
        &-text{
            font-weight: 500;
            margin-left: 6px;
            font-size: 22px;
            color:#808080;
        }
        &-bkjif{
            margin: 0 26px 0 14px;
            font-size: 32px;
            font-weight: 500;
            color: #333;
        }
        &-bkjrt{
            line-height: 32px;
            font-weight: 500;
            font-size: 28px;
            &.color-red{
                color:$red;
            }
            &.color-green{
                color:$green;
            }
        }
    }
    &-tags{
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: flex-start;
        li{
            padding:0 12px;
            line-height: 32px;
            margin-right: 16px;
            margin-bottom: 24px;
            font-size: 24px;
            color: #808080;
            border: 1px solid #efefef;
        }
    }
}
</style>
<script>
// import format from "date-fns/format";

export default {
  data () {
    return {
    };
  },
  props: {
    stocks: {
      type: Array
    }
  },

  created() {

  },

  mounted() {},

  methods: {
    colorName (rate) {
      if (rate > 0) {
        return 'color-red'
      } else {
        return 'color-green'
      }
    }
  },

  computed: {
    createdTime() {
      // 时间处理 暂用
      let time = this.stocks[6]
      return time.slice(10, 16)
    },
    rate() {
      return this.stocks[3].pcp && this.stocks[3].pcp.toFixed(2)
    },
    status() {
      return this.stocks[2]
    },
    tagList() {
      return this.stocks[3].plates.map(
        i => i.plate_name
      )
    }
  },

  components: {}

}
</script>
