import React, { useCallback, useEffect, useState } from 'react';
import { Modal, Input } from 'antd';
import { SchemaForm, createFormActions } from '@formily/antd';

const actions = createFormActions();

const ImportModal = ({
	visible,
	onOk,
	onCancel,
}) => {
	const [formValue, setFormValue] = useState({ json: '' });
	const onModalOk = useCallback(() => {
		actions.validate()
			.then(() => {
				onOk(formValue.json);
			});
	}, [onOk, formValue]);

	useEffect(() => {
		visible && setFormValue({ json: '' });
	}, [visible]);

	return (
		<Modal
			destroyOnClose
			visible={visible}
			title="导入JSON"
			onOk={onModalOk}
			onCancel={onCancel}
		>
			<SchemaForm
				value={formValue}
				onChange={(newValue) => { setFormValue(newValue); }}
				actions={actions}
				components={{ TextArea: Input.TextArea }}
				schema={{
					type: "object",
					properties: {
						json: {
							type: "string",
							title: "JSON",
							required: true,
							"x-component": "TextArea",
							"x-component-props": {
								placeholder: '请输入JSON',
								autoSize: { minRows: 6 }
							},
							"x-rules": [
								{
									validator(value) {
										if (!(value && value.trim().length)) {
											return false;
										}

										try {
											const json = JSON.parse(value);
											if (json && typeof json === 'object') {
												return false;
											}
											return true;
										} catch(err) {
											return true;
										}
									},
									message: '请输入JSON格式的数据'
								}
							]
						},
					}
				}}
			/>
		</Modal>
	);
}

export default ImportModal;
