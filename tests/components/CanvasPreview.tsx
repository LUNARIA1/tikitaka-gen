import React from 'react';
import { AppState, TextStyle, DimensionPreset, Dimensions, DisplayTextStyle } from '../types';
import { DIMENSION_PRESETS_MAP, DEFAULT_CUSTOM_DIMENSIONS } from '../constants';

interface CanvasPreviewProps {
  appState: AppState;
  canvasRef: React.RefObject<HTMLDivElement>; // For html2canvas
}

const CanvasTextElement: React.FC<{ style: TextStyle; className?: string }> = ({ style, className }) => {
  const fontFamily = style.fontFamily || '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
  return (
    <p
      style={{
        fontFamily: fontFamily,
        fontSize: `${style.fontSize}px`,
        color: style.color,
        fontWeight: style.isBold ? 'bold' : 'normal',
        fontStyle: style.isItalic ? 'italic' : 'normal',
        lineHeight: 1.5, 
        whiteSpace: 'pre-wrap', 
        wordBreak: 'break-word', 
      }}
      className={className}
    >
      {style.text}
    </p>
  );
};

const CanvasPreview: React.FC<CanvasPreviewProps> = ({ appState, canvasRef }) => {
  const {
    aiModelName,
    aiModelDisplayStyle,
    aiCharacterName,
    aiContent,
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
    ...(aiModelDisplayStyle as DisplayTextStyle),
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
      <div style={canvasStyle} ref={canvasRef} id="canvas-to-download"> {/* Added ref and ID */}
        {backgroundImage && <div style={backgroundImageStyle}></div>}
        <div style={imageOverlayStyle}></div>
        <div style={contentAreaStyle}>
          <div className="space-y-2 md:space-y-4">
            {/* Order changed: Character Name, Model Name, Content */}
            {aiCharacterName.text && <CanvasTextElement style={aiCharacterName} className="mb-2 md:mb-4" />}
            {appState.aiModelName && modelTextOnCanvasStyle.text && <CanvasTextElement style={modelTextOnCanvasStyle} className="mb-1 md:mb-2 opacity-80" />}
            {aiContent.text && <CanvasTextElement style={aiContent} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CanvasPreview;