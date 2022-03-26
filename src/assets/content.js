/**
 * 一定要先发送一条消息（随便啥消息），这样在background中才能监听得到当前页面的url
 */
chrome.runtime.sendMessage({ greeting: "hello, world" }, function (response) {});
