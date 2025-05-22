
import React, { useRef } from 'react';
import StyledInput from '../forms/StyledInput';
import StyledButton from '../forms/StyledButton';
import Section from '../Section';

interface BackgroundControlsProps {
  color: string;
  image: string | null;
  dimness: number;
  onColorChange: (color: string) => void;
  onImageUpload: (image: string | null) => void;
  onDimnessChange: (dimness: number) => void;
}

const BackgroundControls: React.FC<BackgroundControlsProps> = ({
  color,
  image,
  dimness,
  onColorChange,
  onImageUpload,
  onDimnessChange,
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
    </Section>
  );
};

export default BackgroundControls;
