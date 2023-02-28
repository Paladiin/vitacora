<!-- title上证信息 -->
<template>
 <div class="tran-title">
     <section class="tran-title-point" :class="ssdata[4].toFixed(2)>0?'red':'green'">
         <h2>{{ssdata[3].toFixed(2)}}</h2>
         <p><span>{{ssdata[4].toFixed(2)>0? '+' + ssdata[4].toFixed(2):ssdata[4].toFixed(2)}}</span> <span>{{ssdata[5].toFixed(2)>0? '+' + ssdata[5].toFixed(2):ssdata[5].toFixed(2)}}%</span></p>
     </section>
     <section class="tran-title-info">
         <span class="red"><i>开</i>{{ssdata[7].toFixed(2)}}</span>
         <span class="red"><i>高</i>{{ssdata[8].toFixed(2)}}</span>
         <span class="green"><i>低</i>{{ssdata[9].toFixed(2)}}</span>
         <span class="white"><i>振</i>{{ssdata[10].toFixed(2) + '%'}}</span>
         <span class="white"><i>额</i>{{(ssdata[17]/100000000) > 1000 ? (ssdata[17]/100000000).toFixed(1):(ssdata[17]/100000000).toFixed(2)}}亿</span>
         <span class="white"><i>量比</i>{{ssdata[20].toFixed(2) + '%'}}</span>
     </section>
 </div>
</template>
<style lang='scss' scoped>
.tran-title{
    height: 128px;
    padding: 20px;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    background-color: #363a46;
    .tran-title-point{
        width: 203px;
        margin-right: 30px;
            line-height: 44px;
        h2{
            font-size: 44px;
            font-weight: 600;
        }
        color: #f3564d;
        p{
            font-size: 28px;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        &.green{
            color:#1cbf7b;
        }
        &.red{color:#f3564d;}
    }
    .tran-title-info{
        width: 490px;
        line-height: 44px;
        font-size: 26px;
        flex-wrap: wra