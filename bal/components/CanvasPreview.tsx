
import React from 'react';
import { AppState, TextStyle, DimensionPreset, Dimensions, DisplayTextStyle, ContentDisplayType, LinePair } from '../types';
import { DIMENSION_PRESETS_MAP, DEFAULT_CUSTOM_DIMENSIONS } from '../constants';

interface CanvasTextElementProps {
  text: string;
  style: Omit<TextStyle, 'text'>; 
  className?: string;
  marginTop?: number;
  marginBottom?: number;
}

const CanvasTextElement: React.FC<CanvasTextElementProps> = ({ text, style, className, marginTop, marginBottom }) => {
  if (!text || text.trim() === '') return null;

  const fontFamily = style.fontFamily || '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
  const textElementStyle: React.CSSProperties = {
    fontFamily: fontFamily,
    fontSize: `${style.fontSize}px`,
    color: style.color,
    fontWeight: style.isBold ? 'bold' : 'normal',
    fontStyle: style.isItalic ? 'italic' : 'normal',
    lineHeight: 1.5, 
    whiteSpace: 'pre-wrap', 
    wordBreak: 'break-word',
  };

  if (marginTop !== undefined) {
    textElementStyle.marginTop = `${marginTop}px`;
  }
  if (marginBottom !== undefined) {
    textElementStyle.marginBottom = `${marginBottom}px`;
  }

  return (
    <p style={textElementStyle} className={className}>
      {text}
    </p>
  );
};

interface CanvasPreviewProps {
  appState: AppState;
  canvasRef: React.RefObject<HTMLDivElement>;
}

const CanvasPreview: React.FC<CanvasPreviewProps> = ({ appState, canvasRef }) => {
  const {
    aiModelName,
    aiModelDisplayStyle,
    aiCharacterName,
    spacingAfterCharacterName,
    spacingAfterModelName,
    
    contentDisplayType,
    blockOriginalText,
    blockTranslationText,
    translationMarginTop,
    linePairs,
    originalLineToTranslationSpacing,
    interPairSpacing,
    originalTextStyle, // Global original style
    translatedTextStyle, // Global translated style

    dimensionPreset,
    customDimensions,
    backgroundColor,
    backgroundImage,
    backgroundImageDimness,
    layout,
  } = appState;

  const getCanvasDimensions = (): Dimensions => {
    if (dimensionPreset === DimensionPreset.CUSTOM) {
      return customDimensions;
    }
    return DIMENSION_PRESETS_MAP[dimensionPreset] || DEFAULT_CUSTOM_DIMENSIONS;
  };

  const canvasDimensions = getCanvasDimensions();
  
  const modelTextOnCanvasStyle: TextStyle = { 
    ...aiModelDisplayStyle,
    text: aiModelName,
  };

  const canvasStyle: React.CSSProperties = {
    width: `${canvasDimensions.width}px`,
    height: `${canvasDimensions.height}px`,
    backgroundColor: backgroundImage ? 'transparent' : backgroundColor,
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
    borderRadius: '8px',
    transition: 'width 0.3s ease, height 0.3s ease, background-color 0.3s ease',
  };

  const backgroundImageStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    zIndex: 1,
  };

  const imageOverlayStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: `rgba(0, 0, 0, ${backgroundImageDimness / 100})`,
    zIndex: 2,
    display: backgroundImage ? 'block' : 'none',
  };

  const contentAreaStyle: React.CSSProperties = {
    position: 'absolute',
    top: layout.centerAll ? '0' : `${layout.paddingTop}px`,
    right: layout.centerAll ? '0' : `${layout.paddingRight}px`,
    bottom: layout.centerAll ? '0' : `${layout.paddingBottom}px`,
    left: layout.centerAll ? '0' : `${layout.paddingLeft}px`,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: layout.verticalAlign,
    alignItems: layout.horizontalAlign === 'left' ? 'flex-start' : layout.horizontalAlign === 'right' ? 'flex-end' : 'center',
    textAlign: layout.horizontalAlign,
    zIndex: 3,
    padding: layout.centerAll ? `${Math.min(canvasDimensions.width, canvasDimensions.height) * 0.05}px` : '0px',
    boxSizing: 'border-box',
  };


  return (
    <div className="flex-grow flex items-center justify-center p-4 md:p-6 bg-stone-200 rounded-xl shadow-inner min-h-[400px] md:min-h-0">
      <div style={canvasStyle} ref={canvasRef} id="canvas-to-download">
        {backgroundImage && <div style={backgroundImageStyle}></div>}
        <div style={imageOverlayStyle}></div>
        <div style={contentAreaStyle}>
          <div className="space-y-0"> 
            {aiCharacterName.text && (
              <CanvasTextElement 
                text={aiCharacterName.text}
                style={{
                  fontFamily: aiCharacterName.fontFamily,
                  fontSize: aiCharacterName.fontSize,
                  color: aiCharacterName.color,
                  isBold: aiCharacterName.isBold,
                  isItalic: aiCharacterName.isItalic,
                }} 
                marginBottom={spacingAfterCharacterName > 0 ? spacingAfterCharacterName : undefined}
              />
            )}
            
            {modelTextOnCanvasStyle.text && (
              <CanvasTextElement 
                text={modelTextOnCanvasStyle.text}
                style={aiModelDisplayStyle} 
                className="opacity-80"
                marginBottom={spacingAfterModelName > 0 ? spacingAfterModelName : undefined} 
              />
            )}

            {contentDisplayType === ContentDisplayType.BLOCK && (
              <>
                <CanvasTextElement text={blockOriginalText} style={originalTextStyle} />
                {blockTranslationText && (
                  <CanvasTextElement 
                    text={blockTranslationText} 
                    style={translatedTextStyle} 
                    marginTop={translationMarginTop} 
                  />
                )}
              </>
            )}

            {contentDisplayType === ContentDisplayType.PAIRED_LINES && linePairs.map((pair, index) => {
              const finalOriginalLineStyle: Omit<TextStyle, 'text'> = {
                ...originalTextStyle, // Global base
                ...(pair.originalLineStyle || {}), // Specific overrides
              };
              const finalTranslatedLineStyle: Omit<TextStyle, 'text'> = {
                ...translatedTextStyle, // Global base
                ...(pair.translatedLineStyle || {}), // Specific overrides
              };

              return (
                <div key={pair.id} style={index < linePairs.length -1 ? { marginBottom: `${interPairSpacing}px` } : {}}>
                  <CanvasTextElement text={pair.original} style={finalOriginalLineStyle} />
                  {pair.translation && (
                    <CanvasTextElement 
                      text={pair.translation} 
                      style={finalTranslatedLineStyle} 
                      marginTop={originalLineToTranslationSpacing} 
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CanvasPreview;
