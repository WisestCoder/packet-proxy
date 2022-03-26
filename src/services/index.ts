import request from '../utils/request';

// TODO: 请求接口格式
export const getTestService = (params) =>
	request({
		url: `/api/v1/test`,
		params,
		method: 'get',
	});
