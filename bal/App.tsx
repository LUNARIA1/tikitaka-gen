
import React, { useState, useEffect, useMemo, useRef } from 'react';
import ControlsPanel from './components/ControlsPanel';
import CanvasPreview from './components/CanvasPreview';
import { AppState, FontOption, DEFAULT_FONT_FAMILIES } from './types';
import { INITIAL_APP_STATE } from './constants';
import { parseFontFamilyName } from './utils';

declare global { // To inform TypeScript about html2canvas global
  interface Window {
    html2canvas: any;
  }
}

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(INITIAL_APP_STATE);
  const canvasRef = useRef<HTMLDivElement>(null); // Ref for the canvas element

  useEffect(() => {
    const styleId = 'custom-font-styles';
    let styleElement = document.getElementById(styleId) as HTMLStyleElement | null;
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }
    const validCustomFontRules = appState.customFontRules.filter(rule => rule.trim() !== '');
    styleElement.innerHTML = validCustomFontRules.join('\n');
    
    // No cleanup needed that removes the style tag itself, 
    // just clear its content if no rules, or let it be overwritten.
    // If rules are removed, the effect re-runs and updates innerHTML.
  }, [appState.customFontRules]);

  const availableFonts = useMemo((): FontOption[] => {
    const customParsedFonts = (appState.customFontRules || [])
      .map(rule => {
        const name = parseFontFamilyName(rule);
        if (name && name.trim() !== '') {
          return { label: `${name} (Custom)`, value: name, isDefault: false };
        }
        return null;
      })
      .filter(font => font !== null) as FontOption[];
    return [...DEFAULT_FONT_FAMILIES, ...customParsedFonts];
  }, [appState.customFontRules]);

  const performImageGeneration = () => {
    if (canvasRef.current && window.html2canvas) {
      window.html2canvas(canvasRef.current, { 
        useCORS: true, 
        logging: false, 
        backgroundColor: null, 
        scale: 1, // Corrected: Changed from 2 to 1
      }).then((canvas: HTMLCanvasElement) => {
        const image = canvas.toDataURL('image/png', 1.0); 
        const link = document.createElement('a');
        link.download = 'ai-novel-excerpt.png';
        link.href = image;
        link.click();
      }).catch((err: any) => {
        console.error("Error generating image with html2canvas:", err);
        alert("Sorry, there was an error generating the image. Please check console for details.");
      });
    } else {
        // This case should ideally be caught by the polling logic, but as a fallback:
        alert("Image generation library (html2canvas) not loaded or canvas element not found even after retries.");
        if(!window.html2canvas) console.warn("html2canvas still not found on window object.");
        if(!canvasRef.current) console.warn("canvasRef.current is null.");
    }
  }

  const handleDownloadImage = (retriesLeft = 10) => {
    if (canvasRef.current && window.html2canvas) {
      performImageGeneration();
    } else if (retriesLeft > 0) {
      console.warn(`html2canvas not ready or canvasRef not set, retrying... (${retriesLeft} retries left)`);
      setTimeout(() => handleDownloadImage(retriesLeft - 1), 100); // Wait 100ms
    } else {
      alert("Image generation library (html2canvas) could not be loaded in time, or canvas element is missing. Please try refreshing the page.");
      if(!window.html2canvas) console.error("Critical: html2canvas not found on window object after all retries.");
      if(!canvasRef.current) console.error("Critical: canvasRef.current is null after all retries.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-stone-100 text-gray-900">
      <div className="w-full md:w-[450px] lg:w-[500px] md:max-h-screen md:overflow-y-auto print:hidden">
        <ControlsPanel 
          appState={appState} 
          setAppState={setAppState} 
          availableFonts={availableFonts}
          onDownloadImage={() => handleDownloadImage()} // Ensure initial call doesn't pass event args as retries
        />
      </div>
      <main className="flex-grow flex items-center justify-center p-1 md:p-0">
        <CanvasPreview appState={appState} canvasRef={canvasRef} /> {/* Pass canvas ref */}
      </main>
    </div>
  );
};

export default App;
