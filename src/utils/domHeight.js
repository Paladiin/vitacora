
export function getScrollTop () {
  let bodyScrollTop = 0
  let documentScrollTop = 0
  if (document.body) {
    (bodyScrollTop = document.body.scrollTop)
  }
  if (document.documentElement) {
    documentScrollTop = document.documentElement.scrollTop
  }
  return bodyScrollTop - documentScrollTop > 0
    ? bodyScrollTop
    : documentScrollTop
}

// 文档的总高度
export function getScrollHeight () {
  let bodyScrollHeight = 0
  let documentScrollHeight = 0
  if (document.body) {
    bodyScrollHeight = document.body.scrollHeight
  }
  if (document.documentElement) {
    documentScrollHeight = document.documentElement.scrollHeight
  }
  return bodyScrollHeight - documentScrollHeight > 0
    ? bodyScrollHeight
    : documentScrollHeight
}

// 浏览器视口的高度
export function getWindowHeight () {
  let windowHeight = 0
  if (document.compatMode === 'CSS1Compat') {
    windowHeight = document.documentElement.clientHeight
  } else {
    windowHeight = document.body.clientHeight
  }
  return windowHeight
}