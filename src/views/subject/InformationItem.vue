<template>
  <div class="information-item">
    <div @click="handleClick">
      <div class="information-item-title">{{ info && info.title }}</div>
      <div v-if="info && info.summary" class="information-item-desc" v-html="info.summary"></div>
    </div>
    <div class="information-item-stocks" v-if="info && info.stocks">
      <stock-trend
        :stocks="info.stocks"
        :stocks-pool="stocksPool"
        :fields="fields">
 