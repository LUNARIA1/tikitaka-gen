
import React, { useState, useEffect } from 'react';
import { LayoutStyle, HorizontalAlignment, VerticalAlignment } from '../../types';
import StyledSelect from '../forms/StyledSelect';
import StyledInput from '../forms/StyledInput';
import StyledCheckbox from '../forms/StyledCheckbox';
import Section from '../Section';

interface LayoutControlsProps {
  layout: LayoutStyle;
  onLayoutChange: <K extends keyof LayoutStyle>(key: K, value: LayoutStyle[K]) => void;
}

const LayoutControls: React.FC<LayoutControlsProps> = ({ layout, onLayoutChange }) => {
  const [paddingTopInput, setPaddingTopInput] = useState(String(layout.paddingTop));
  const [paddingRightInput, setPaddingRightInput] = useState(String(layout.paddingRight));
  const [paddingBottomInput, setPaddingBottomInput] = useState(String(layout.paddingBottom));
  const [paddingLeftInput, setPaddingLeftInput] = useState(String(layout.paddingLeft));

  useEffect(() => setPaddingTopInput(String(layout.paddingTop)), [layout.paddingTop]);
  useEffect(() => setPaddingRightInput(String(layout.paddingRight)), [layout.paddingRight]);
  useEffect(() => setPaddingBottomInput(String(layout.paddingBottom)), [layout.paddingBottom]);
  useEffect(() => setPaddingLeftInput(String(layout.paddingLeft)), [layout.paddingLeft]);

  type PaddingSide = keyof Pick<LayoutStyle, 'paddingTop' | 'paddingRight' | 'paddingBottom' | 'paddingLeft'>;

  const handlePaddingInputChange = (side: PaddingSide, value: string) => {
    switch (side) {
      case 'paddingTop': setPaddingTopInput(value); break;
      case 'paddingRight': setPaddingRightInput(value); break;
      case 'paddingBottom': setPaddingBottomInput(value); break;
      case 'paddingLeft': setPaddingLeftInput(value); break;
    }
  };

  const handlePaddingInputBlur = (side: PaddingSide) => {
    let inputValue: string;
    let setInputState: React.Dispatch<React.SetStateAction<string>>;

    switch (side) {
      case 'paddingTop': inputValue = paddingTopInput; setInputState = setPaddingTopInput; break;
      case 'paddingRight': inputValue = paddingRightInput; setInputState = setPaddingRightInput; break;
      case 'paddingBottom': inputValue = paddingBottomInput; setInputState = setPaddingBottomInput; break;
      case 'paddingLeft': inputValue = paddingLeftInput; setInputState = setPaddingLeftInput; break;
      default: return;
    }

    let numValue = parseInt(inputValue, 10);
    if (isNaN(numValue) || numValue < 0) {
      numValue = 0; // Default to 0 if invalid or negative
    }

    if (String(numValue) !== inputValue) {
      setInputState(String(numValue));
    }
    onLayoutChange(side, numValue);
  };


  return (
    <Section title="4. Text Layout">
      <div className="grid grid-cols-2 gap-4">
        <StyledSelect
          label="Horizontal Alignment"
          id="horizontalAlign"
          value={layout.horizontalAlign}
          onChange={(e) => onLayoutChange('horizontalAlign', e.target.value as HorizontalAlignment)}
        >
          <option value={HorizontalAlignment.LEFT}>Left</option>
          <option value={HorizontalAlignment.CENTER}>Center</option>
          <option value={HorizontalAlignment.RIGHT}>Right</option>
        </StyledSelect>
        <StyledSelect
          label="Vertical Alignment"
          id="verticalAlign"
          value={layout.verticalAlign}
          onChange={(e) => onLayoutChange('verticalAlign', e.target.value as VerticalAlignment)}
        >
          <option value={VerticalAlignment.TOP}>Top</option>
          <option value={VerticalAlignment.MIDDLE}>Middle</option>
          <option value={VerticalAlignment.BOTTOM}>Bottom</option>
        </StyledSelect>
      </div>

      <StyledCheckbox
        label="Auto-Center Content Block (disables manual padding)"
        id="centerAll"
        checked={layout.centerAll}
        onChange={(e) => onLayoutChange('centerAll', e.target.checked)}
        className="mt-4"
      />

      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StyledInput
          label="Padding Top (px)"
          id="paddingTop"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={paddingTopInput}
          onChange={(e) => handlePaddingInputChange('paddingTop', e.target.value)}
          onBlur={() => handlePaddingInputBlur('paddingTop')}
          disabled={layout.centerAll}
        />
        <StyledInput
          label="Padding Right (px)"
          id="paddingRight"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={paddingRightInput}
          onChange={(e) => handlePaddingInputChange('paddingRight', e.target.value)}
          onBlur={() => handlePaddingInputBlur('paddingRight')}
          disabled={layout.centerAll}
        />
        <StyledInput
          label="Padding Bottom (px)"
          id="paddingBottom"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={paddingBottomInput}
          onChange={(e) => handlePaddingInputChange('paddingBottom', e.target.value)}
          onBlur={() => handlePaddingInputBlur('paddingBottom')}
          disabled={layout.centerAll}
        />
        <StyledInput
          label="Padding Left (px)"
          id="paddingLeft"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={paddingLeftInput}
          onChange={(e) => handlePaddingInputChange('paddingLeft', e.target.value)}
          onBlur={() => handlePaddingInputBlur('paddingLeft')}
          disabled={layout.centerAll}
        />
      </div>
    </Section>
  );
};

export default LayoutControls;
