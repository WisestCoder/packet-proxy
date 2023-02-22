import React, { FC, useState } from 'react'
import { AutoComplete } from 'antd'
import { AutoCompleteProps } from 'antd/lib/auto-complete'
import HEADER_OPTIONS from './HEADER_OPTIONS'

const AutoComplete2: FC<AutoCompleteProps> = ({ ...otherProps }) => {
  const [options, setOptions] = useState<any[]>([])
  const onSearch = (searchText: string) => {
    const filter = HEADER_OPTIONS.filter((item) =>
      item.toLocaleLowerCase().includes(searchText.toLocaleLowerCase()),
    )
    setOptions(filter.map((item) => ({ value: item })))
  }

  return <AutoComplete {...otherProps} onSearch={onSearch} options={options} />
}

export default AutoComplete2
