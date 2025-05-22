export interface FontOption {
  label: string;
  value: string;
  isDefault?: boolean; // To distinguish default fonts from custom ones if needed later
}

export enum DimensionPreset {
  INSTAGRAM = "Instagram Post (1080x1080)",
  TWITTER = "Twitter Post (1600x900)",
  FACEBOOK = "Facebook Post (1200x630)",
  CUSTOM = "Custom",
}

export interface Dimensions {
  width: number;
  height: number;
}

export interface TextStyle {
  fontFamily: string;
  fontSize: number;
  color: string;
  isBold: boolean;
  isItalic: boolean;
  text: string; // Note: For style-only objects, text might not be used directly.
}

export type DisplayTextStyle = Omit<TextStyle, 'text'>;

export enum HorizontalAlignment {
  LEFT = "left",
  CENTER = "center",
  RIGHT = "right",
}

export enum VerticalAlignment {
  TOP = "flex-start",
  MIDDLE = "center",
  BOTTOM = "flex-end",
}

export interface LayoutStyle {
  horizontalAlign: HorizontalAlignment;
  verticalAlign: VerticalAlignment;
  paddingTop: number;
  paddingRight: number;
  paddingBottom: number;
  paddingLeft: number;
  centerAll: boolean;
}

export const DEFAULT_FONT_FAMILIES: FontOption[] = [
  { label: "Sans-Serif (System)", value: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif', isDefault: true },
  { label: "Serif (Georgia)", value: "Georgia, serif", isDefault: true },
  { label: "Monospace (Courier)", value: '"Courier New", Courier, monospace', isDefault: true },
];

export enum ContentDisplayType {
  BLOCK = "Block",
  PAIRED_LINES = "Paired Lines",
}

export interface LinePair {
  id: string; 
  original: string;
  translation: string;
  originalLineStyle?: Partial<Omit<TextStyle, 'text'>>;
  translatedLineStyle?: Partial<Omit<TextStyle, 'text'>>;
}

export interface AppState {
  aiModelName: string;
  aiModelDisplayStyle: DisplayTextStyle;
  aiCharacterName: TextStyle;

  // New spacing controls
  spacingAfterCharacterName: number;
  spacingAfterModelName: number;

  contentDisplayType: ContentDisplayType;

  // For Block display
  blockOriginalText: string; 
  blockTranslationText: string; 
  translationMarginTop: number; 

  // For Paired Lines display
  linePairs: LinePair[];
  originalLineToTranslationSpacing: number; 
  interPairSpacing: number; 

  // Common text styles, used by both Block and Paired Lines
  originalTextStyle: Omit<TextStyle, 'text'>; // Style for original text
  translatedTextStyle: Omit<TextStyle, 'text'>; // Style for translated text
  
  dimensionPreset: DimensionPreset;
  customDimensions: Dimensions;
  
  backgroundColor: string;
  backgroundImage: string | null;
  backgroundImageDimness: number; 

  layout: LayoutStyle;
  customFontRules: string[];
}