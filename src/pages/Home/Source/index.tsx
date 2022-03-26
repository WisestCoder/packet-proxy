import React, { FC, useCallback, useState, useRef, useEffect, useMemo } from 'react';
import { Divider, Row, Col, Modal, message } from 'antd';
import cloneDeep from 'lodash/cloneDeep';
import isObject from 'lodash/isObject';
import isArray from 'lodash/isArray';
import GroupDetail from '../components/GroupDetail';
import Group from '../components/Group';
import ButtonGroup from '../components/ButtonGroup';
import GroupModal from '../components/GroupModal';
import ImportModal from '../components/ImportModal';
import ExportModal from '../components/ExportModal';
import ItemModal from '../components/ItemModal';

import './index.less';

const Source: FC = () => {
	const [groups, setGroups] = useState([]);
	const [activeGroupKey, setActiveGroupKey] = useState('');
	const [groupModalVisible, setGroupModalVisible] = useState(false);
	const [itemModalVisible, setItemModalVisible] = useState(false);
	const [importModalVisible, setImportModalVisible] = useState(false);
	const [exportModalVisible, setExportModalVisible] = useState(false)
	const groupModalRef = useRef({
		mode: 'add',
		data: {}
	});
	const itemModalRef = useRef({
		mode: 'add',
		data: {}
	});

	const activeGroup = useMemo(() => groups.find(x => x.uniqueKey === activeGroupKey), [groups, activeGroupKey]);
	const tableData = useMemo(() => (activeGroup ? activeGroup.children : []), [activeGroup]);

	const setChromeGroup = (newGroups, fn = () => {}) => {
		chrome.extension.sendMessage({
			type: 'setGroups',
			data: newGroups
		}, function(response) {
			if (response.isSuccess) {
				fn();
				setGroups(response.data);
			} else {
				message.error('添加失败！');
			}
		});
	}

	// 添加组
	const onAddGroup = useCallback(() => {
		setGroupModalVisible(true);
		groupModalRef.current = {
			mode: 'add',
			data: {
				uniqueKey: Math.random().toString().slice(2)
			}
		};
	}, []);

	const onEditGroup = useCallback((item) => {
		setGroupModalVisible(true);
		groupModalRef.current = {
			mode: 'edit',
			data: item
		};
	}, []);

	const onCheckGroup = useCallback((item, checked) => {
		const newGroups = cloneDeep(groups);
		const findIndex = newGroups.findIndex(x => x.uniqueKey === item.uniqueKey);
		newGroups[findIndex].checked = checked;

		setChromeGroup(newGroups);
	}, [groups, setChromeGroup]);

	const onDeleteGroup = useCallback((item) => {
		Modal.confirm({
			title: '温馨提示',
			content: '确认要删除该数据吗？',
			onOk() {
				const newGroups = groups.filter(x => x.uniqueKey !== item.uniqueKey);

				setChromeGroup(newGroups);
			}
		});
	}, [groups, setChromeGroup]);

	// 导入
	const onImport = useCallback(() => {
		// import
		setImportModalVisible(true);
	}, []);

	// 导出
	const onExport = useCallback(() => {
		setExportModalVisible(true);
	}, []);

	// 添加项
	const onAddItem = useCallback(() => {
		setItemModalVisible(true);
		itemModalRef.current = {
			mode: 'add',
			data: {
				uniqueKey: Math.random().toString().slice(2)
			}
		};
	}, []);

	// 编辑项
	const onEditItem = useCallback((record) => {
		setItemModalVisible(true);
		itemModalRef.current = {
			mode: 'edit',
			data: record
		};
	}, []);

	// 选中项
	const onCheckItem = useCallback((record, checked) => {
		const newGroups = cloneDeep(groups);
		const groupIndex = newGroups.findIndex(x => x.uniqueKey === activeGroupKey);
		const tableIndex = newGroups[groupIndex].children.findIndex(x => x.uniqueKey === record.uniqueKey);
		newGroups[groupIndex].children[tableIndex].checked = checked;

		setChromeGroup(newGroups);
	}, [groups, activeGroupKey, setChromeGroup]);

	// 删除项
	const onDeleteItem = useCallback((record) => {
		Modal.confirm({
			title: '温馨提示',
			content: '确认要删除该数据吗？',
			onOk() {
				const newGroups = cloneDeep(groups);
				const groupIndex = newGroups.findIndex(x => x.uniqueKey === activeGroupKey);
				newGroups[groupIndex].children = newGroups[groupIndex].children.filter(x => x.uniqueKey !== record.uniqueKey);
				setChromeGroup(newGroups);
			}
		});
	}, [groups, activeGroupKey, setChromeGroup]);

	useEffect(() => {
		chrome.extension.sendMessage({
			type: 'getGroups'
		}, function(response) {
			if (response.isSuccess) {
				setGroups(response.data);
				if (response.data.length > 0) {
					setActiveGroupKey(response.data[0].uniqueKey);
				}
			}
		});
	}, []);

	return (
		<>
			<ButtonGroup
				buttons={[
					{ children: '新增组', size: 'small', type: 'primary', onClick: onAddGroup },
					{ children: '导入', size: 'small', type: 'primary', onClick: onImport }
				]}
			/>
			<Divider style={{ margin: '12px 0 0 0' }} />
			<Row style={{ height: 'calc(100% - 37px)' }}>
				<Col flex="240px">
					<Group
						value={groups}
						activeKey={activeGroupKey}
						onItemClick={setActiveGroupKey}
						onItemCheck={onCheckGroup}
						onEdit={onEditGroup}
						onDelete={onDeleteGroup}
						onAdd={onAddGroup}
					/>
				</Col>
				<Col flex="1" className="source-right-plane">
					<GroupDetail
						group={activeGroup}
						onAddItem={onAddItem}
						onExport={onExport}
						onCheckItem={onCheckItem}
						onEditItem={onEditItem}
						onDeleteItem={onDeleteItem}
					/>
				</Col>
			</Row>
			<GroupModal
				mode={groupModalRef.current.mode}
				data={groupModalRef.current.data}
				visible={groupModalVisible}
				onOk={(newGroup) => {
					let newGroups = [];
					if (groupModalRef.current.mode === 'add') {
						newGroups = [...groups, newGroup];
						if (newGroups.length === 1) {
							setActiveGroupKey(newGroup.uniqueKey);
						}
					} else {
						newGroups = cloneDeep(groups);
						const findIndex = newGroups.findIndex(x => x.uniqueKey === newGroup.uniqueKey);
						newGroups[findIndex] = newGroup;
					}

					setChromeGroup(newGroups, () => {
						setGroupModalVisible(false);
					});
				}}
				onCancel={() => {
					setGroupModalVisible(false);
				}}
			/>
			<ImportModal
				visible={importModalVisible}
				onOk={(newJson) => {
					let newGroups = cloneDeep(groups);
					const json = JSON.parse(newJson);
					if (isArray(json)) {
						newGroups = [...newGroups, ...json];
					} else if (isObject(json)) {
						newGroups.push(json);
					}

					setChromeGroup(newGroups, () => {
						setImportModalVisible(false);
					});
				}}
				onCancel={() => {
					setImportModalVisible(false);
				}}
			/>
			<ExportModal
				value={activeGroup}
				visible={exportModalVisible}
				onCancel={() => {
					setExportModalVisible(false);
				}}
			/>
			<ItemModal
				mode={itemModalRef.current.mode}
				data={itemModalRef.current.data}
				visible={itemModalVisible}
				onOk={(newItem) => {
					const newGroups = cloneDeep(groups);
					const groupIndex = newGroups.findIndex(x => x.uniqueKey === activeGroupKey);
					if (itemModalRef.current.mode === 'add') {
						if (!(tableData && tableData.length)) {
							newGroups[groupIndex].children = [];
						}
						newGroups[groupIndex].children = [
							...newGroups[groupIndex].children,
							newItem
						];
					} else {
						const tableIndex = newGroups[groupIndex].children.findIndex(x => x.uniqueKey === newItem.uniqueKey);
						newGroups[groupIndex].children[tableIndex] = newItem;
					}

					setChromeGroup(newGroups, () => {
						setItemModalVisible(false);
					});
				}}
				onCancel={() => {
					setItemModalVisible(false);
				}}
			/>
		</>
	);
}

export default Source;
