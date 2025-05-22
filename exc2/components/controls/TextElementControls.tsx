import React from 'react';
import { TextStyle, FontOption } from '../../types';
import StyledInput from '../forms/StyledInput';
import StyledTextarea from '../forms/StyledTextarea';
import TypographyControls from './TypographyControls';

interface TextElementControlsProps {
  idPrefix: string;
  label: string;
  textStyle: TextStyle;
  onTextStyleChange: (newStyle: TextStyle) => void;
  isTextarea?: boolean;
  availableFonts: FontOption[];
}

const TextElementControls: React.FC<TextElementControlsProps> = ({
  idPrefix,
  label,
  textStyle,
  onTextStyleChange,
  isTextarea = false,
  availableFonts,
}) => {
  const handleTextChange = (newText: string) => {
    onTextStyleChange({ ...textStyle, text: newText });
  };

  const handleStyleChange = <K extends keyof Omit<TextStyle, 'text'>>(
    key: K,
    value: Omit<TextStyle, 'text'>[K]
  ) => {
    onTextStyleChange({ ...textStyle, [key]: value });
  };

  return (
    <div className="space-y-3">
      {isTextarea ? (
        <StyledTextarea
          label={label}
          id={`${idPrefix}-text`}
          value={textStyle.text}
          onChange={(e) => handleTextChange(e.target.value)}
          rows={6}
        />
      ) : (
        <StyledInput
          label={label}
          id={`${idPrefix}-text`}
          type="text"
          value={textStyle.text}
          onChange={(e) => handleTextChange(e.target.value)}
        />
      )}
      <TypographyControls
        styleState={{
          fontFamily: textStyle.fontFamily,
          fontSize: textStyle.fontSize,
          color: textStyle.color,
          isBold: textStyle.isBold,
          isItalic: textStyle.isItalic,
        }}
        onStyleChange={handleStyleChange}
        elementName={label}
        availableFonts={availableFonts}
      />
    </div>
  );
};

export default TextElementControls;