import React, { FC, useCallback, useState, useEffect, useRef } from 'react';
import { Table, Space, Divider, Checkbox, message, Modal } from 'antd';
import cloneDeep from 'lodash/cloneDeep';
import isObject from 'lodash/isObject';
import isArray from 'lodash/isArray';
import ButtonGroup from '../components/ButtonGroup';
import ImportModal from '../components/ImportModal';
import ExportModal from '../components/ExportModal';
import ItemModal from '../components/ItemHeaderModal';

import './index.less';

interface CookieProp {
	uniqueKey: React.Key;
	name: string;
	value: string;
	checked?: boolean;
};

const GroupDetail: FC = () => {
	const [headers, setHeaders] = useState<Array<CookieProp>>([]);
	const [cookieModalVisible, setCookieModalVisible] = useState(false);
	const [importModalVisible, setImportModalVisible] = useState(false);
	const [exportModalVisible, setExportModalVisible] = useState(false)
	const cookieModalRef = useRef({
		mode: 'add',
		data: {}
	});

	const setChromeCookie = (newHeaders, fn = () => {}) => {
		chrome.extension.sendMessage({
			type: 'setHeaders',
			data: newHeaders
		}, function(response) {
			if (response.isSuccess) {
				fn();
				setHeaders(response.data);
			} else {
				message.error('添加失败！');
			}
		});
	}

	const onAddItem = useCallback(() => {
		setCookieModalVisible(true);
		cookieModalRef.current = {
			mode: 'add',
			data: {
				uniqueKey: Math.random().toString().slice(2)
			}
		};
	}, []);

	// 导入
	const onImport = useCallback(() => {
		setImportModalVisible(true);
	}, []);

	const onExport = useCallback(() => {
		setExportModalVisible(true);
	}, []);

	const onCheckItem = useCallback((record, checked) => {
		const newHeaders = cloneDeep(headers);
		const groupIndex = newHeaders.findIndex(x => x.uniqueKey === record.uniqueKey);
		newHeaders[groupIndex].checked = checked;

		setChromeCookie(newHeaders);
	}, [headers, setChromeCookie]);

	const onEditItem = useCallback((record) => {
		setCookieModalVisible(true);
		cookieModalRef.current = {
			mode: 'edit',
			data: record
		};
	}, []);

	const onDeleteItem = useCallback((item) => {
		Modal.confirm({
			title: '温馨提示',
			content: '确认要删除该数据吗？',
			onOk() {
				const newGroups = headers.filter((x: any) => x.uniqueKey !== item.uniqueKey);

				setChromeCookie(newGroups);
			}
		});
	}, [headers, setChromeCookie]);

	useEffect(() => {
		chrome.extension.sendMessage({
			type: 'getHeaders'
		}, function(response) {
			if (response.isSuccess) {
				setHeaders(response.data);
			}
		});
	}, []);


	return (
		<>
			<ButtonGroup
				buttons={[
					{ children: '新增项', size: 'small', type: 'primary', onClick: onAddItem },
					{ children: '导入', size: 'small', type: 'primary', onClick: onImport },
					{ children: '导出', size: 'small', type: 'primary', onClick: onExport }
				]}
			/>
			<Table
				className="header-table-container"
				style={{ fontSize: '12px' }}
				rowKey="uniqueKey"
				columns={[
					{
						title: '',
						width: 60,
						render: (_, record: any) => <Checkbox checked={record.checked} onChange={(e) => { onCheckItem(record, e.target.checked); }} />
					},
					{ title: 'name', key: 'name', dataIndex: 'name'  },
					{ title: 'value', key: 'value', dataIndex: 'value' },
					{
						title: '操作',
						width: 120,
						key: 'Action',
						render(_, record) {
							return (
								<Space split={<Divider type="vertical" />}>
									<a onClick={() => { onEditItem(record); }}>编辑</a>
									<a onClick={() => { onDeleteItem(record); }}>删除</a>
								</Space>
							);
						}
					}
				]}
				dataSource={headers || []}
				size="small"
				scroll={{ y: 406 }}
			/>
			<ImportModal
				visible={importModalVisible}
				onOk={(newJson) => {
					let newHeaders = cloneDeep(headers);
					const json = JSON.parse(newJson);
					if (isArray(json)) {
						newHeaders = [...newHeaders, ...json];
					} else if (isObject(json)) {
						// @ts-ignore
						newHeaders.push(json);
					}

					setChromeCookie(newHeaders, () => {
						setImportModalVisible(false);
					});
				}}
				onCancel={() => {
					setImportModalVisible(false);
				}}
			/>
			<ExportModal
				value={headers}
				visible={exportModalVisible}
				onCancel={() => {
					setExportModalVisible(false);
				}}
			/>
			<ItemModal
				mode={cookieModalRef.current.mode}
				data={cookieModalRef.current.data}
				visible={cookieModalVisible}
				onOk={(newItem) => {
					let newHeaders = cloneDeep(headers);
					if (cookieModalRef.current.mode === 'add') {
						newHeaders = [
							...newHeaders,
							newItem
						];
					} else {
						const findIndex = newHeaders.findIndex(x => x.uniqueKey === newItem.uniqueKey);
						newHeaders[findIndex] = newItem;
					}

					setChromeCookie(newHeaders, () => {
						setCookieModalVisible(false);
					});
				}}
				onCancel={() => {
					setCookieModalVisible(false);
				}}
			/>
		</>
	);
}

export default GroupDetail;
