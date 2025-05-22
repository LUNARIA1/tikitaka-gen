import React, { useRef, useState } from 'react';
import StyledInput from '../forms/StyledInput';
import StyledButton from '../forms/StyledButton';
import Section from '../Section';
import StyledTextarea from '../forms/StyledTextarea'; 

interface BackgroundControlsProps {
  color: string;
  image: string | null;
  dimness: number;
  onColorChange: (color: string) => void;
  onImageUpload: (image: string | null) => void;
  onDimnessChange: (dimness: number) => void;
  
  // AI Image Generation Props
  defaultImageGenerationPrefixPrompt: string;
  imageGenerationPrompt: string;
  isGeneratingImage: boolean;
  imageGenerationError: string | null;
  onDefaultImageGenerationPrefixPromptChange: (prompt: string) => void;
  onImageGenerationPromptChange: (prompt: string) => void;
  onGenerateImage: () => void;
  // Add API key props
  imagenApiKey: string;
  onImagenApiKeyChange: (apiKey: string) => void;
}

const BackgroundControls: React.FC<BackgroundControlsProps> = ({
  color,
  image,
  dimness,
  onColorChange,
  onImageUpload,
  onDimnessChange,
  defaultImageGenerationPrefixPrompt,
  imageGenerationPrompt,
  isGeneratingImage,
  imageGenerationError,
  onDefaultImageGenerationPrefixPromptChange,
  onImageGenerationPromptChange,
  onGenerateImage,
  imagenApiKey,
  onImagenApiKeyChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditingDefaultPrompt, setIsEditingDefaultPrompt] = useState(false);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageUpload(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
    if (event.target) {
        event.target.value = '';
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const userEnteredPromptTrimmed = imageGenerationPrompt.trim();
  const defaultPrefixTrimmed = defaultImageGenerationPrefixPrompt.trim();
  const canEffectivelyGenerate = !!(userEnteredPromptTrimmed || defaultPrefixTrimmed);

  return (
    <Section title="2. Background Style">
      <StyledInput
        label="Background Color"
        id="bgColor"
        type="color"
        value={color}
        onChange={(e) => onColorChange(e.target.value)}
        className="h-12"
      />
      <div>
        <p className="block text-sm font-medium text-gray-700 mb-1">Background Image</p>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          ref={fileInputRef}
          className="hidden"
          aria-label="Upload background image"
        />
        <div className="flex space-x-2">
          <StyledButton type="button" onClick={triggerFileInput} variant="secondary" className="w-full">
            Upload Image
          </StyledButton>
          {image && (
            <StyledButton type="button" onClick={() => onImageUpload(null)} variant="danger" className="w-full">
              Remove Image
            </StyledButton>
          )}
        </div>
      </div>

      {image && (
        <div className="mt-2">
          <StyledInput
            label={`Image Dimness (${dimness}%)`}
            id="bgDimness"
            type="range"
            min="0"
            max="100"
            value={dimness}
            onChange={(e) => onDimnessChange(parseInt(e.target.value, 10))}
          />
        </div>
      )}

      <details className="mt-4 group" open>
        <summary className="text-sm font-medium text-gray-700 cursor-pointer hover:text-black list-none">
          <span className="group-open:hidden">▶ Generate Background with AI</span>
          <span className="hidden group-open:inline">▼ Generate Background with AI</span>
        </summary>
        <div className="mt-3 pt-3 border-t border-gray-200 space-y-3">
          <StyledTextarea
            label="Image Prompt (What you want to see)"
            id="imageGenerationPrompt"
            value={imageGenerationPrompt}
            onChange={(e) => onImageGenerationPromptChange(e.target.value)}
            placeholder="e.g., A mystical forest at twilight, painted in watercolors"
            rows={3}
            disabled={isGeneratingImage}
          />
           <div className="text-right">
            <button
              type="button"
              onClick={() => setIsEditingDefaultPrompt(!isEditingDefaultPrompt)}
              className="text-xs text-blue-600 hover:text-blue-800 underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
              aria-expanded={isEditingDefaultPrompt}
              aria-controls="default-prompt-editor"
            >
              {isEditingDefaultPrompt ? 'Hide Default Prompt Editor' : 'Edit Default Prompt Prefix'}
            </button>
          </div>

          {isEditingDefaultPrompt && (
            <div id="default-prompt-editor" className="mt-2 p-3 bg-gray-50 rounded-md border border-gray-200">
              <StyledTextarea
                label="Default Prompt Prefix (automatically added before your prompt)"
                id="defaultImageGenerationPrefixPrompt"
                value={defaultImageGenerationPrefixPrompt}
                onChange={(e) => onDefaultImageGenerationPrefixPromptChange(e.target.value)}
                placeholder="e.g., masterpiece, high quality, "
                rows={2}
                disabled={isGeneratingImage}
                className="text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">This prefix is added to your prompt. Clear this field to remove the prefix.</p>
            </div>
          )}

          <StyledButton
            type="button"
            onClick={onGenerateImage}
            disabled={isGeneratingImage || !canEffectivelyGenerate}
            className="w-full"
            aria-live="polite"
          >
            {isGeneratingImage ? 'Generating...' : 'Generate Image with AI'}
          </StyledButton>
          {imageGenerationError && (
            <p className="text-sm text-red-600" role="alert">Error: {imageGenerationError}</p>
          )}
           <p className="text-xs text-gray-500 mt-1">
            Powered by Imagen 3. Enter your API Key below to use this feature.
          </p>
          
          <div className="mt-3">
            <StyledInput
              label="Imagen API Key"
              id="imagenApiKey"
              type="password"
              value={imagenApiKey}
              onChange={(e) => onImagenApiKeyChange(e.target.value)}
              placeholder="Enter your Imagen API Key"
              className="font-mono text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              Your API key will be used only in this session and is not stored permanently.
            </p>
          </div>
        </div>
      </details>

      <div className="mt-6">
        <StyledInput
          label="Imagen API Key"
          id="imagenApiKey"
          type="text"
          value={imagenApiKey}
          onChange={(e) => onImagenApiKeyChange(e.target.value)}
          placeholder="Enter your Imagen API key"
          className="h-12"
        />
      </div>
    </Section>
  );
};

export default BackgroundControls;