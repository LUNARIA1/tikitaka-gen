
import React from 'react';
import { AppState, TextStyle, DimensionPreset, LayoutStyle, FontOption, DisplayTextStyle } from '../types';
import DimensionControls from './controls/DimensionControls';
import BackgroundControls from './controls/BackgroundControls';
import TextElementControls from './controls/TextElementControls';
import LayoutControls from './controls/LayoutControls';
import CustomFontControls from './controls/CustomFontControls';
import TypographyControls from './controls/TypographyControls';
import StyledInput from './forms/StyledInput'; // Corrected path
import StyledButton from './forms/StyledButton'; // Corrected path
import Section from './Section';
import { INITIAL_APP_STATE } from '../constants';


interface ControlsPanelProps {
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
  availableFonts: FontOption[];
  onDownloadImage: () => void; 
}

const ControlsPanel: React.FC<ControlsPanelProps> = ({ appState, setAppState, availableFonts, onDownloadImage }) => {
  
  const handleAiModelNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAppState(prev => ({ ...prev, aiModelName: e.target.value }));
  };

  const handleAiModelDisplayStyleChange = <K extends keyof DisplayTextStyle>(
    key: K,
    value: DisplayTextStyle[K]
  ) => {
    setAppState(prev => ({
      ...prev,
      aiModelDisplayStyle: { ...prev.aiModelDisplayStyle, [key]: value },
    }));
  };

  const handleCharacterNameChange = (newStyle: TextStyle) => {
    setAppState(prev => ({ ...prev, aiCharacterName: newStyle }));
  };

  const handleContentChange = (newStyle: TextStyle) => {
    setAppState(prev => ({ ...prev, aiContent: newStyle }));
  };

  const handlePresetChange = (preset: DimensionPreset) => {
    setAppState(prev => ({ ...prev, dimensionPreset: preset }));
  };

  const handleCustomDimensionChange = (dim: 'width' | 'height', value: number) => {
    setAppState(prev => ({
      ...prev,
      customDimensions: { ...prev.customDimensions, [dim]: value },
    }));
  };

  const handleBgColorChange = (color: string) => {
    setAppState(prev => ({ ...prev, backgroundColor: color }));
  };

  const handleBgImageUpload = (image: string | null) => {
    setAppState(prev => ({ ...prev, backgroundImage: image }));
  };

  const handleBgImageDimnessChange = (dimness: number) => {
    setAppState(prev => ({ ...prev, backgroundImageDimness: dimness }));
  };

  const handleLayoutChange = <K extends keyof LayoutStyle>(key: K, value: LayoutStyle[K]) => {
    setAppState(prev => ({
      ...prev,
      layout: { ...prev.layout, [key]: value },
    }));
  };

  const handleCustomFontRulesChange = (rules: string[]) => {
    setAppState(prev => ({ ...prev, customFontRules: rules }));
  };

  const handleClearAll = () => {
    setAppState(INITIAL_APP_STATE);
  };

  return (
    <div className="w-full p-4 md:p-6 space-y-6 overflow-y-auto bg-stone-50 rounded-xl shadow-2xl print:hidden">
      <h1 className="text-3xl font-bold text-center text-gray-900 mb-6">Excerpt Image Creator</h1>
      
      <DimensionControls
        preset={appState.dimensionPreset}
        customDimensions={appState.customDimensions}
        onPresetChange={handlePresetChange}
        onCustomDimensionChange={handleCustomDimensionChange}
      />

      <BackgroundControls
        color={appState.backgroundColor}
        image={appState.backgroundImage}
        dimness={appState.backgroundImageDimness}
        onColorChange={handleBgColorChange}
        onImageUpload={handleBgImageUpload}
        onDimnessChange={handleBgImageDimnessChange}
      />

      <Section title="3. Text Content & Style">
        <StyledInput
          label="AI Model Used (e.g., Gemini, ChatGPT-4o)"
          id="aiModelName"
          type="text"
          value={appState.aiModelName}
          onChange={handleAiModelNameChange}
          placeholder="Enter AI model name"
        />
        <div className="mt-3 mb-6">
          <TypographyControls
            styleState={appState.aiModelDisplayStyle}
            onStyleChange={handleAiModelDisplayStyleChange}
            elementName="Model Name Display"
            availableFonts={availableFonts}
          />
        </div>

        <TextElementControls
          idPrefix="charName"
          label="AI Character Name"
          textStyle={appState.aiCharacterName}
          onTextStyleChange={handleCharacterNameChange}
          availableFonts={availableFonts}
        />
        <TextElementControls
          idPrefix="content"
          label="AI Novel Content"
          textStyle={appState.aiContent}
          onTextStyleChange={handleContentChange}
          isTextarea
          availableFonts={availableFonts}
        />
      </Section>

      <CustomFontControls
        rules={appState.customFontRules}
        onRulesChange={handleCustomFontRulesChange}
      />

      <LayoutControls
        layout={appState.layout}
        onLayoutChange={handleLayoutChange}
      />
      
      <div className="pt-6 space-y-3">
        <StyledButton
          onClick={onDownloadImage} 
          variant="primary"
          className="w-full"
          aria-label="Download the generated image"
        >
          Download Image
        </StyledButton>
        <StyledButton
          onClick={handleClearAll}
          variant="danger"
          className="w-full"
          aria-label="Clear all settings and reset to default"
        >
          Clear All Settings
        </StyledButton>
      </div>
    </div>
  );
};

export default ControlsPanel;