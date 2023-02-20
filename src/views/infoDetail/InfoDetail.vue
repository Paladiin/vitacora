<template>
  <div class="info-detail" ref="infoDetail">
    <h1>{{ msgDetail.title }}</h1>
    <div class="info-detail-label" v-if="msgDetail && msgDetail.created_at">
      <span>{{ Number(msgDetail.created_at) * 1000 | formatTime}}</span>
      <span>选股宝</span>
    </div>
    <div class="info-detail-stocks">
      <stock-trend
        :stocks="stocks"
        :stocks-pool="stocksPool"
  