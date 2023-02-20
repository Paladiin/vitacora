
export const extractSymbolToParams = stocks => {
  if (stocks && stocks.length > 0) {
    const params = stocks.reduce((sum, current) => {
      return (sum += `,${current.symbol}`)
    }, '')
    return params.slice(1)
  }
}

export const formatDataByFields = (originData, fields) => {
  let newData = []
  Object.keys(originData).forEach(key => {
    if (key !== 'fields') {
      let obj = {}
      obj.code = key.split('.')[0]
      obj.marketId = key.split('.')[1]
      originData[key].forEach((ele, index) => {
        const field = fields[index]
        obj[field] = ele
      })
      newData.push(obj)
    }
  })
  return newData
}

export const setTheme = () => {
  const themeType = localStorage.getItem('__THEME_TYPE__')
  if (Number(themeType)) {
    document.querySelector('#app').setAttribute('class', 'night-theme')
  }
}

export const versions = () => {
  const u = navigator.userAgent
  return {
    isIOS: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/),
    isAndroid: u.indexOf('Android') > -1 || u.indexOf('Adr') > -1,
    isWeiXin: u.indexOf('MicroMessenger') > -1
  }
}