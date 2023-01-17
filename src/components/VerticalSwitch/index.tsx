import React, { useEffect, useState } from "react";
import "./switch-styles.css";

interface Props {
   value?: string;
	options: [string, string];
   onChange?: (value: string) => void;
}

const VerticalSwitch: React.FC<Props> = ({value, options, onChange}) => {

   const [checkedOption, setCheckedOption] = useState(options[0]);

   useEffect(() => {
      if (!value) return;
      setCheckedOption(value);
   }, [value]);

   const onChangeValue = (event) => {
      setCheckedOption(event.target.value)
		if (!!onChange)
      	onChange(event.target.value)
   }

	return (
		<div className="toggle-switch-container">
			<div className="toggle-switch switch-vertical" onChange={onChangeValue}>
				<input id="toggle-a" value={options[0]} type="radio" name="switch" checked={checkedOption == options[0]} />
				<label htmlFor="toggle-a">{options[0]}</label>
				<input id="toggle-b" value={options[1]} type="radio" name="switch" checked={checkedOption == options[1]} />
				<label htmlFor="toggle-b">{options[1]}</label>
				<span className="toggle-outside">
					<span className="toggle-inside"></span>
				</span>
			</div>
		</div>
	);
};

export default VerticalSwitch;
