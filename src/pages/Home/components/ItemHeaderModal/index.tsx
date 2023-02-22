import React, { useCallback, useState, useEffect } from 'react'
import { Modal } from 'antd'
import { SchemaForm, createFormActions } from '@formily/antd'
import BaseInput from '../BaseInput'
import AutoComplete from '../AutoComplete'

const actions = createFormActions()

const ItemModal = ({ visible, onOk, onCancel, mode, data }) => {
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
      title={mode === 'add' ? '新增项' : '编辑项'}
      onOk={onModalOk}
      onCancel={onCancel}
    >
      <SchemaForm
        value={formValue}
        onChange={setFormValue}
        labelCol={{ span: 5 }}
        actions={actions}
        components={{ BaseInput, AutoComplete }}
        schema={{
          type: 'object',
          properties: {
            name: {
              'type': 'string',
              'title': 'name',
              'required': true,
              'x-component': 'AutoComplete',
              'x-component-props': {
                placeholder: '请输入name',
                maxLength: 120,
                defaultOpen: false,
								style: { width: '100%' }
              },
            },
            value: {
              'type': 'string',
              'title': 'value',
              'required': true,
              'x-component': 'BaseInput',
              'x-component-props': {
                placeholder: '请输入value',
                maxLength: 120,
              },
            },
          },
        }}
      />
    </Modal>
  )
}

export default ItemModal
