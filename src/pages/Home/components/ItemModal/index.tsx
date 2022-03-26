import React, { useCallback, useState, useEffect } from 'react';
import { Modal } from 'antd';
import { SchemaForm, createFormActions } from '@formily/antd';
import BaseInput from '../BaseInput';

const actions = createFormActions();

const ItemModal = ({
	visible,
	onOk,
	onCancel,
	mode,
	data,
}) => {
	const [formValue, setFormValue] = useState({});

	const onModalOk = useCallback(() => {
		actions.validate()
			.then(() => {
				onOk(formValue);
			});
	}, [onOk, formValue]);

	useEffect(() => {
		visible && setFormValue(data);
	}, [visible]);

	return (
		<Modal
			destroyOnClose
			visible={visible}
			title={mode === 'add' ? '新增项' : '编辑项'}
			onOk={onModalOk}
			onCancel={onCancel}
		>
			<SchemaForm
				value={formValue}
				onChange={setFormValue}
				labelCol={{ span: 5 }}
				actions={actions}
				components={{ BaseInput }}
				schema={{
					type: "object",
					properties: {
						from: {
							type: "string",
							title: '源地址',
							required: true,
							"x-component": "BaseInput",
							"x-component-props": {
								placeholder: '请输入源地址',
								maxLength: 60
							}
						},
						to: {
							type: "string",
							title: '代理地址',
							required: true,
							"x-component": "BaseInput",
							"x-component-props": {
								placeholder: '请输入代理地址',
								maxLength: 60
							}
						},
					}
				}}
			/>
		</Modal>
	);
}

export default ItemModal;
