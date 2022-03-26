import React, { FC } from 'react';
import ReactDOM from 'react-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/es/locale/zh_CN';
import Home from '@/pages/Home';

import 'antd/lib/form/style/css';
import '@/styles/global.less';

const App: FC = () => {
	return (
		<ConfigProvider locale={zhCN}>
			<Home />
		</ConfigProvider>
	);
};

ReactDOM.render(<App />, document.getElementById('app'));
