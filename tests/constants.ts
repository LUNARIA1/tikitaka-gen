import { DimensionPreset, Dimensions, TextStyle, LayoutStyle, HorizontalAlignment, VerticalAlignment, AppState, DEFAULT_FONT_FAMILIES, DisplayTextStyle } from './types';

export const DIMENSION_PRESETS_MAP: Record<DimensionPreset, Dimensions | null> = {
  [DimensionPreset.INSTAGRAM]: { width: 1080, height: 1080 },
  [DimensionPreset.TWITTER]: { width: 1600, height: 900 },
  [DimensionPreset.FACEBOOK]: { width: 1200, height: 630 },
  [DimensionPreset.CUSTOM]: null, // Indicates custom input is used
};

export const DEFAULT_CUSTOM_DIMENSIONS: Dimensions = { width: 600, height: 1000 };
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
  fontFamily: DEFAULT_FONT_FAMILIES[0].value, // Default system font
  fontSize: 14,
  color: "#555555",
  isBold: false,
  isItalic: false,
};

export const DEFAULT_CHARACTER_TEXT_STYLE: TextStyle = {
  ...DEFAULT_TEXT_STYLE_BASE,
  fontFamily: DEFAULT_FONT_FAMILIES[0].value,
  fontSize: 18,
  isBold: true,
  text: "AI Character Name",
};

export const DEFAULT_CONTENT_TEXT_STYLE: TextStyle = {
  ...DEFAULT_TEXT_STYLE_BASE,
  fontFamily: DEFAULT_FONT_FAMILIES[0].value,
  fontSize: 24,
  text: "Your AI novel excerpt content goes here. Write something inspiring or intriguing!",
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
  aiModelName: "Gemini",
  aiModelDisplayStyle: { ...DEFAULT_MODEL_DISPLAY_STYLE }, // Initialized new style
  aiCharacterName: { ...DEFAULT_CHARACTER_TEXT_STYLE },
  aiContent: { ...DEFAULT_CONTENT_TEXT_STYLE },
  dimensionPreset: DimensionPreset.CUSTOM,
  customDimensions: { ...DEFAULT_CUSTOM_DIMENSIONS },
  backgroundColor: "#FFFFFF",
  backgroundImage: null,
  backgroundImageDimness: 30, // 30%
  layout: { ...DEFAULT_LAYOUT_STYLE },
  customFontRules: [],
};