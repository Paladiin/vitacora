<template>
  <div class="info-panel">
    <div class="info-panel-header">
      <h2>{{ title }}</h2>
      <span v-show="more" @click="handleClick">更多<i class="iconfont icon-more1"></i></span>
    </div>
    <slot/>
  </div>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      required: true
    },
    more: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    handleClick () {
      this.$emit('moreClick')
    }
  }
}
</script>

<style lang="scss">
.info-panel {
  &-header {
    display: flex;
    justify-content: space-between;
    padding: 22px 20px;
    border-bottom: 1px solid #ECECEC;
    & > h2 {
      font-size: 30px;
      font-weight: bold;
      font-family: PingFangSC-Medium;
      color: #F34A55;
    }
    & > span {
      display: flex;
      align-items: center;
      font-family: PingFangSC-Regular;
      font-size: 24px;
      color: #999999;
    }
  }
}
</style>
