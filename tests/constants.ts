import { DimensionPreset, Dimensions, TextStyle, LayoutStyle, HorizontalAlignment, VerticalAlignment, AppState, DEFAULT_FONT_FAMILIES, DisplayTextStyle } from './types';

export const DIMENSION_PRESETS_MAP: Record<DimensionPreset, Dimensions | null> = {
  [DimensionPreset.INSTAGRAM]: { width: 1080, height: 1080 },
  [DimensionPreset.TWITTER]: { width: 1600, height: 900 },
  [DimensionPreset.FACEBOOK]: { width: 1200, height: 630 },
  [DimensionPreset.CUSTOM]: null, // Indicates custom input is used
};

export const DEFAULT_CUSTOM_DIMENSIONS: Dimensions = { width: 300, height: 500 }; // Updated
export const MIN_DIMENSION = 0;
export const MAX_DIMENSION = 3000;
export const MAX_CUSTOM_FONTS = 3;

export const DEFAULT_TEXT_STYLE_BASE: Omit<TextStyle, 'text' | 'fontFamily'> = {
  fontSize: 16,
  color: "#000000",
  isBold: false,
  isItalic: false,
};

export const DEFAULT_MODEL_DISPLAY_STYLE: DisplayTextStyle = {
  fontFamily: DEFAULT_FONT_FAMILIES[0].value, 
  fontSize: 14, // Updated (or confirmed)
  color: "#555555", // Updated (or confirmed)
  isBold: false,
  isItalic: true, // Updated
};

export const DEFAULT_CHARACTER_TEXT_STYLE: TextStyle = {
  ...DEFAULT_TEXT_STYLE_BASE,
  fontFamily: DEFAULT_FONT_FAMILIES[1].value, // Updated to Georgia
  fontSize: 25, // Updated
  color: "#FFFFFF", // Updated to white
  isBold: false, // Default base
  isItalic: true, // Updated
  text: "", // Updated to empty
};

export const DEFAULT_CONTENT_TEXT_STYLE: TextStyle = {
  ...DEFAULT_TEXT_STYLE_BASE,
  fontFamily: DEFAULT_FONT_FAMILIES[1].value, // Updated to Georgia
  fontSize: 18, // Updated
  color: "#FFFFFF", // Updated to white
  isBold: false, // Default base
  isItalic: false, // Default base (user did not specify italic for content)
  text: "", // Updated to empty
};

export const DEFAULT_LAYOUT_STYLE: LayoutStyle = {
  horizontalAlign: HorizontalAlignment.LEFT,
  verticalAlign: VerticalAlignment.TOP,
  paddingTop: 40,
  paddingRight: 40,
  paddingBottom: 40,
  paddingLeft: 40,
  centerAll: false,
};

export const INITIAL_APP_STATE: AppState = {
  aiModelName: "Anthropic/Claude-3.7-Sonnet",
  aiModelDisplayStyle: { ...DEFAULT_MODEL_DISPLAY_STYLE }, // Uses updated style
  aiCharacterName: { ...DEFAULT_CHARACTER_TEXT_STYLE }, // Uses updated style
  aiContent: { ...DEFAULT_CONTENT_TEXT_STYLE }, // Uses updated style
  dimensionPreset: DimensionPreset.CUSTOM, // Remains custom
  customDimensions: { ...DEFAULT_CUSTOM_DIMENSIONS }, // Uses updated dimensions
  backgroundColor: "#000000", // Updated background color
  backgroundImage: null,
  backgroundImageDimness: 30,
  layout: { ...DEFAULT_LAYOUT_STYLE },
  customFontRules: [],
};
