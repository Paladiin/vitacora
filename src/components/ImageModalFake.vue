<template>
  <div :class="{visible: visible, modal: true, imgHeightGtWindow: imgHeightGtWindow}" @click="hide">
    <img :src="src" class="modal-image">
  </div>
</template>

<script>
export default {
  props: ['src', 'visible'],
  data () {
    return {
      imgHeightGtWindow: false
    }
  },
  methods: {
    hide (e) {
      this.$emit('hide')
    }
  },
  mounted () {
    const _this = this
    const img = new Image()
    img.onload = function () {
      if (this.height > window.screen.availHeight) {
        _this.imgHeightGtWindow = true
      }
    }
    img.src = this.src
  }
}
</script>

<style lang="scss" scoped>
.modal {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 30px;
  background: rgba(0, 0, 0, 0.7);
  z-index: 10;
  text-align: center;
  overflow: auto;
  img {
    // min-width: 50%;
    max-width: 100%;
  }
}

.visible {
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  &.imgHeightGtWindow {
    display: block;
  }
}
</style>
