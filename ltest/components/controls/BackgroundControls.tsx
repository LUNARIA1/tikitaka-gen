
import React, { useRef } from 'react';
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
  baseImageGenerationPrompt: string; // Added
  onBaseImageGenerationPromptChange: (prompt: string) => void; // Added
  imageGenerationPrompt: string;
  isGeneratingImage: boolean;
  imageGenerationError: string | null;
  onImageGenerationPromptChange: (prompt: string) => void;
  onGenerateImage: () => void;
}

const BackgroundControls: React.FC<BackgroundControlsProps> = ({
  color,
  image,
  dimness,
  onColorChange,
  onImageUpload,
  onDimnessChange,
  baseImageGenerationPrompt, // Added
  onBaseImageGenerationPromptChange, // Added
  imageGenerationPrompt,
  isGeneratingImage,
  imageGenerationError,
  onImageGenerationPromptChange,
  onGenerateImage,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageUpload(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
    // Reset file input to allow re-uploading the same file
    if (event.target) {
        event.target.value = '';
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

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

      <details className="mt-4 group">
        <summary className="text-sm font-medium text-gray-700 cursor-pointer hover:text-black list-none">
          <span className="group-open:hidden">▶ Generate Background with AI</span>
          <span className="hidden group-open:inline">▼ Generate Background with AI</span>
        </summary>
        <div className="mt-3 pt-3 border-t border-gray-200 space-y-3">
          <StyledTextarea
            label="Base Prompt Prefix (Prepended to your prompt)"
            id="baseImageGenerationPrompt"
            value={baseImageGenerationPrompt}
            onChange={(e) => onBaseImageGenerationPromptChange(e.target.value)}
            placeholder="e.g., masterpiece, high quality, "
            rows={2}
            disabled={isGeneratingImage}
            className="text-sm"
          />
          <StyledTextarea
            label="Image Prompt"
            id="imageGenerationPrompt"
            value={imageGenerationPrompt}
            onChange={(e) => onImageGenerationPromptChange(e.target.value)}
            placeholder="e.g., A mystical forest at twilight, painted in watercolors"
            rows={3}
            disabled={isGeneratingImage}
          />
          <StyledButton
            type="button"
            onClick={onGenerateImage}
            disabled={isGeneratingImage || !imageGenerationPrompt.trim()}
            className="w-full"
          >
            {isGeneratingImage ? 'Generating...' : 'Generate Image'}
          </StyledButton>
          {imageGenerationError && (
            <p className="text-sm text-red-600" role="alert">Error: {imageGenerationError}</p>
          )}
           <p className="text-xs text-gray-500 mt-1">
            Powered by Imagen 3. Ensure API Key is configured in the environment.
          </p>
        </div>
      </details>
    </Section>
  );
};

export default BackgroundControls;