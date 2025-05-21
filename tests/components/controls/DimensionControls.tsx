
import React from 'react';
import { DimensionPreset, Dimensions } from '../../types';
import { DIMENSION_PRESETS_MAP, MIN_DIMENSION, MAX_DIMENSION, DEFAULT_CUSTOM_DIMENSIONS } from '../../constants';
import StyledSelect from '../forms/StyledSelect';
import StyledInput from '../forms/StyledInput';
import Section from '../Section';

interface DimensionControlsProps {
  preset: DimensionPreset;
  customDimensions: Dimensions;
  onPresetChange: (preset: DimensionPreset) => void;
  onCustomDimensionChange: (dim: 'width' | 'height', value: number) => void;
}

const DimensionControls: React.FC<DimensionControlsProps> = ({
  preset,
  customDimensions,
  onPresetChange,
  onCustomDimensionChange,
}) => {
  const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onPresetChange(e.target.value as DimensionPreset);
  };

  const handleCustomChange = (dim: 'width' | 'height', value: string) => {
    let numValue = parseInt(value, 10);
    if (isNaN(numValue)) numValue = dim === 'width' ? DEFAULT_CUSTOM_DIMENSIONS.width : DEFAULT_CUSTOM_DIMENSIONS.height;
    numValue = Math.max(MIN_DIMENSION, Math.min(MAX_DIMENSION, numValue));
    onCustomDimensionChange(dim, numValue);
  };

  return (
    <Section title="1. Canvas Dimensions">
      <StyledSelect
        label="Preset Sizes"
        id="dimensionPreset"
        value={preset}
        onChange={handlePresetChange}
      >
        {Object.values(DimensionPreset).map((p) => (
          <option key={p} value={p}>
            {p}
          </option>
        ))}
      </StyledSelect>
      {preset === DimensionPreset.CUSTOM && (
        <div className="grid grid-cols-2 gap-4 mt-4">
          <StyledInput
            label="Width (px)"
            id="customWidth"
            type="number"
            min={MIN_DIMENSION}
            max={MAX_DIMENSION}
            value={customDimensions.width}
            onChange={(e) => handleCustomChange('width', e.target.value)}
          />
          <StyledInput
            label="Height (px)"
            id="customHeight"
            type="number"
            min={MIN_DIMENSION}
            max={MAX_DIMENSION}
            value={customDimensions.height}
            onChange={(e) => handleCustomChange('height', e.target.value)}
          />
        </div>
      )}
    </Section>
  );
};

export default DimensionControls;
