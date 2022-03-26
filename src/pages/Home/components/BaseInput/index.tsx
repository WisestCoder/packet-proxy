import React, { FC, useCallback } from 'react';
import { Input } from 'antd';
import { InputProps } from 'antd/lib/input';

interface IProps extends InputProps {
	onChange: (v: any) => void;
};

const BaseInput: FC<IProps> = ({
	onChange,
	...otherProps
}) => {
	const onInputChange = useCallback((e) => {
		onChange(e.target.value);
	}, [onChange]);

	return (
		<Input
			{...otherProps}
			onChange={onInputChange}
		/>
	);
}

export default BaseInput;
