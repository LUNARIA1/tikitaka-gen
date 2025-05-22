
import React, { useState, useEffect } from 'react';
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
  const [widthInputValue, setWidthInputValue] = useState(String(customDimensions.width));
  const [heightInputValue, setHeightInputValue] = useState(String(customDimensions.height));

  useEffect(() => {
    setWidthInputValue(String(customDimensions.width));
  }, [customDimensions.width]);

  useEffect(() => {
    setHeightInputValue(String(customDimensions.height));
  }, [customDimensions.height]);

  const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onPresetChange(e.target.value as DimensionPreset);
  };

  const handleInputChange = (dim: 'width' | 'height', value: string) => {
    if (dim === 'width') {
      setWidthInputValue(value);
    } else {
      setHeightInputValue(value);
    }
  };

  const handleInputBlur = (dim: 'width' | 'height') => {
    const inputValue = dim === 'width' ? widthInputValue : heightInputValue;
    let numValue = parseInt(inputValue, 10);
    let finalNumValue: number;

    if (isNaN(numValue)) {
      finalNumValue = dim === 'width' ? DEFAULT_CUSTOM_DIMENSIONS.width : DEFAULT_CUSTOM_DIMENSIONS.height;
    } else {
      finalNumValue = Math.max(MIN_DIMENSION, Math.min(MAX_DIMENSION, numValue));
    }

    if (String(finalNumValue) !== inputValue) {
      if (dim === 'width') setWidthInputValue(String(finalNumValue));
      else setHeightInputValue(String(finalNumValue));
    }
    
    onCustomDimensionChange(dim, finalNumValue);
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
            type="text" // Changed from number to text to allow empty string
            inputMode="numeric" // Hint for numeric keyboard on mobile
            pattern="[0-9]*"    // Pattern for basic numeric validation
            value={widthInputValue}
            onChange={(e) => handleInputChange('width', e.target.value)}
            onBlur={() => handleInputBlur('width')}
          />
          <StyledInput
            label="Height (px)"
            id="customHeight"
            type="text" // Changed from number to text
            inputMode="numeric"
            pattern="[0-9]*"
            value={heightInputValue}
            onChange={(e) => handleInputChange('height', e.target.value)}
            onBlur={() => handleInputBlur('height')}
          />
        </div>
      )}
    </Section>
  );
};

export default DimensionControls;
