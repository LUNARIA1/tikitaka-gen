
import React, { useEffect, useRef } from 'react';
import { ExcerptDetails, StyleSettings } from '../types';

interface CanvasPreviewProps {
  details: ExcerptDetails;
  styles: StyleSettings;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  backgroundImageUrl: string | null;
}

const CanvasPreview: React.FC<CanvasPreviewProps> = ({ details, styles, canvasRef, backgroundImageUrl }) => {
  
  const calculateTextBlockHeight = (
    ctx: CanvasRenderingContext2D,
    text: string,
    fontConfig: { size: number; family: string; bold?: boolean; italic?: boolean; lineHeightMultiplier: number; },
    maxWidth: number
  ): number => {
    if (!text || maxWidth <=0) return 0;
    
    ctx.font = `${fontConfig.bold ? 'bold ' : ''}${fontConfig.italic ? 'italic ' : ''}${fontConfig.size}px ${fontConfig.family}`;
    const paragraphs = text.split('\n');
    let blockHeight = 0;
    const lineHeight = fontConfig.size * fontConfig.lineHeightMultiplier;

    for (const paragraph of paragraphs) {
      const words = paragraph.split(' ');
      let line = '';
      
      if (words.length === 1 && words[0] === '') {
          blockHeight += lineHeight;
          continue;
      }

      for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i] + (i === words.length - 1 ? '' : ' ');
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;

        if (testWidth > maxWidth && i > 0) {
          blockHeight += lineHeight;
          line = words[i] + ' ';
        } else {
          line = testLine;
        }
      }
      blockHeight += lineHeight;
    }
    return blockHeight;
  };
  
  const drawWrappedText = (
    ctx: CanvasRenderingContext2D,
    text: string,
    blockX: number, // Starting X for the content block
    currentY: number, // Current Y position to start drawing this line/paragraph
    blockMaxWidth: number, // Max width for text lines within the content block
    lineHeight: number,
    textAlign: 'left' | 'center' | 'right' // Alignment within the blockMaxWidth
  ): number => {
    const paragraphs = text.split('\n');
    let yPos = currentY;
    
    ctx.textAlign = textAlign; // Set canvas context textAlign for drawing

    let drawX;
    if (textAlign === 'center') {
        drawX = blockX + blockMaxWidth / 2; 
    } else if (textAlign === 'right') {
        drawX = blockX + blockMaxWidth; 
    } else { // left
        drawX = blockX; 
    }

    for (const paragraph of paragraphs) {
      const words = paragraph.split(' ');
      let line = '';
      
      if (words.length === 1 && words[0] === '') { 
          yPos += lineHeight;
          continue;
      }

      for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i] + (i === words.length - 1 ? '' : ' ');
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;

        if (testWidth > blockMaxWidth && i > 0) {
          ctx.fillText(line.trimRight(), drawX, yPos);
          line = words[i] + ' ';
          yPos += lineHeight;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line.trimRight(), drawX, yPos);
      yPos += lineHeight;
    }
    return yPos; // Return the Y position after drawing this text block
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const performDraw = (loadedBgImage: HTMLImageElement | null) => {
        canvas.width = styles.canvasWidth;
        canvas.height = styles.canvasHeight;

        // 1. Draw background color
        ctx.fillStyle = styles.backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 2. Draw background image if loaded
        if (loadedBgImage) {
            ctx.drawImage(loadedBgImage, 0, 0, canvas.width, canvas.height);
            // 2a. Draw overlay if opacity > 0
            if (styles.backgroundImageOverlayOpacity > 0) {
                ctx.fillStyle = `rgba(0, 0, 0, ${styles.backgroundImageOverlayOpacity})`;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
        }
        
        const MIN_SAFE_PADDING = Math.min(20, Math.max(5, Math.min(canvas.width * 0.05, canvas.height * 0.05)));

        let contentMaxWidth: number;
        let textBlockX: number; // The X coordinate where the text block begins
        let paddingTopForCalcs: number;
        let paddingBottomForCalcs: number;

        if (styles.autoCenterText) {
            contentMaxWidth = Math.max(0, canvas.width - 2 * MIN_SAFE_PADDING);
            textBlockX = (canvas.width - contentMaxWidth) / 2; // Center the block horizontally
            paddingTopForCalcs = MIN_SAFE_PADDING; // Used for boundary in Y calculation
            paddingBottomForCalcs = MIN_SAFE_PADDING; // Used for boundary in Y calculation
        } else {
            contentMaxWidth = Math.max(0, canvas.width - 2 * styles.paddingX);
            textBlockX = styles.paddingX;
            paddingTopForCalcs = styles.paddingTop;
            paddingBottomForCalcs = styles.paddingBottom;
        }

        // 4. Calculate total text block height for vertical alignment
        let totalEstimatedTextHeight = 0;
        const titleFontConfig = { size: styles.titleFontSize, family: styles.fontFamily, bold: true, lineHeightMultiplier: styles.lineHeightMultiplier };
        const authorFontConfig = { size: styles.authorFontSize, family: styles.fontFamily, italic: true, lineHeightMultiplier: styles.lineHeightMultiplier };
        const excerptFontConfig = { size: styles.fontSize, family: styles.fontFamily, lineHeightMultiplier: styles.lineHeightMultiplier };

        if (details.title) {
            totalEstimatedTextHeight += calculateTextBlockHeight(ctx, details.title, titleFontConfig, contentMaxWidth);
            totalEstimatedTextHeight += styles.titleFontSize * 0.5; // Spacing after title
        }
        if (details.author) {
            totalEstimatedTextHeight += calculateTextBlockHeight(ctx, details.author, authorFontConfig, contentMaxWidth);
            totalEstimatedTextHeight += styles.authorFontSize * 1.5; // Spacing after author
        }
        totalEstimatedTextHeight += calculateTextBlockHeight(ctx, details.text, excerptFontConfig, contentMaxWidth);

        // 5. Determine starting Y position (textBlockY)
        let textBlockY;
        if (styles.autoCenterText) {
            textBlockY = (canvas.height - totalEstimatedTextHeight) / 2;
            textBlockY = Math.max(paddingTopForCalcs, textBlockY); // Ensure it's not off-screen or too close to top
        } else {
            const availableHeight = canvas.height - paddingTopForCalcs - paddingBottomForCalcs;
            switch (styles.verticalAlign) {
                case 'center':
                    textBlockY = paddingTopForCalcs + Math.max(0, (availableHeight - totalEstimatedTextHeight) / 2);
                    break;
                case 'bottom':
                    textBlockY = canvas.height - paddingBottomForCalcs - totalEstimatedTextHeight;
                    break;
                case 'top':
                default:
                    textBlockY = paddingTopForCalcs;
            }
            textBlockY = Math.max(paddingTopForCalcs, textBlockY); 
        }
        
        // 6. Draw text content
        ctx.fillStyle = styles.textColor;
        ctx.textBaseline = 'top';
        let currentY = textBlockY; // Start drawing from the top of the calculated text block

        if (details.title) {
            ctx.font = `bold ${styles.titleFontSize}px ${styles.fontFamily}`;
            currentY = drawWrappedText(ctx, details.title, textBlockX, currentY, contentMaxWidth, styles.titleFontSize * styles.lineHeightMultiplier, styles.textAlign);
            currentY += styles.titleFontSize * 0.5; 
        }

        if (details.author) {
            ctx.font = `italic ${styles.authorFontSize}px ${styles.fontFamily}`;
            currentY = drawWrappedText(ctx, details.author, textBlockX, currentY, contentMaxWidth, styles.authorFontSize * styles.lineHeightMultiplier, styles.textAlign);
            currentY += styles.authorFontSize * 1.5; 
        }
        
        ctx.font = `${styles.fontSize}px ${styles.fontFamily}`;
        drawWrappedText(ctx, details.text, textBlockX, currentY, contentMaxWidth, styles.fontSize * styles.lineHeightMultiplier, styles.textAlign);
    };

    if (backgroundImageUrl) {
        const img = new Image();
        img.onload = () => performDraw(img);
        img.onerror = () => {
            console.error("Error loading background image.");
            performDraw(null); 
        };
        img.src = backgroundImageUrl;
    } else {
        performDraw(null);
    }

  }, [details, styles, canvasRef, backgroundImageUrl]);

  return (
    <div className="flex-grow flex items-center justify-center p-3 md:p-4 bg-slate-200 rounded-lg shadow-inner">
      <canvas 
        ref={canvasRef}
        className="max-w-full max-h-[calc(100vh-120px)] object-contain shadow-xl rounded"
        style={{ backgroundColor: styles.backgroundColor }} 
      />
    </div>
  );
};

export default CanvasPreview;
