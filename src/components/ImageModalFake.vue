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
  