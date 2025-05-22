
import React, { useState, useEffect } from 'react';
import { TextStyle, FontOption } from '../../types';
import StyledInput from '../forms/StyledInput';
import StyledSelect from '../forms/StyledSelect';
import StyledCheckbox from '../forms/StyledCheckbox';

interface TypographyControlsProps {
  styleState: Partial<Omit<TextStyle, 'text'>>; 
  onStyleChange: <K extends keyof Omit<TextStyle, 'text'>>(key: K, value: Omit<TextStyle, 'text'>[K] | undefined) => void; 
  elementName: string; 
  availableFonts: FontOption[];
  globalDefaults?: Omit<TextStyle, 'text'>; 
}

const TypographyControls: React.FC<TypographyControlsProps> = ({ styleState, onStyleChange, elementName, availableFonts, globalDefaults }) => {
  const [fontSizeInput, setFontSizeInput] = useState<string>(
    styleState.fontSize === undefined ? '' : String(styleState.fontSize)
  );

  useEffect(() => {
    setFontSizeInput(styleState.fontSize === undefined ? '' : String(styleState.fontSize));
  }, [styleState.fontSize]);

  const handleFontSizeInputChange = (value: string) => {
    setFontSizeInput(value);
  };

  const handleFontSizeBlur = () => {
    const val = parseInt(fontSizeInput, 10);
    if (isNaN(val) || val <= 0) { // Font size must be positive
      onStyleChange('fontSize', undefined); 
    } else {
      onStyleChange('fontSize', val);
    }
    // useEffect will sync input if parent changes styleState.fontSize
  };
  
  return (
    <div className="p-4 border border-gray-200 rounded-lg space-y-3">
      <h4 className="text-sm font-medium text-gray-600">{elementName} Style</h4>
      <StyledSelect
        label="Font Family"
        id={`${elementName}-fontFamily`}
        value={styleState.fontFamily || ""} 
        onChange={(e) => onStyleChange('fontFamily', e.target.value || undefined)}
      >
        <option value="">Default (Use Global/Parent)</option> 
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
          type="text" // Changed to text
          inputMode="numeric"
          pattern="[0-9]*"
          value={fontSizeInput}
          placeholder={globalDefaults?.fontSize?.toString() || "Global"}
          onChange={(e) => handleFontSizeInputChange(e.target.value)}
          onBlur={handleFontSizeBlur}
        />
        <StyledInput
          label="Font Color"
          id={`${elementName}-fontColor`}
          type="color"
          value={styleState.color || globalDefaults?.color || "#000000"}
          onChange={(e) => onStyleChange('color', e.target.value)}
        />
      </div>
      <div className="flex space-x-4">
        <StyledCheckbox
          label="Bold"
          id={`${elementName}-bold`}
          checked={styleState.isBold === undefined ? (globalDefaults?.isBold || false) : styleState.isBold}
          onChange={(e) => onStyleChange('isBold', e.target.checked)}
        />
        <StyledCheckbox
          label="Italic"
          id={`${elementName}-italic`}
          checked={styleState.isItalic === undefined ? (globalDefaults?.isItalic || false) : styleState.isItalic}
          onChange={(e) => onStyleChange('isItalic', e.target.checked)}
        />
      </div>
    </div>
  );
};

export default TypographyControls;
