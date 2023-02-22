import React, { FC } from 'react'
import { Tabs } from 'antd'
import Source from './Source'
import Cookie from './Cookie'
import Header from './Header'
import './index.less'

const { TabPane } = Tabs

const Home: FC = () => {
  return (
    <Tabs type="card" className="tab-container">
      <TabPane tab="资源代理" key="source">
        <Source />
      </TabPane>
      <TabPane tab="Cookie代理" key="cookie">
        <Cookie />
      </TabPane>
      <TabPane tab="Header添加" key="header">
        <Header />
      </TabPane>
    </Tabs>
  )
}

export default Home
