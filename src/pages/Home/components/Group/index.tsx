import React, { FC, useCallback } from 'react';
import { Menu, Dropdown, Modal, Checkbox, Empty, Button } from 'antd';
import { FormOutlined } from '@ant-design/icons';
import './index.less';

const Group: FC<any> = ({
	onEdit,
	onDelete,
	onAdd,
	value,
	activeKey,
	onItemClick,
	onItemCheck
}) => {
	const onClickDelete = useCallback((item) => {
		Modal.confirm({
			title: '温馨提示',
			content: '确认要删除该数据吗？',
			onOk() {
				onDelete(item);
			}
		});
	}, [onDelete]);

	const onOperator = useCallback((e, item) => {
		e.domEvent.preventDefault();
		if (e.key === 'edit') {
			onEdit(item);
		}
		if (e.key === 'delete') {
			onClickDelete(item);
		}
	}, [onEdit, onClickDelete]);

	if (!(value && value.length)) {
		return (
			<Empty
				style={{ paddingTop: '60px', borderRight: '1px solid #f0f0f0', height: '100%' }}
				image={Empty.PRESENTED_IMAGE_DEFAULT}
				imageStyle={{
					height: 60,
				}}
				description={
					<span>
						当前无分组，请先创建
					</span>
				}
			>
				<Button size="small" type="primary" onClick={onAdd}>立即创建</Button>
			</Empty>
		);
	}

	return (
		<Menu
			mode="inline"
			className="group-container"
			onClick={(e) => { onItemClick(e.key); }}
			selectedKeys={[activeKey]}>
			{
				value.map((item) => (
					<Menu.Item key={item.uniqueKey} className="group-container-item">
						<Checkbox
							checked={item.checked}
							onChange={(e) => {
								e.stopPropagation();
								onItemCheck(item, e.target.checked);
							}}
						/>
						<span className="group-container-item-label" title={item.name}>{item.name}</span>
						<Dropdown
							overlay={(
								<Menu onClick={(e) => { onOperator(e, item);}}>
									<Menu.Item key="edit">编辑</Menu.Item>
									<Menu.Item key="delete">删除</Menu.Item>
								</Menu>
							)}
						><FormOutlined className="group-container-item-operator" /></Dropdown>
					</Menu.Item>
				))
			}
		</Menu>
	);
}

export default Group;
