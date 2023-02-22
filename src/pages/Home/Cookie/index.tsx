import React, { FC, useCallback, useState, useEffect, useRef } from 'react'
import { Table, Space, Divider, Checkbox, message, Modal } from 'antd'
import cloneDeep from 'lodash/cloneDeep'
import isObject from 'lodash/isObject'
import isArray from 'lodash/isArray'
import ButtonGroup from '../components/ButtonGroup'
import ImportModal from '../components/ImportModal'
import ExportModal from '../components/ExportModal'
import ItemModal from '../components/ItemModal'

import './index.less'

interface CookieProp {
  uniqueKey: React.Key;
  from: string;
  to: string;
  checked?: boolean;
}

const GroupDetail: FC = () => {
  const [cookies, setCookies] = useState<CookieProp[]>([])
  const [cookieModalVisible, setCookieModalVisible] = useState(false)
  const [importModalVisible, setImportModalVisible] = useState(false)
  const [exportModalVisible, setExportModalVisible] = useState(false)
  const cookieModalRef = useRef({
    mode: 'add',
    data: {},
  })

  const setChromeCookie = useCallback((newCookies, fn = () => {}) => {
    chrome.extension.sendMessage(
      {
        type: 'setCookies',
        data: newCookies,
      },
      (response) => {
        if (response.isSuccess) {
          fn()
          setCookies(response.data)
        } else {
          message.error('添加失败！')
        }
      },
    )
  }, [])

  const onAddItem = useCallback(() => {
    setCookieModalVisible(true)
    cookieModalRef.current = {
      mode: 'add',
      data: {
        uniqueKey: Math.random().toString().slice(2),
      },
    }
  }, [])

  // 导入
  const onImport = useCallback(() => {
    setImportModalVisible(true)
  }, [])

  const onExport = useCallback(() => {
    setExportModalVisible(true)
  }, [])

  const onCheckItem = useCallback(
    (record, checked) => {
      const newCookies = cloneDeep(cookies)
      const groupIndex = newCookies.findIndex((x) => x.uniqueKey === record.uniqueKey)
      newCookies[groupIndex].checked = checked

      setChromeCookie(newCookies)
    },
    [cookies, setChromeCookie],
  )

  const onEditItem = useCallback((record) => {
    setCookieModalVisible(true)
    cookieModalRef.current = {
      mode: 'edit',
      data: record,
    }
  }, [])

  const onDeleteItem = useCallback(
    (item) => {
      Modal.confirm({
        title: '温馨提示',
        content: '确认要删除该数据吗？',
        onOk() {
          const newGroups = cookies.filter((x: any) => x.uniqueKey !== item.uniqueKey)

          setChromeCookie(newGroups)
        },
      })
    },
    [cookies, setChromeCookie],
  )

  useEffect(() => {
    chrome.extension.sendMessage(
      {
        type: 'getCookies',
      },
      function (response) {
        if (response.isSuccess) {
          setCookies(response.data)
        }
      },
    )
  }, [])

  return (
    <>
      <ButtonGroup
        buttons={[
          { children: '新增项', size: 'small', type: 'primary', onClick: onAddItem },
          { children: '导入', size: 'small', type: 'primary', onClick: onImport },
          { children: '导出', size: 'small', type: 'primary', onClick: onExport },
        ]}
      />
      <Table
        className="cookie-table-container"
        style={{ fontSize: '12px' }}
        rowKey="uniqueKey"
        columns={[
          {
            title: '',
            width: 60,
            render: (_, record: any) => (
              <Checkbox
                checked={record.checked}
                onChange={(e) => {
                  onCheckItem(record, e.target.checked)
                }}
              />
            ),
          },
          { title: '源地址', key: 'from', dataIndex: 'from' },
          { title: '代理地址', key: 'to', dataIndex: 'to' },
          {
            title: '操作',
            width: 120,
            key: 'Action',
            render(_, record) {
              return (
                <Space split={<Divider type="vertical" />}>
                  <a
                    onClick={() => {
                      onEditItem(record)
                    }}
                  >
                    编辑
                  </a>
                  <a
                    onClick={() => {
                      onDeleteItem(record)
                    }}
                  >
                    删除
                  </a>
                </Space>
              )
            },
          },
        ]}
        dataSource={cookies || []}
        size="small"
        scroll={{ y: 406 }}
      />
      <ImportModal
        visible={importModalVisible}
        onOk={(newJson) => {
          let newCookies = cloneDeep(cookies)
          const json = JSON.parse(newJson)
          console.log('json', json)
          if (isArray(json)) {
            newCookies = [...newCookies, ...json]
          } else if (isObject(json)) {
            // @ts-ignore
            newCookies.push(json)
          }

          setChromeCookie(newCookies, () => {
            setImportModalVisible(false)
          })
        }}
        onCancel={() => {
          setImportModalVisible(false)
        }}
      />
      <ExportModal
        value={cookies}
        visible={exportModalVisible}
        onCancel={() => {
          setExportModalVisible(false)
        }}
      />
      <ItemModal
        mode={cookieModalRef.current.mode}
        data={cookieModalRef.current.data}
        visible={cookieModalVisible}
        onOk={(newItem) => {
          let newCookies = cloneDeep(cookies)
          if (cookieModalRef.current.mode === 'add') {
            newCookies = [...newCookies, newItem]
          } else {
            const findIndex = newCookies.findIndex((x) => x.uniqueKey === newItem.uniqueKey)
            newCookies[findIndex] = newItem
          }

          setChromeCookie(newCookies, () => {
            setCookieModalVisible(false)
          })
        }}
        onCancel={() => {
          setCookieModalVisible(false)
        }}
      />
    </>
  )
}

export default GroupDetail
