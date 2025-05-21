
import React from 'react';
import { DimensionPreset, Dimensions } from '../../types';
import { DIMENSION_PRESETS_MAP, MIN_DIMENSION, MAX_DIMENSION } from '../../constants';
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
    if (isNaN(numValue)) { // If input is empty or not a number
      numValue = 1; // Default to 1 as per request
    }
    numValue = Math.max(MIN_DIMENSION, Math.min(MAX_DIMENSION, numValue));
    // If MIN_DIMENSION is 0 and numValue became 1, Math.max(0,1) is 1.
    // If user types "0", parseInt("0") is 0. Math.max(0,0) is 0.
    // To strictly ensure 0 becomes 1 if typed, an additional check would be needed:
    // if (numValue === 0) numValue = 1;
    // However, the request was "텍스트박스에 아무것도 써있지 않으면 ... 1로 취급"
    // which means empty string becomes 1. Typing "0" explicitly should probably still be 0 if MIN_DIMENSION allows.
    // Given MIN_DIMENSION is 0, this behavior is fine.
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
            // min={MIN_DIMENSION} // Removing min from input to allow easier empty/default-to-1 behavior
            max={MAX_DIMENSION}
            value={customDimensions.width}
            onChange={(e) => handleCustomChange('width', e.target.value)}
            placeholder="e.g., 300"
          />
          <StyledInput
            label="Height (px)"
            id="customHeight"
            type="number"
            // min={MIN_DIMENSION} // Removing min from input
            max={MAX_DIMENSION}
            value={customDimensions.height}
            onChange={(e) => handleCustomChange('height', e.target.value)}
            placeholder="e.g., 500"
          />
        </div>
      )}
    </Section>
  );
};

export default DimensionControls;
