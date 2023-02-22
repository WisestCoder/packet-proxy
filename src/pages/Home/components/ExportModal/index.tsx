import React, { useCallback, useRef } from 'react'
import { Modal, Input } from 'antd'

const ExportModal = ({ visible, onCancel, value }) => {
  const textareaRef = useRef(null)

  const onModalOk = useCallback(() => {
    const textAreaDom = textareaRef.current.resizableTextArea.textArea
    textAreaDom.select()
    document.execCommand('Copy')
  }, [])

  return (
    <Modal
      destroyOnClose
      visible={visible}
      title="导出JSON"
      onOk={onModalOk}
      onCancel={onCancel}
      cancelText="关闭"
      okText="复制"
    >
      <Input.TextArea
        ref={textareaRef}
        value={JSON.stringify(value, null, 2)}
        autoSize={{ minRows: 10 }}
        readOnly
      />
    </Modal>
  )
}

export default ExportModal
