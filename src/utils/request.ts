import axios from 'axios';
import { notification } from 'antd';

const axiosInstance = axios.create({
	timeout: 10000,
});

// 过滤掉请求参数为 null | undefined 的属性；去除字符串两端的特殊字符
const filterParams = (params) => {
	const newPrams = {};
	for (const key in params) {
		const paramsValue = params[key];
		if (typeof paramsValue === 'string' && paramsValue !== '') {
			newPrams[key] = paramsValue.trim();
		} else if (paramsValue !== null && typeof paramsValue !== 'undefined') {
			newPrams[key] = paramsValue;
		}
	}
	return newPrams;
};

const errHandler = (description: string = '') => {
	notification.error({
		message: '接口失败',
		description
	});
}

const request = ({ method, url, params = {}, data = {}, restConfig = {} }) => {
	return new Promise((resolve, reject) => {
		const config = {
			method,
			url,
			data: filterParams(data),
			params: filterParams(params),
			...restConfig,
		};
		axiosInstance(config).then(
			(res: any) => {
				// 根据服务端的接口定义判断请求成功的条件
				// 例如接口的状态码为 200 为成功条件
				if (res.data && res.data.code === 200) {
					resolve(res.data);
				} else {
					reject(res.data);
					errHandler(res.message || '服务错误');
				}
			},
			(err) => {
				reject(err);
				errHandler(String(err));
			}
		)
	})
};

export default request;
