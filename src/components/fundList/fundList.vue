
<template>
    <div class="fund-list">
        <div class="fund-list-ul" v-for="fund in funds" :key="fund.id">
            <ul  class="fund-list-item">
                <li class="fund-list-item-fundname">
                    <dl>
                        <dt>{{fund.fund_name}}</dt>
                        <dd>{{fund.fund_code}}</dd>
                    </dl>
                    <p>净值增长</p>
                </li>
                <li class="fund-list-item-oneyear">
                    <p>1年 <span class="rate" :class="color(fund.one_year_net_value)">{{formatRate(fund.one_year_net_value)}}</span></p>
                </li>
                <li class="fund-list-item-related">
                    <dl>
                        <dt>相关度</dt>
                        <dd>
                            <span v-for="index in fund.star + 1" :key="index">★</span>
                        </dd>
                    </dl>
                    <p>3年 <span class="rate" :class="color(fund.three_year_net_value)"> {{formatRate(fund.three_year_net_value)}}</span></p>
                </li>
                <li class="fund-list-item-proportion">
                    <dl>
                        <dt>投资占比</dt>
                        <dd>{{formatRate(fund.ratio_in_nv)}}</dd>
                    </dl>
                    <p>5年 <span class="rate" :class="color(fund.five_year_net_value)"> {{formatRate(fund.five_year_net_value)}}</span></p>
                </li>
            </ul>
        </div>
    </div>
</template>

<script>
export default {
  props: ["funds"],
  methods: {
    color(rate) {
      if (!rate) return "";
      return rate > 0 ? "red" : "green";
    },
    formatRate(num) {
      if (!num) return "- -";
      return num.toFixed(2) < 0 ? num.toFixed(2) + "%" : `+${num.toFixed(2)}%`;
    }
  },
  filters: {
    formateNumber(num) {
      return num.toFixed(2);
    }
  }
};
</script>

<style  lang="scss" scoped>
.fund-list {
  &-ul {
    border-bottom: 1px solid #efefef;
  }
  &-item {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    padding: 24px 20px;
    box-sizing: border-box;
    height: 190px;
    li{
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
        height: 100%;
    }
    .rate {
      margin-left: 16px;
    }
    .red {
      color: #f34a55;
    }
    .green {
      color: #18a66b;
    }
    dd {
      margin-top: 16px;
    }
    dt {
      font-size: 24px;
      line-height: 30px;
    }
    p {
      height: 15px;
      font-size: 26px;
      line-height: 15px;
      color: #666666;
      text-align: center;
    }
    &-fundname {
      align-items: flex-start !important;
      dl {
        text-align: left;
      }
      dt {
        width: 360px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: 30px;
        color: #333333;
        line-height: 30px;
      }
      dd {
        font-size: 24px;
        color: #666666;
      }
      p {
        text-align: left;
      }
    }
    &-oneyear {
      justify-content: flex-end !important;
      span {
        margin-left: 16px;
      }
      span.red {
        color: #f34a55;
      }
      span.green {
        color: #18a66b;
      }
    }
    &-related {
      dd {
        color: #f34a55;
        font-size: 24px;
        margin-top: 20px;
      }
    }
    &-proportion {
      dd {
        font-size: 30px;
        color: #353a47;
      }
    }
  }
  li {
    width: 25%;
    text-align: center;
  }
}
</style>