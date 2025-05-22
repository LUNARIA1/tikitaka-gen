import React from 'react';
import Section from '../Section';
import StyledTextarea from '../forms/StyledTextarea';
import StyledButton from '../forms/StyledButton';
import { MAX_CUSTOM_FONTS } from '../../constants';

interface CustomFontControlsProps {
  rules: string[];
  onRulesChange: (rules: string[]) => void;
}

const CustomFontControls: React.FC<CustomFontControlsProps> = ({ rules, onRulesChange }) => {
  const handleAddRule = () => {
    if (rules.length < MAX_CUSTOM_FONTS) {
      onRulesChange([...rules, '']);
    }
  };

  const handleRuleChange = (index: number, value: string) => {
    const newRules = [...rules];
    newRules[index] = value;
    onRulesChange(newRules);
  };

  const handleRemoveRule = (index: number) => {
    const newRules = rules.filter((_, i) => i !== index);
    onRulesChange(newRules);
  };

  return (
    <Section title="Custom Fonts (@font-face)">
      <div className="space-y-4">
        {rules.map((rule, index) => (
          <div key={index} className="space-y-2 p-3 border border-gray-200 rounded-md">
            <StyledTextarea
              label={`@font-face Rule #${index + 1}`}
              id={`custom-font-rule-${index}`}
              value={rule}
              onChange={(e) => handleRuleChange(index, e.target.value)}
              rows={5}
              placeholder={`@font-face {\n  font-family: 'MyCustomFont';\n  src: url('https://example.com/font.woff') format('woff');\n}`}
              className="text-xs leading-relaxed tracking-wider"
            />
            <StyledButton
              type="button"
              variant="danger"
              onClick={() => handleRemoveRule(index)}
              className="w-full text-xs py-1.5"
            >
              Remove Rule #{index + 1}
            </StyledButton>
          </div>
        ))}
        {rules.length < MAX_CUSTOM_FONTS && (
          <StyledButton
            type="button"
            variant="secondary"
            onClick={handleAddRule}
            className="w-full"
          >
            + Add Custom Font Rule ({rules.length}/{MAX_CUSTOM_FONTS})
          </StyledButton>
        )}
        {rules.length >= MAX_CUSTOM_FONTS && (
            <p className="text-xs text-gray-500 text-center">Maximum of {MAX_CUSTOM_FONTS} custom fonts reached.</p>
        )}
        <p className="text-xs text-gray-600 mt-2">
          Paste your full <code className="bg-gray-200 px-1 rounded">@font-face</code> CSS rules above. 
          The font name defined in <code className="bg-gray-200 px-1 rounded">font-family</code> will be available in the font selection dropdowns.
        </p>
      </div>
    </Section>
  );
};

export default CustomFontControls;
