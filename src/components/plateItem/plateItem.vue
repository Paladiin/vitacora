<template>
<div >
    <div class="plate-item" @click="_redirect">
        <dl>
            <dt>
                <div class="title">
                    <span :class="index>2?'gray':''">{{index + 1}}</span>
                    <h3>{{info.title}}</h3>
                </di