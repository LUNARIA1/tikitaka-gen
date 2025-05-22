
import React, { useState, useEffect } from 'react';
import { AppState, TextStyle, DimensionPreset, LayoutStyle, FontOption, DisplayTextStyle, ContentDisplayType, LinePair } from '../types';
import DimensionControls from './controls/DimensionControls';
import BackgroundControls from './controls/BackgroundControls';
import TextElementControls from './controls/TextElementControls';
import LayoutControls from './controls/LayoutControls';
import CustomFontControls from './controls/CustomFontControls';
import TypographyControls from './controls/TypographyControls';
import StyledInput from './forms/StyledInput'; 
import StyledTextarea from './forms/StyledTextarea'; 
import StyledButton from './forms/StyledButton'; 
import Section from './Section';
import { INITIAL_APP_STATE } from '../constants';
import { GoogleGenAI } from '@google/genai'; 

interface ControlsPanelProps {
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
  availableFonts: FontOption[];
  onDownloadImage: () => void; 
}

const ControlsPanel: React.FC<ControlsPanelProps> = ({ appState, setAppState, availableFonts, onDownloadImage }) => {
  
  const [lineCustomizationVisible, setLineCustomizationVisible] = useState<Record<string, boolean>>({});

  // Local states for numeric inputs
  const [translationMarginTopInput, setTranslationMarginTopInput] = useState(String(appState.translationMarginTop));
  const [originalLineToTranslationSpacingInput, setOriginalLineToTranslationSpacingInput] = useState(String(appState.originalLineToTranslationSpacing));
  const [interPairSpacingInput, setInterPairSpacingInput] = useState(String(appState.interPairSpacing));
  const [spacingAfterCharacterNameInput, setSpacingAfterCharacterNameInput] = useState(String(appState.spacingAfterCharacterName));
  const [spacingAfterModelNameInput, setSpacingAfterModelNameInput] = useState(String(appState.spacingAfterModelName));


  useEffect(() => setTranslationMarginTopInput(String(appState.translationMarginTop)), [appState.translationMarginTop]);
  useEffect(() => setOriginalLineToTranslationSpacingInput(String(appState.originalLineToTranslationSpacing)), [appState.originalLineToTranslationSpacing]);
  useEffect(() => setInterPairSpacingInput(String(appState.interPairSpacing)), [appState.interPairSpacing]);
  useEffect(() => setSpacingAfterCharacterNameInput(String(appState.spacingAfterCharacterName)), [appState.spacingAfterCharacterName]);
  useEffect(() => setSpacingAfterModelNameInput(String(appState.spacingAfterModelName)), [appState.spacingAfterModelName]);


  const toggleLineCustomization = (pairId: string) => {
    setLineCustomizationVisible(prev => ({
      ...prev,
      [pairId]: !prev[pairId]
    }));
  };

  const handleAiModelNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAppState(prev => ({ ...prev, aiModelName: e.target.value }));
  };

  const handleAiModelDisplayStyleChange = <K extends keyof DisplayTextStyle>(
    key: K,
    value: DisplayTextStyle[K] | undefined
  ) => {
    setAppState(prev => {
      const newStyle = { ...prev.aiModelDisplayStyle };
      if (value === undefined) {
        if (key === 'fontSize') {
          newStyle[key] = INITIAL_APP_STATE.aiModelDisplayStyle[key];
        }
        // Add other resettable numeric properties if any
      } else {
        newStyle[key] = value;
      }
      return { ...prev, aiModelDisplayStyle: newStyle };
    });
  };

  const handleCharacterNameChange = (newStyle: TextStyle) => {
    setAppState(prev => ({ ...prev, aiCharacterName: newStyle }));
  };

  const handleOriginalTextStyleChange = <K extends keyof Omit<TextStyle, 'text'>>(key: K, value: Omit<TextStyle, 'text'>[K] | undefined) => {
    setAppState(prev => {
      const newStyle = { ...prev.originalTextStyle };
      if (value === undefined) {
         if (key === 'fontSize') { 
            newStyle[key] = INITIAL_APP_STATE.originalTextStyle[key];
         }
      } else {
         newStyle[key] = value;
      }
      return { ...prev, originalTextStyle: newStyle};
    });
  };
  
  const handleTranslatedTextStyleChange = <K extends keyof Omit<TextStyle, 'text'>>(key: K, value: Omit<TextStyle, 'text'>[K] | undefined) => {
    setAppState(prev => {
      const newStyle = { ...prev.translatedTextStyle };
       if (value === undefined) {
         if (key === 'fontSize') {
            newStyle[key] = INITIAL_APP_STATE.translatedTextStyle[key];
         }
      } else {
         newStyle[key] = value;
      }
      return { ...prev, translatedTextStyle: newStyle };
    });
  };

  const handleBlockOriginalTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAppState(prev => ({ ...prev, blockOriginalText: e.target.value }));
  };

  const handleBlockTranslationTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAppState(prev => ({ ...prev, blockTranslationText: e.target.value }));
  };
  
  const handleNumericInputBlur = (
    field: 'translationMarginTop' | 'originalLineToTranslationSpacing' | 'interPairSpacing' | 'spacingAfterCharacterName' | 'spacingAfterModelName',
    inputValue: string,
    setLocalInputState: React.Dispatch<React.SetStateAction<string>>
  ) => {
    let numValue = parseInt(inputValue, 10);
    let defaultValue = 0; 
    switch(field) {
        case 'translationMarginTop': defaultValue = INITIAL_APP_STATE.translationMarginTop; break;
        case 'originalLineToTranslationSpacing': defaultValue = INITIAL_APP_STATE.originalLineToTranslationSpacing; break;
        case 'interPairSpacing': defaultValue = INITIAL_APP_STATE.interPairSpacing; break;
        case 'spacingAfterCharacterName': defaultValue = INITIAL_APP_STATE.spacingAfterCharacterName; break;
        case 'spacingAfterModelName': defaultValue = INITIAL_APP_STATE.spacingAfterModelName; break;
    }

    if (isNaN(numValue) || numValue < 0) { 
      numValue = defaultValue;
    }
    
    setLocalInputState(String(numValue)); 
    setAppState(prev => ({ ...prev, [field]: numValue }));
  };


  const handleContentDisplayTypeChange = (type: ContentDisplayType) => {
    setAppState(prev => ({ ...prev, contentDisplayType: type }));
  };

  const handleAddLinePair = () => {
    setAppState(prev => ({
      ...prev,
      linePairs: [...prev.linePairs, { 
        id: Date.now().toString() + Math.random().toString(), 
        original: '', 
        translation: '',
      }]
    }));
  };

  const handleRemoveLinePair = (id: string) => {
    setAppState(prev => ({
      ...prev,
      linePairs: prev.linePairs.filter(pair => pair.id !== id)
    }));
    setLineCustomizationVisible(prevVis => {
      const newVisibility = {...prevVis};
      delete newVisibility[id];
      return newVisibility;
    });
  };

  const handleLinePairChange = (id: string, field: 'original' | 'translation', value: string) => {
    setAppState(prev => ({
      ...prev,
      linePairs: prev.linePairs.map(pair => pair.id === id ? { ...pair, [field]: value } : pair)
    }));
  };
  
  const handleLineSpecificStyleChange = (
    pairId: string,
    styleProperty: 'originalLineStyle' | 'translatedLineStyle',
    key: keyof Omit<TextStyle, 'text'>,
    value: Omit<TextStyle, 'text'>[keyof Omit<TextStyle, 'text'>] | undefined
  ) => {
    setAppState(prev => ({
      ...prev,
      linePairs: prev.linePairs.map(p => {
        if (p.id === pairId) {
          const updatedStylePart = { ...(p[styleProperty] || {}) };
          if (value === undefined) {
            delete (updatedStylePart as any)[key];
          } else {
            (updatedStylePart as any)[key] = value;
          }
          const newSpecificStyle = Object.keys(updatedStylePart).length > 0 ? updatedStylePart : undefined;
          return { ...p, [styleProperty]: newSpecificStyle };
        }
        return p;
      }),
    }));
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
    setAppState(prev => ({ ...prev, backgroundImage: image, imageGenerationError: null })); // Clear error on manual upload
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
    setTranslationMarginTopInput(String(INITIAL_APP_STATE.translationMarginTop));
    setOriginalLineToTranslationSpacingInput(String(INITIAL_APP_STATE.originalLineToTranslationSpacing));
    setInterPairSpacingInput(String(INITIAL_APP_STATE.interPairSpacing));
    setSpacingAfterCharacterNameInput(String(INITIAL_APP_STATE.spacingAfterCharacterName));
    setSpacingAfterModelNameInput(String(INITIAL_APP_STATE.spacingAfterModelName));
    setLineCustomizationVisible({});
    setAppState(INITIAL_APP_STATE);
  };

  // AI Image Generation handlers
  const handleBaseImageGenerationPromptChange = (prompt: string) => { // Added
    setAppState(prev => ({ ...prev, baseImageGenerationPrompt: prompt }));
  };

  const handleImageGenerationPromptChange = (prompt: string) => {
    setAppState(prev => ({ ...prev, imageGenerationPrompt: prompt }));
  };

  const handleGenerateImage = async () => {
    if (!appState.imageGenerationPrompt.trim()) {
      setAppState(prev => ({ ...prev, imageGenerationError: "Image Prompt cannot be empty." }));
      return;
    }

    setAppState(prev => ({ ...prev, isGeneratingImage: true, imageGenerationError: null }));

    const fullPrompt = appState.imageGenerationPrompt.trim();

      const ai = new GoogleGenAI({ apiKey: appState.baseImageGenerationPrompt });
      const response = await ai.models.generateImages({
        model: 'imagen-3.0-generate-002',
        prompt: fullPrompt, // Use combined prompt
        config: { numberOfImages: 1, outputMimeType: 'image/jpeg' },
      });

      if (response.generatedImages && response.generatedImages.length > 0 && response.generatedImages[0].image?.imageBytes) {
        const base64ImageBytes = response.generatedImages[0].image.imageBytes;
        const imageUrl = `data:image/jpeg;base64,${base64ImageBytes}`;
        setAppState(prev => ({ ...prev, backgroundImage: imageUrl, backgroundImageDimness: 0 })); 
      } else {
        throw new Error("No image data received from API.");
      }
    } catch (error: any) {
      console.error("Error generating image with Imagen:", error);
      const errorMessage = error.message || "An unknown error occurred during image generation.";
      if (error.message && error.message.includes('API_KEY')) {
         setAppState(prev => ({ ...prev, imageGenerationError: "API Key is missing or invalid. Please ensure it is correctly configured in the environment."}));
      } else {
        setAppState(prev => ({ ...prev, imageGenerationError: errorMessage }));
      }
    } finally {
      setAppState(prev => ({ ...prev, isGeneratingImage: false }));
    }
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
        // AI Image Generation Props
        baseImageGenerationPrompt={appState.baseImageGenerationPrompt} // Pass new state
        onBaseImageGenerationPromptChange={handleBaseImageGenerationPromptChange} // Pass new handler
        imageGenerationPrompt={appState.imageGenerationPrompt}
        isGeneratingImage={appState.isGeneratingImage}
        imageGenerationError={appState.imageGenerationError}
        onImageGenerationPromptChange={handleImageGenerationPromptChange}
        onGenerateImage={handleGenerateImage}
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
            globalDefaults={INITIAL_APP_STATE.aiModelDisplayStyle}
          />
        </div>

        <TextElementControls
          idPrefix="charName"
          label="AI Character Name"
          textStyle={appState.aiCharacterName}
          onTextStyleChange={handleCharacterNameChange}
          availableFonts={availableFonts}
        />

        <div className="mt-6 pt-4 border-t border-gray-200">
            <h4 className="text-md font-semibold text-gray-700 mb-3">Inter-Element Spacing</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <StyledInput
                    label="Spacing After Character Name (px)"
                    id="spacingAfterCharacterName"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={spacingAfterCharacterNameInput}
                    onChange={(e) => setSpacingAfterCharacterNameInput(e.target.value)}
                    onBlur={() => handleNumericInputBlur('spacingAfterCharacterName', spacingAfterCharacterNameInput, setSpacingAfterCharacterNameInput)}
                />
                <StyledInput
                    label="Spacing After Model Name (px)"
                    id="spacingAfterModelName"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={spacingAfterModelNameInput}
                    onChange={(e) => setSpacingAfterModelNameInput(e.target.value)}
                    onBlur={() => handleNumericInputBlur('spacingAfterModelName', spacingAfterModelNameInput, setSpacingAfterModelNameInput)}
                />
            </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="text-md font-semibold text-gray-700 mb-3">Novel Content Mode</h4>
          <div className="flex space-x-4 mb-4">
            {(Object.values(ContentDisplayType) as ContentDisplayType[]).map((type) => (
              <label key={type} className="flex items-center space-x-2 cursor-pointer p-2 rounded-md hover:bg-gray-100 transition-colors">
                <input
                  type="radio"
                  name="contentDisplayType"
                  value={type}
                  checked={appState.contentDisplayType === type}
                  onChange={() => handleContentDisplayTypeChange(type)}
                  className="form-radio h-4 w-4 text-black focus:ring-black border-gray-300"
                />
                <span className="text-sm text-gray-700">{type}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 mb-6">
          <TypographyControls
            styleState={appState.originalTextStyle}
            onStyleChange={handleOriginalTextStyleChange}
            elementName="Global Original Text Style"
            availableFonts={availableFonts}
            globalDefaults={INITIAL_APP_STATE.originalTextStyle}
          />
          <TypographyControls
            styleState={appState.translatedTextStyle}
            onStyleChange={handleTranslatedTextStyleChange}
            elementName="Global Translated Text Style"
            availableFonts={availableFonts}
            globalDefaults={INITIAL_APP_STATE.translatedTextStyle}
          />
        </div>
        
        {appState.contentDisplayType === ContentDisplayType.BLOCK && (
          <div className="space-y-4 p-4 border border-gray-200 rounded-lg mt-4">
            <h4 className="text-sm font-semibold text-gray-600 mb-2">Block Content Input</h4>
            <StyledTextarea
              label="Original Content (Block)"
              id="blockOriginalText"
              value={appState.blockOriginalText}
              onChange={handleBlockOriginalTextChange}
              rows={6}
              placeholder="Enter original novel content here..."
            />
            <StyledTextarea
              label="Translated Content (Block)"
              id="blockTranslationText"
              value={appState.blockTranslationText}
              onChange={handleBlockTranslationTextChange}
              rows={6}
              placeholder="Enter translated novel content here..."
            />
            <StyledInput
              label="Margin Above Block Translation (px)"
              id="translationMarginTop"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={translationMarginTopInput}
              onChange={(e) => setTranslationMarginTopInput(e.target.value)}
              onBlur={() => handleNumericInputBlur('translationMarginTop', translationMarginTopInput, setTranslationMarginTopInput)}
            />
          </div>
        )}

        {appState.contentDisplayType === ContentDisplayType.PAIRED_LINES && (
          <div className="space-y-4 p-4 border border-gray-200 rounded-lg mt-4">
            <h4 className="text-sm font-semibold text-gray-600 mb-3">Paired Lines Content & Spacing</h4>
            {appState.linePairs.map((pair, index) => (
              <div key={pair.id} className="p-3 border border-gray-300 rounded-md space-y-3 bg-white shadow-sm">
                 <p className="text-xs font-medium text-gray-500">Line Pair #{index + 1}</p>
                <StyledTextarea
                  label={`Original Line #${index + 1}`}
                  id={`pairedOriginal-${pair.id}`}
                  value={pair.original}
                  onChange={(e) => handleLinePairChange(pair.id, 'original', e.target.value)}
                  placeholder="Original line"
                  rows={2}
                />
                <StyledTextarea
                  label={`Translated Line #${index + 1}`}
                  id={`pairedTranslation-${pair.id}`}
                  value={pair.translation}
                  onChange={(e) => handleLinePairChange(pair.id, 'translation', e.target.value)}
                  placeholder="Translated line"
                  rows={2}
                />
                <StyledButton
                  type="button"
                  variant="secondary"
                  onClick={() => toggleLineCustomization(pair.id)}
                  className="w-full text-xs py-1.5 mb-2"
                  aria-expanded={lineCustomizationVisible[pair.id] || false}
                  aria-controls={`line-customization-${pair.id}`}
                >
                  {lineCustomizationVisible[pair.id] ? 'Hide Specific Styles' : 'Customize Specific Styles'}
                </StyledButton>

                {lineCustomizationVisible[pair.id] && (
                  <div id={`line-customization-${pair.id}`} className="space-y-3 mt-2 pt-3 border-t border-gray-200">
                    <TypographyControls
                      elementName={`Pair #${index + 1} Original Specific Style`}
                      styleState={pair.originalLineStyle || {}}
                      onStyleChange={(key, value) => handleLineSpecificStyleChange(pair.id, 'originalLineStyle', key, value)}
                      availableFonts={availableFonts}
                      globalDefaults={appState.originalTextStyle}
                    />
                    <TypographyControls
                      elementName={`Pair #${index + 1} Translated Specific Style`}
                      styleState={pair.translatedLineStyle || {}}
                      onStyleChange={(key, value) => handleLineSpecificStyleChange(pair.id, 'translatedLineStyle', key, value)}
                      availableFonts={availableFonts}
                      globalDefaults={appState.translatedTextStyle}
                    />
                  </div>
                )}
                <StyledButton
                  type="button"
                  variant="danger"
                  onClick={() => handleRemoveLinePair(pair.id)}
                  className="w-full text-xs py-1.5 mt-2"
                >
                  Remove Pair #{index + 1}
                </StyledButton>
              </div>
            ))}
            <StyledButton
              type="button"
              variant="secondary"
              onClick={handleAddLinePair}
              className="w-full"
            >
              + Add Line Pair
            </StyledButton>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <StyledInput
                label="Spacing: Original to Translation (px)"
                id="originalToTranslationSpacing"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={originalLineToTranslationSpacingInput}
                onChange={(e) => setOriginalLineToTranslationSpacingInput(e.target.value)}
                onBlur={() => handleNumericInputBlur('originalLineToTranslationSpacing', originalLineToTranslationSpacingInput, setOriginalLineToTranslationSpacingInput)}
              />
              <StyledInput
                label="Spacing: Between Pairs (px)"
                id="interPairSpacing"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={interPairSpacingInput}
                onChange={(e) => setInterPairSpacingInput(e.target.value)}
                onBlur={() => handleNumericInputBlur('interPairSpacing', interPairSpacingInput, setInterPairSpacingInput)}
              />
            </div>
          </div>
        )}
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