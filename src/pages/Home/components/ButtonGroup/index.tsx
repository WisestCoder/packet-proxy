/**
 * Button组
 */

import React, { FC, Fragment } from 'react'
import { Button } from 'antd'
import { ButtonProps } from 'antd/lib/button'
import cn from 'classnames'

import styles from './index.less'

interface BProps extends ButtonProps {
  component?: React.ReactElement;
}
interface IProps {
  align?: 'left' | 'right' | 'center';
  buttons?: BProps[];
  style?: Record<string, any>;
  className?: string;
}

const ButtonGroup: FC<IProps> = ({ align = 'left', style = {}, className = '', buttons = [] }) => {
  return (
    <div
      className={cn(styles.container, { [className]: !!className })}
      style={{ textAlign: align, ...style }}
    >
      {buttons.map(({ children, component, ...otherProps }, index) =>
        component ? (
          <Fragment key={index}>{component}</Fragment>
        ) : (
          <Button key={index} {...otherProps}>
            {children}
          </Button>
        ),
      )}
    </div>
  )
}

export default ButtonGroup
