import React, { useCallback, useState, useEffect } from 'react'
import { Modal } from 'antd'
import { SchemaForm, createFormActions } from '@formily/antd'
import BaseInput from '../BaseInput'
import Replacer from '../Replacer'

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
        labelCol={{ span: 6 }}
        actions={actions}
        components={{ BaseInput, Replacer }}
        schema={{
          type: 'object',
          properties: {
            match: {
              'type': 'string',
              'title': '拦截path',
              'required': true,
              'x-component': 'BaseInput',
              'x-component-props': {
                placeholder: '请输入api',
              },
            },
            overrideTxt: {
              'type': 'string',
              'title': '替换response',
              'required': true,
              'x-component': 'Replacer',
              'x-component-props': {
                placeholder: '请输入需要替换的response',
              },
            },
          },
        }}
      />
    </Modal>
  )
}

export default ItemModal
