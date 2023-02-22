import React, { useCallback, useEffect, useState } from 'react'
import { Modal } from 'antd'
import { SchemaForm, createFormActions } from '@formily/antd'
import BaseInput from '../BaseInput'

const actions = createFormActions()

const GroupModal = ({ visible, onOk, onCancel, mode, data }) => {
  const [formValue, setFormValue] = useState({})

  const onModalOk = useCallback(() => {
    actions.validate().then(() => {
      onOk(formValue)
    })
  }, [onOk, formValue])

  useEffect(() => {
    visible && setFormValue(data)
  }, [visible])

  return (
    <Modal
      destroyOnClose
      visible={visible}
      title={mode === 'add' ? '新增组' : '编辑组'}
      onOk={onModalOk}
      onCancel={onCancel}
    >
      <SchemaForm
        value={formValue}
        onChange={setFormValue}
        actions={actions}
        components={{ BaseInput }}
        schema={{
          type: 'object',
          properties: {
            name: {
              'type': 'string',
              'title': '名称',
              'required': true,
              'x-component': 'BaseInput',
              'x-component-props': {
                placeholder: '请输入名称',
                maxLength: 20,
              },
            },
          },
        }}
      />
    </Modal>
  )
}

export default GroupModal
