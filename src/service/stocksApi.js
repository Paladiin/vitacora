
import axios from 'axios'

const baseURL = process.env.BASE_URL
/**
   * 获取k线1日
   */
export const getSSKlineDay = () => {
  return axios.get(
    `https://mdc.wallstreetcn.com/kline?candle_period=6&data_count=256&fields=turnover_ratio,min_time,open_px,close_px,high_px,low_px,business_amount,business_balance,ma5,ma10,ma20,ma60&prod_code=000001.SS&adjust_price_type=forward`
  ).then(res => Promise.resolve(res.data))
}
/**
   * 获取周k线
   */
export const getSSKlineWeek = () => {
  return axios.get(
    `https://mdc.wallstreetcn.com/kline?candle_period=7&data_count=256&fields=turnover_ratio,min_time,open_px,close_px,high_px,low_px,business_amount,business_balance,ma5,ma10,ma20,ma60&prod_code=000001.SS&adjust_price_type=forward`
  ).then(res => Promise.resolve(res.data))
}
/**
   * 获取月k线
   */
export const getSSKlineMonth = () => {
  return axios.get(
    `https://mdc.wallstreetcn.com/kline?candle_period=8&data_count=256&fields=turnover_ratio,min_time,open_px,close_px,high_px,low_px,business_amount,business_balance,ma5,ma10,ma20,ma60&prod_code=000001.SS&adjust_price_type=forward`
  ).then(res => Promise.resolve(res.data))
}
/**
   * 获取5fen线
   */
export const getSSKline5Min = () => {
  return axios.get(
    `https://mdc.wallstreetcn.com/kline?candle_period=2&data_count=256&fields=turnover_ratio,min_time,open_px,close_px,high_px,low_px,business_amount,business_balance,ma5,ma10,ma20,ma60&prod_code=000001.SS&adjust_price_type=forward`
  ).then(res => Promise.resolve(res.data))
}
/**
   * 获取15fen线
   */
export const getSSKline15Min = () => {
  return axios.get(
    `https://mdc.wallstreetcn.com/kline?candle_period=3&data_count=256&fields=turnover_ratio,min_time,open_px,close_px,high_px,low_px,business_amount,business_balance,ma5,ma10,ma20,ma60&prod_code=000001.SS&adjust_price_type=forward`
  ).then(res => Promise.resolve(res.data))
}
/**
   * 获取30fen线
   */
export const getSSKline30Min = () => {
  return axios.get(
    `https://mdc.wallstreetcn.com/kline?candle_period=4&data_count=256&fields=turnover_ratio,min_time,open_px,close_px,high_px,low_px,business_amount,business_balance,ma5,ma10,ma20,ma60&prod_code=000001.SS&adjust_price_type=forward`
  ).then(res => Promise.resolve(res.data))
}
/**
   * 获取60fen线
   */
export const getSSKline60Min = () => {
  return axios.get(
    `https://mdc.wallstreetcn.com/kline?candle_period=5&data_count=256&fields=turnover_ratio,min_time,open_px,close_px,high_px,low_px,business_amount,business_balance,ma5,ma10,ma20,ma60&prod_code=000001.SS&adjust_price_type=forward`
  ).then(res => Promise.resolve(res.data))
}
/**
   * 获取A股分时
   */
export const getSSMin = () => {
  return axios.get(
    `https://mdc.wallstreetcn.com/trend?fields=min_time,last_px,avg_px,business_amount,business_balance&prod_code=000001.SS`
  ).then(res => Promise.resolve(res.data))
}
/**
   * 获取A股今日信息
   */
export const getSSToday = () => {
  return axios.get(
    `https://wows-api.wallstreetcn.com/real?fields=prod_name,trade_status,update_time,last_px,px_change,px_change_rate,preclose_px,open_px,high_px,low_px,amplitude,turnover_ratio,pe_rate,dyn_pb_rate,market_value,circulation_value,business_amount,business_balance,hq_type_code,securities_type,volume_ratio,circulation_amount,total_shares,bps&en_prod_code=000001.SS`
  ).then(res => Promise.resolve(res.data))
}
export default {
  /**
   * 获取板块及龙头
   */
  getLongtou: bkjId => {
    return axios.get(
      `https://baoer-api-prod.xuangubao.cn/api/v2/plate/${bkjId}/longtou`
    ).then(res => Promise.resolve(res.data))
  },
  /**
   * 获取板块股票
   */
  getBanKuaiStocksPool: bkjId => {
    return axios.get(
      `https://baoer-api-prod.xuangubao.cn/api/v2/plate/${bkjId}/stocks`
    ).then(res => Promise.resolve(res.data))
  },
  // 获取基金池
  getFundList: (id) => {
    return axios.get(
      `https://wows-api-sit.wallstreetcn.com/v3/aioria/sset/funds?id=${id}&minstar=1`
    ).then(
      res => Promise.resolve(res.data)
    )
  },
  /**
   * 返回实时股价
   */
  getStocksReal: stocks => {
    return axios.get(
      `https://wows-api.wallstreetcn.com/real?fields=prod_name,px_change,last_px,px_change_rate,trade_status,circulation_value,pe_rate,market_value,turnover_ratio&en_prod_code=${stocks}`
    ).then(res => Promise.resolve(res.data))
  },
  /**
   * 返回今日机会
   */
  getTodayChance: () => {
    return axios.get(
      `${baseURL}/showdemo/jinrijihui`
    ).then(res => Promise.resolve(res.data))
  },

  /**
   * 返回当天资金流向
   */
  getFundFlow: stocks => {
    return axios.get(
      `https://wows-api.wallstreetcn.com/v3/gildata/stock/live/fund/flow/days?codes=${stocks}&day_count=1`
    ).then(res => Promise.resolve(res.data))
  },

  /**
   * 获取板块涨跌幅
   */
  getPlatNormalInfo: id => {
    return axios.get(
      `https://wows-api.wallstreetcn.com/v3/aioria/plates/detail?id=${id}`
    ).then(res => Promise.resolve(res.data))
  },

  /**
   * 返回主题详情
   */
  getSubjectInfo: (id, flag = false) => {
    return axios.get(
      `${baseURL}/showdemo/subjects/${id}?nomsg=${flag}`
    ).then(res => Promise.resolve(res.data))
  },

  /**
   * 资讯详情
   */
  getMsgDetail: id => {
    return axios.get(
      `${baseURL}/showdemo/messages/${id}`
    ).then(res => Promise.resolve(res.data))
  },

  /**
   * 加载更多资讯
   */
  getMoreMsgs: (bkjId, page, limit) => {
    return axios.get(
      `${baseURL}/showdemo/subjects/${bkjId}/messages?page=${page}&limit=${limit}`
    ).then(res => Promise.resolve(res.data))
  }
}