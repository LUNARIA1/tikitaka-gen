
import React, { useState, useRef, useCallback } from 'react';
import ControlPanel from './components/ControlPanel';
import CanvasPreview from './components/CanvasPreview';
import { ExcerptDetails, StyleSettings } from './types';
import { DEFAULT_EXCERPT_DETAILS, DEFAULT_STYLE_SETTINGS } from './constants';

const App: React.FC = () => {
  const [details, setDetails] = useState<ExcerptDetails>(DEFAULT_EXCERPT_DETAILS);
  const [styles, setStyles] = useState<StyleSettings>(() => {
    const baseSize = DEFAULT_STYLE_SETTINGS.fontSize;
    return {
      ...DEFAULT_STYLE_SETTINGS,
      titleFontSize: baseSize * 1.5,
      authorFontSize: baseSize * 0.9,
    };
  });
  const [backgroundImageUrl, setBackgroundImageUrl] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleDetailsChange = useCallback(<K extends keyof ExcerptDetails>(
    key: K,
    value: ExcerptDetails[K]
  ) => {
    setDetails((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleStylesChange = useCallback(<K extends keyof StyleSettings>(
    key: K,
    value: StyleSettings[K]
  ) => {
    setStyles((prev) => {
      const newStyles = { ...prev, [key]: value };
      if (key === 'fontSize') {
        const newBaseSize = Number(value);
        newStyles.titleFontSize = newBaseSize * 1.5;
        newStyles.authorFontSize = newBaseSize * 0.9;
      }
      return newStyles;
    });
  }, []);
  
  const handleBackgroundImageChange = useCallback((file: File | null) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBackgroundImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setBackgroundImageUrl(null);
    }
  }, []);

  const handleDownload = useCallback(() => {
    if (canvasRef.current) {
      const dataURL = canvasRef.current.toDataURL('image/png');
      const link = document.createElement('a');
      const safeTitle = details.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'novel_excerpt';
      link.download = `${safeTitle}.png`;
      link.href = dataURL;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, [details.title]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-200"> {/* Updated page background */}
      <header className="bg-white text-slate-800 p-4 shadow-sm border-b border-slate-300">
        <h1 className="text-xl md:text-2xl font-semibold text-center font-noto-sans-kr">소설 발췌짤 생성기</h1>
        <p className="text-center text-sm text-slate-500 mt-1">멋진 문장들을 아름다운 이미지로 간직하세요.</p>
      </header>

      <main className="flex-grow flex flex-col md:flex-row p-3 md:p-4 gap-3 md:gap-4">
        <ControlPanel
          details={details}
          styles={styles}
          onDetailsChange={handleDetailsChange}
          onStylesChange={handleStylesChange}
          onDownload={handleDownload}
          onBackgroundImageChange={handleBackgroundImageChange}
          currentBackgroundImageUrl={backgroundImageUrl}
        />
        <CanvasPreview 
          details={details} 
          styles={styles} 
          canvasRef={canvasRef} 
          backgroundImageUrl={backgroundImageUrl}
        />
      </main>
      
      <footer className="text-slate-500 text-center py-6 text-xs">
        © {new Date().getFullYear()} 소설 발췌짤 생성기.
      </footer>
    </div>
  );
};

export default App;
