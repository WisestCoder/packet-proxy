let lastRequestId

// 获取localStorage
function getLocalStorage(key, defaultValue) {
  if (key) {
    let result
    try {
      result = JSON.parse(localStorage[key])
    } catch (error) {
      result = defaultValue
    }

    return result
  }

  return localStorage
}

// 设置localStorage
function setLocalStorage(key, value) {
  localStorage[key] = JSON.stringify(value)
}

function getChromeVersion() {
  const pieces = navigator.userAgent.match(/Chrom(?:e|ium)\/([0-9]+)\.([0-9]+)\.([0-9]+)\.([0-9]+)/)
  if (pieces == null || pieces.length !== 5) {
    return {}
  }
  const version = pieces.map((piece) => parseInt(piece, 10))
  return {
    major: version[1],
    minor: version[2],
    build: version[3],
    patch: version[4],
  }
}

function getRequiresExtraRequestHeaders() {
  let requiresExtraRequestHeaders = false
  if (getChromeVersion().major >= 72) {
    requiresExtraRequestHeaders = true
  }

  return requiresExtraRequestHeaders
}

// 监听请求发送前，做重定向
chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    const groups = getLocalStorage('groups', [])
    const onUseGroups = groups.filter((item) => item.checked)
    const flatternArr = []
    onUseGroups.forEach((item) => {
      if (item.checked && item.children && item.children.length) {
        item.children.forEach((x) => {
          flatternArr.push(x)
        })
      }
    })
    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    for (let i = 0; i < flatternArr.length; i += 1) {
      const rule = flatternArr[i]
      if (rule.checked && details.url.indexOf(rule.from) > -1 && details.requestId !== lastRequestId) {
        lastRequestId = details.requestId
        return {
          redirectUrl: details.url.replace(rule.from, rule.to),
        }
      }
    }
  },
  {
    urls: ['<all_urls>'],
  },
  ['blocking'],
)

// 监听请求，修改请求Headers
chrome.webRequest.onBeforeSendHeaders.addListener(
  (details) => {
    const headers = getLocalStorage('headers', [])
    const onUseHeaders = headers.filter((item) => item.checked)
    const requestHeaders = details.requestHeaders || []
    onUseHeaders.forEach(({ name, value }) => {
      requestHeaders.push({
        name,
        value,
      })
    })

    return { requestHeaders }
  },
  {
    urls: ['<all_urls>'],
  },
  getRequiresExtraRequestHeaders()
    ? ['requestHeaders', 'blocking', 'extraHeaders']
    : ['requestHeaders', 'blocking'],
)

// 监听页面载入，设置cookie
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    const cookies = getLocalStorage('cookies', [])
    const onUseCookies = cookies.filter((item) => item.checked)

    onUseCookies.forEach((item) => {
      const targetDomin = item.to.replace(/^(?:https?:\/\/)?/i, '').split('/')[0]
      const targetReg = new RegExp(`^https?://${targetDomin}/`)
      const currentUrl = tab.url || null

      if (currentUrl && targetReg.test(currentUrl)) {
        chrome.cookies.getAll(
          {
            url: item.from,
          },
          (cookieL = []) => {
            cookieL.forEach(({ name, value }) => {
              chrome.cookies.set({
                url: currentUrl,
                name,
                value,
                path: '/',
              })
            })
          },
        )
      }
    })
  }
})

// 监听扩展程序的页面发送的请求体
chrome.extension.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.type) {
    case 'getGroups':
      sendResponse({
        data: getLocalStorage('groups', []),
        isSuccess: true,
      })
      break
    case 'setGroups':
      setLocalStorage('groups', request.data)
      sendResponse({
        data: getLocalStorage('groups', []),
        isSuccess: true,
      })
      break
    case 'getCookies':
      sendResponse({
        data: getLocalStorage('cookies', []),
        isSuccess: true,
      })
      break
    case 'setCookies':
      setLocalStorage('cookies', request.data)
      sendResponse({
        data: getLocalStorage('cookies', []),
        isSuccess: true,
      })
      break
    case 'getHeaders':
      sendResponse({
        data: getLocalStorage('headers', []),
        isSuccess: true,
      })
      break
    case 'setHeaders':
      setLocalStorage('headers', request.data)
      sendResponse({
        data: getLocalStorage('headers', []),
        isSuccess: true,
      })
      break
    case 'getCode':
      sendResponse({
        data: getLocalStorage('code', ''),
        isSuccess: true,
      })
      break
    case 'setCode':
      setLocalStorage('code', request.data)
      execCoder(request.data)
      sendResponse({
        data: getLocalStorage('code', ''),
        isSuccess: true,
      })
      break
    default:
      sendResponse({
        isSuccess: false,
        error: `Unknow request type: ${request.type}`,
      })
  }
})

// 执行coder
function execCoder(code = getLocalStorage('code', '')) {
  try {
    code && eval(code)
  } catch (error) {
    Promise.reject(error)
  }
}

execCoder()
