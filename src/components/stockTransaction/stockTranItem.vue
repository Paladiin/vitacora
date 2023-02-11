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
    <div c