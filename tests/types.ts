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
  text: string;
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

export interface AppState {
  aiModelName: string;
  aiModelDisplayStyle: DisplayTextStyle; // New: For styling the "Model: <name>" text
  aiCharacterName: TextStyle;
  aiContent: TextStyle;
  
  dimensionPreset: DimensionPreset;
  customDimensions: Dimensions;
  
  backgroundColor: string;
  backgroundImage: string | null;
  backgroundImageDimness: number; // 0-100

  layout: LayoutStyle;
  customFontRules: string[];
}