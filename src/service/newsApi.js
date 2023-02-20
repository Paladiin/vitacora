
import axios from 'axios'

// const baseURL = process.env.BASE_URL

/**
   * 获取大盘异动
   * @param {
   *  headMark:Number
   *  TailMark:Number
   *  msgIdMark:Number
   * }
   */
export const getTransactionList = (params = {}) => {
  let defaultParams = {limit: 30, subjids: 35}
  params = Object.assign(params, defaultParams)
  return axios.get(
    `https://api.xuangubao.cn/api/pc/msgs`, {params}
  ).then(res => Promise.resolve(res.data))
}
/**
   * 获取个股异动
   */
export const getStockTransaction = (params = {}) => {
  let defaultParams = {count: 20, types: '1,2,3,4,5,6,7,8,9,10,11,12'}
  params = Object.assign(params, defaultParams)
  return axios.get(
    `https://wows-api.wallstreetcn.com/v3/fit/event/list`, {params}
  ).then(res => Promise.resolve(res.data))
}