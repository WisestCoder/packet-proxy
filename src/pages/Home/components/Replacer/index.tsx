import React, { FC, useCallback, useState, useEffect } from 'react'
import { Input } from 'antd'
import { InputProps } from 'antd/lib/input'
import ReactJson from 'react-json-view'

import './index.less'

const { TextArea } = Input

interface IProps extends InputProps {
  onChange: (v: any) => void;
}

const Replacer: FC<IProps> = ({ onChange, value, placeholder }) => {
  const [formatValue, setFormatValue] = useState(null)
  const onInputChange = useCallback(
    (e) => {
      onChange(e.target.value)
    },
    [onChange],
  )

  useEffect(() => {
    try {
      const newFormat = JSON.parse(value as string)
      setFormatValue(newFormat)
    } catch {
      setFormatValue(null)
    }
  }, [value, setFormatValue])

  const handleJSONEditorChange = useCallback(
    // eslint-disable-next-line camelcase, @typescript-eslint/camelcase
    ({ updated_src }) => {
      const txt = JSON.stringify(updated_src)
      setFormatValue(updated_src)
      onChange(txt)
    },
    [onChange, setFormatValue],
  )

  return (
    <>
      <TextArea placeholder={placeholder} value={value} onChange={onInputChange} />
      {formatValue ? (
        <div className="JsonEditor">
          {/* @ts-ignore */}
          <ReactJson
            name={false}
            collapsed
            collapseStringsAfterLength={12}
            src={formatValue}
            onEdit={handleJSONEditorChange}
            onAdd={handleJSONEditorChange}
            onDelete={handleJSONEditorChange}
            displayDataTypes={false}
          />
        </div>
      ) : (
        <div className="JsonEditor invalid">Invalid JSON</div>
      )}
    </>
  )
}

export default Replacer
