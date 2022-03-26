import React, { FC, useMemo } from 'react';
import { Table, Space, Divider, Checkbox, Empty } from 'antd';
import ButtonGroup from '../ButtonGroup';

const GroupDetail: FC<any> = ({
	group,
	onAddItem,
	onExport,
	onCheckItem,
	onEditItem,
	onDeleteItem
}) => {
	const tableData = useMemo(() => (group ? group.children : []), [group]);

	if (!group) {
		return (
			<Empty
				style={{ marginTop: '60px' }}
				image={Empty.PRESENTED_IMAGE_DEFAULT}
				description="请先选中某个分组"
			/>
		);
	}

	return (
		<>
			<h3 className="source-right-plane-header">组名：{group ? group.name : ''}</h3>
			<ButtonGroup
				className="source-table-header"
				buttons={[
					{ children: '新增项', size: 'small', type: 'primary', onClick: onAddItem },
					{ children: '导出', size: 'small', type: 'primary', onClick: onExport }
				]}
			/>
			<Table
				style={{ fontSize: '12px' }}
				rowKey="uniqueKey"
				columns={[
					{
						title: '',
						width: 60,
						render: (_, record: any) => <Checkbox checked={record.checked} onChange={(e) => { onCheckItem(record, e.target.checked); }} />
					},
					{ title: '源地址', key: 'from', dataIndex: 'from'  },
					{ title: '代理地址', key: 'to', dataIndex: 'to' },
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
				dataSource={tableData || []}
				size="small"
				scroll={{ y: 406 }}
			/>
		</>
	);
}

export default GroupDetail;
