let lastRequestId;

// 获取localStorage
function getLocalStorage(key, defaultValue = []) {
	if (key) {
		let result;
		try {
			result = JSON.parse(localStorage[key])
		} catch (error) {
			result = defaultValue;
		}

		return result;
	}

	return localStorage;
}

// 设置localStorage
function setLocalStorage(key, value){
	localStorage[key] = JSON.stringify(value);
}

// 重定向
function redirectToMatchingRule(details) {
	const groups = getLocalStorage('groups');
	const onUseGroups = groups.filter(item => item.checked);
	const flatternArr = [];
	onUseGroups.forEach((item) => {
		if (item.checked && item.children && item.children.length) {
			item.children.forEach((x) => {
				flatternArr.push(x);
			});
		}
	});
	for (let i = 0; i < flatternArr.length; i++) {
		const rule = flatternArr[i];
		if (rule.checked && details.url.indexOf(rule.from) > -1 && details.requestId !== lastRequestId ) {
			lastRequestId = details.requestId;
			return {
				redirectUrl: details.url.replace(rule.from, rule.to)
			};
		}
	}
}

// 监听请求发送前，做重定向
chrome.webRequest.onBeforeRequest.addListener(function(details) {
	return redirectToMatchingRule(details);
}, {
	urls: ["<all_urls>"]
}, ["blocking"]);

// 监听请求，修改请求Headers
chrome.webRequest.onBeforeSendHeaders.addListener(function(details) {
	if (details.type !== "xmlhttprequest") { // 非xhr请求不处理
		return;
	}

	const headers = getLocalStorage('headers');
	const onUseHeaders = headers.filter(item => item.checked);
	if (!details.requestHeaders) {
		details.requestHeaders = [];
	}
	onUseHeaders.forEach(({ name, value }) => {
		details.requestHeaders.push({
			name,
			value
		})
	});

	return { requestHeaders: details.requestHeaders };
}, {
	urls: ["<all_urls>"]
}, ["blocking", "requestHeaders"]);

// 监听页面载入，设置cookie
chrome.runtime.onMessage.addListener(function (request, sender) {
	const cookies = getLocalStorage('cookies');
	const onUseCookies = cookies.filter(item => item.checked);

	onUseCookies.forEach((item) => {
		const targetDomin = item.to.replace(/^(?:https?:\/\/)?/i, '').split('/')[0];
		const targetReg = new RegExp('^https?://' + targetDomin + '/');
		const currentUrl = sender && sender.tab ? sender.tab.url : null;

		if (currentUrl && targetReg.test(currentUrl)) {
			chrome.cookies.getAll({
				url: item.from
			}, (cookieL = []) => {
				cookieL.forEach(({ name, value }) => {
					chrome.cookies.set({
						url: currentUrl,
						name: name,
						value: value,
						path: '/'
					})
				})
			});
		}
	});
});

// 监听扩展程序的页面发送的请求体
chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
	switch(request.type) {
		case 'getGroups':
			sendResponse({
				data: getLocalStorage('groups'),
				isSuccess: true
			});
			break;
		case 'setGroups':
			setLocalStorage('groups', request.data)
			sendResponse({
				data: getLocalStorage('groups'),
				isSuccess: true
			});
			break;
		case 'getCookies':
			sendResponse({
				data: getLocalStorage('cookies'),
				isSuccess: true
			});
			break;
		case 'setCookies':
			setLocalStorage('cookies', request.data)
			sendResponse({
				data: getLocalStorage('cookies'),
				isSuccess: true
			});
			break;
		case 'getHeaders':
			sendResponse({
				data: getLocalStorage('headers'),
				isSuccess: true
			});
			break;
		case 'setHeaders':
			setLocalStorage('headers', request.data)
			sendResponse({
				data: getLocalStorage('headers'),
				isSuccess: true
			});
			break;
		default:
			return;
	}
});
