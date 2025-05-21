
import React from 'react';
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
  const handlePaddingChange = (side: keyof Pick<LayoutStyle, 'paddingTop' | 'paddingRight' | 'paddingBottom' | 'paddingLeft'>, value: string) => {
    onLayoutChange(side, parseInt(value, 10) || 0);
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
          type="number"
          min="0"
          value={layout.paddingTop}
          onChange={(e) => handlePaddingChange('paddingTop', e.target.value)}
          disabled={layout.centerAll}
        />
        <StyledInput
          label="Padding Right (px)"
          id="paddingRight"
          type="number"
          min="0"
          value={layout.paddingRight}
          onChange={(e) => handlePaddingChange('paddingRight', e.target.value)}
          disabled={layout.centerAll}
        />
        <StyledInput
          label="Padding Bottom (px)"
          id="paddingBottom"
          type="number"
          min="0"
          value={layout.paddingBottom}
          onChange={(e) => handlePaddingChange('paddingBottom', e.target.value)}
          disabled={layout.centerAll}
        />
        <StyledInput
          label="Padding Left (px)"
          id="paddingLeft"
          type="number"
          min="0"
          value={layout.paddingLeft}
          onChange={(e) => handlePaddingChange('paddingLeft', e.target.value)}
          disabled={layout.centerAll}
        />
      </div>
    </Section>
  );
};

export default LayoutControls;
