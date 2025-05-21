
export interface ExcerptDetails {
  title: string;
  author: string;
  text: string;
}

export interface StyleSettings {
  fontFamily: string;
  fontSize: number;
  titleFontSize: number;
  authorFontSize: number;
  textColor: string;
  backgroundColor: string;
  canvasWidth: number;
  canvasHeight: number;
  paddingX: number; 
  paddingTop: number;
  paddingBottom: number;
  lineHeightMultiplier: number;
  textAlign: 'left' | 'center' | 'right';
  verticalAlign: 'top' | 'center' | 'bottom';
  backgroundImageOverlayOpacity: number; // 0 to 1
  autoCenterText: boolean;
}

export interface FontOption {
  name: string;
  value: string;
  className?: string;
}