import React from 'react';
import { TextStyle, FontOption } from '../../types';
import StyledInput from '../forms/StyledInput';
import StyledSelect from '../forms/StyledSelect';
import StyledCheckbox from '../forms/StyledCheckbox';

interface TypographyControlsProps {
  styleState: Omit<TextStyle, 'text'>;
  onStyleChange: <K extends keyof Omit<TextStyle, 'text'>>(key: K, value: Omit<TextStyle, 'text'>[K]) => void;
  elementName: string; // e.g., "Character Name"
  availableFonts: FontOption[];
}

const TypographyControls: React.FC<TypographyControlsProps> = ({ styleState, onStyleChange, elementName, availableFonts }) => {
  return (
    <div className="p-4 border border-gray-200 rounded-lg space-y-3">
      <h4 className="text-sm font-medium text-gray-600">{elementName} Style</h4>
      <StyledSelect
        label="Font Family"
        id={`${elementName}-fontFamily`}
        value={styleState.fontFamily}
        onChange={(e) => onStyleChange('fontFamily', e.target.value)}
      >
        {availableFonts.map((font) => (
          <option key={font.value} value={font.value}>
            {font.label}
          </option>
        ))}
      </StyledSelect>
      <div className="grid grid-cols-2 gap-3">
        <StyledInput
          label="Font Size (px)"
          id={`${elementName}-fontSize`}
          type="number"
          // min="1" // Removed to allow easier single-digit input
          value={styleState.fontSize}
          onChange={(e) => onStyleChange('fontSize', parseInt(e.target.value, 10) || 1)}
        />
        <StyledInput
          label="Font Color"
          id={`${elementName}-fontColor`}
          type="color"
          value={styleState.color}
          onChange={(e) => onStyleChange('color', e.target.value)}
          className="h-10"
        />
      </div>
      <div className="flex space-x-4">
        <StyledCheckbox
          label="Bold"
          id={`${elementName}-bold`}
          checked={styleState.isBold}
          onChange={(e) => onStyleChange('isBold', e.target.checked)}
        />
        <StyledCheckbox
          label="Italic"
          id={`${elementName}-italic`}
          checked={styleState.isItalic}
          onChange={(e) => onStyleChange('isItalic', e.target.checked)}
        />
      </div>
    </div>
  );
};

export default TypographyControls;