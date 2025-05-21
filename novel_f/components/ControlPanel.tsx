
import React from 'react';
import { ExcerptDetails, StyleSettings, FontOption } from '../types';
import { FONT_FAMILIES, CANVAS_PRESETS } from '../constants';
import DownloadIcon from './icons/DownloadIcon';
// Using a simple inline SVG for ClearImageIcon to avoid Heroicons dependency issues in this context.
const ClearImageIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5" {...props}>
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L10 8.586 7.707 6.293a1 1 0 00-1.414 1.414L8.586 10l-2.293 2.293a1 1 0 001.414 1.414L10 11.414l2.293 2.293a1 1 0 001.414-1.414L11.414 10l2.293-2.293z" clipRule="evenodd" />
  </svg>
);

interface ControlPanelProps {
  details: ExcerptDetails;
  styles: StyleSettings;
  onDetailsChange: <K extends keyof ExcerptDetails>(key: K, value: ExcerptDetails[K]) => void;
  onStylesChange: <K extends keyof StyleSettings>(key: K, value: StyleSettings[K]) => void;
  onDownload: () => void;
  onBackgroundImageChange: (file: File | null) => void;
  currentBackgroundImageUrl: string | null;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  details,
  styles,
  onDetailsChange,
  onStylesChange,
  onDownload,
  onBackgroundImageChange,
  currentBackgroundImageUrl
}) => {
  const handleNumericStyleChange = (key: keyof StyleSettings, value: string) => {
    const numValue = parseFloat(value); // Use parseFloat for opacity
    if (!isNaN(numValue)) {
      if (key === 'fontSize' && (numValue < 0 || numValue > 500)) return;
      if ((key === 'canvasWidth' || key === 'canvasHeight') && (numValue < 0 || numValue > 3000)) return;
      if (key === 'backgroundImageOverlayOpacity' && (numValue < 0 || numValue > 1)) return;
      onStylesChange(key, numValue as any);
    } else if (value === '') {
       onStylesChange(key, 0 as any); 
    }
  };

  const handleBackgroundImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      onBackgroundImageChange(event.target.files[0]);
    } else {
      onBackgroundImageChange(null);
    }
  };

  const clearBackgroundImage = () => {
    onBackgroundImageChange(null);
    onStylesChange('backgroundImageOverlayOpacity', 0); // Reset opacity too
    const fileInput = document.getElementById('backgroundImage') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };
  
  const handlePresetDropdownChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedIndex = parseInt(event.target.value, 10);
    const preset = CANVAS_PRESETS[selectedIndex];
    if (preset) {
        onStylesChange('canvasWidth', preset.width);
        onStylesChange('canvasHeight', preset.height);
    }
  };

  const handleAutoCenterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = event.target.checked;
    onStylesChange('autoCenterText', isChecked);
    // When auto-center is enabled or disabled, the canvas drawing logic will use
    // the current styles.textAlign and styles.verticalAlign.
    // The controls for these are just disabled/enabled here.
  };

  const currentPresetIndex = CANVAS_PRESETS.findIndex(
    p => p.width === styles.canvasWidth && p.height === styles.canvasHeight && !p.isCustomPlaceholder
  );
  const dropdownSelectedPresetValue = currentPresetIndex !== -1 
    ? currentPresetIndex 
    : CANVAS_PRESETS.findIndex(p => p.isCustomPlaceholder === true);

  const arePaddingAndAlignmentDisabled = styles.autoCenterText;

  return (
    <div className="w-full md:w-[400px] bg-slate-50 p-5 shadow-lg rounded-lg space-y-6 overflow-y-auto max-h-[calc(100vh-100px)]">
      <div>
        <h2 className="text-lg font-semibold text-slate-700 mb-3">콘텐츠 입력</h2>
        <div className="space-y-3">
          <div>
            <label htmlFor="title" className="block text-xs font-medium text-slate-600 mb-1">제목</label>
            <input
              type="text"
              id="title"
              value={details.title}
              onChange={(e) => onDetailsChange('title', e.target.value)}
              className="w-full p-2 border border-slate-300 rounded shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
          <div>
            <label htmlFor="author" className="block text-xs font-medium text-slate-600 mb-1">작가</label>
            <input
              type="text"
              id="author"
              value={details.author}
              onChange={(e) => onDetailsChange('author', e.target.value)}
              className="w-full p-2 border border-slate-300 rounded shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
          <div>
            <label htmlFor="excerpt" className="block text-xs font-medium text-slate-600 mb-1">발췌문</label>
            <textarea
              id="excerpt"
              value={details.text}
              onChange={(e) => onDetailsChange('text', e.target.value)}
              rows={6}
              className="w-full p-2 border border-slate-300 rounded shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-slate-700 mb-3">스타일 설정</h2>
        <div className="space-y-3">
          <div>
            <label htmlFor="canvasPreset" className="block text-xs font-medium text-slate-600 mb-1">캔버스 크기 프리셋</label>
            <select
              id="canvasPreset"
              value={dropdownSelectedPresetValue >=0 ? dropdownSelectedPresetValue : ""}
              onChange={handlePresetDropdownChange}
              className="w-full p-2 border border-slate-300 rounded shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              {CANVAS_PRESETS.map((preset, index) => (
                <option key={preset.name} value={index}>{preset.name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="canvasWidth" className="block text-xs font-medium text-slate-600 mb-1">캔버스 너비 (px)</label>
              <input
                type="number"
                id="canvasWidth"
                value={styles.canvasWidth}
                onChange={(e) => handleNumericStyleChange('canvasWidth', e.target.value)}
                min="0" max="3000"
                className="w-full p-2 border border-slate-300 rounded shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
            <div>
              <label htmlFor="canvasHeight" className="block text-xs font-medium text-slate-600 mb-1">캔버스 높이 (px)</label>
              <input
                type="number"
                id="canvasHeight"
                value={styles.canvasHeight}
                onChange={(e) => handleNumericStyleChange('canvasHeight', e.target.value)}
                min="0" max="3000"
                className="w-full p-2 border border-slate-300 rounded shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
          </div>
          <div>
            <label htmlFor="fontFamily" className="block text-xs font-medium text-slate-600 mb-1">글꼴</label>
            <select
              id="fontFamily"
              value={styles.fontFamily}
              onChange={(e) => onStylesChange('fontFamily', e.target.value)}
              className={`w-full p-2 border border-slate-300 rounded shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm ${FONT_FAMILIES.find(f => f.value === styles.fontFamily)?.className || ''}`}
            >
              {FONT_FAMILIES.map((font: FontOption) => (
                <option key={font.name} value={font.value} className={font.className}>{font.name}</option>
              ))}
            </select>
          </div>
          <div>
              <label htmlFor="fontSize" className="block text-xs font-medium text-slate-600 mb-1">본문 글자 크기 (px)</label>
              <input
                type="number"
                id="fontSize"
                value={styles.fontSize}
                onChange={(e) => handleNumericStyleChange('fontSize', e.target.value)}
                min="0" max="500"
                className="w-full p-2 border border-slate-300 rounded shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
          </div>
           <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="textColor" className="block text-xs font-medium text-slate-600 mb-1">글자색</label>
              <input
                type="color"
                id="textColor"
                value={styles.textColor}
                onChange={(e) => onStylesChange('textColor', e.target.value)}
                className="w-full h-9 p-1 border border-slate-300 rounded shadow-sm"
              />
            </div>
            <div>
              <label htmlFor="backgroundColor" className="block text-xs font-medium text-slate-600 mb-1">배경색</label>
              <input
                type="color"
                id="backgroundColor"
                value={styles.backgroundColor}
                onChange={(e) => onStylesChange('backgroundColor', e.target.value)}
                className="w-full h-9 p-1 border border-slate-300 rounded shadow-sm"
              />
            </div>
          </div>
          <div>
            <label htmlFor="backgroundImage" className="block text-xs font-medium text-slate-600 mb-1">배경 이미지</label>
            <div className="flex items-center space-x-2">
              <input
                type="file"
                id="backgroundImage"
                accept="image/*"
                onChange={handleBackgroundImageUpload}
                className="block w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-medium file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100"
              />
              {currentBackgroundImageUrl && (
                <button onClick={clearBackgroundImage} title="배경 이미지 제거" className="p-1.5 text-slate-500 hover:text-red-600">
                  <ClearImageIcon className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
          {currentBackgroundImageUrl && (
            <div>
              <label htmlFor="backgroundImageOverlayOpacity" className="block text-xs font-medium text-slate-600 mb-1">
                배경 이미지 어둡게: {Math.round(styles.backgroundImageOverlayOpacity * 100)}%
              </label>
              <input
                type="range"
                id="backgroundImageOverlayOpacity"
                min="0"
                max="1"
                step="0.01"
                value={styles.backgroundImageOverlayOpacity}
                onChange={(e) => handleNumericStyleChange('backgroundImageOverlayOpacity', e.target.value)}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                disabled={!currentBackgroundImageUrl}
              />
            </div>
          )}

          <div className="pt-2">
            <div className="flex items-center mb-2">
              <input
                id="autoCenterText"
                type="checkbox"
                checked={styles.autoCenterText}
                onChange={handleAutoCenterChange}
                className="h-4 w-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="autoCenterText" className="ml-2 block text-sm font-medium text-slate-700">
                자동 가운데 정렬
              </label>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label htmlFor="paddingX" className="block text-xs font-medium text-slate-600 mb-1">좌우 여백</label>
              <input
                type="number"
                id="paddingX"
                value={styles.paddingX}
                onChange={(e) => handleNumericStyleChange('paddingX', e.target.value)}
                className={`w-full p-2 border border-slate-300 rounded shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm ${arePaddingAndAlignmentDisabled ? 'bg-slate-100 cursor-not-allowed' : ''}`}
                disabled={arePaddingAndAlignmentDisabled}
              />
            </div>
             <div>
              <label htmlFor="paddingTop" className="block text-xs font-medium text-slate-600 mb-1">상단 여백</label>
              <input
                type="number"
                id="paddingTop"
                value={styles.paddingTop}
                onChange={(e) => handleNumericStyleChange('paddingTop', e.target.value)}
                className={`w-full p-2 border border-slate-300 rounded shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm ${arePaddingAndAlignmentDisabled ? 'bg-slate-100 cursor-not-allowed' : ''}`}
                disabled={arePaddingAndAlignmentDisabled}
              />
            </div>
             <div>
              <label htmlFor="paddingBottom" className="block text-xs font-medium text-slate-600 mb-1">하단 여백</label>
              <input
                type="number"
                id="paddingBottom"
                value={styles.paddingBottom}
                onChange={(e) => handleNumericStyleChange('paddingBottom', e.target.value)}
                className={`w-full p-2 border border-slate-300 rounded shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm ${arePaddingAndAlignmentDisabled ? 'bg-slate-100 cursor-not-allowed' : ''}`}
                disabled={arePaddingAndAlignmentDisabled}
              />
            </div>
          </div>
          <div>
            <label htmlFor="textAlign" className="block text-xs font-medium text-slate-600 mb-1">텍스트 수평 정렬</label>
            <select
              id="textAlign"
              value={styles.textAlign}
              onChange={(e) => onStylesChange('textAlign', e.target.value as 'left' | 'center' | 'right')}
              className={`w-full p-2 border border-slate-300 rounded shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm ${arePaddingAndAlignmentDisabled ? 'bg-slate-100 cursor-not-allowed' : ''}`}
              disabled={arePaddingAndAlignmentDisabled}
            >
              <option value="left">왼쪽</option>
              <option value="center">중앙</option>
              <option value="right">오른쪽</option>
            </select>
          </div>
          <div>
            <label htmlFor="verticalAlign" className="block text-xs font-medium text-slate-600 mb-1">텍스트 수직 정렬</label>
            <select
              id="verticalAlign"
              value={styles.verticalAlign}
              onChange={(e) => onStylesChange('verticalAlign', e.target.value as 'top' | 'center' | 'bottom')}
              className={`w-full p-2 border border-slate-300 rounded shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm ${arePaddingAndAlignmentDisabled ? 'bg-slate-100 cursor-not-allowed' : ''}`}
              disabled={arePaddingAndAlignmentDisabled}
            >
              <option value="top">상단</option>
              <option value="center">중앙</option>
              <option value="bottom">하단</option>
            </select>
          </div>
        </div>
      </div>
      
      <button
        onClick={onDownload}
        className="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded shadow-md transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <DownloadIcon />
        이미지 다운로드
      </button>
    </div>
  );
};

export default ControlPanel;
