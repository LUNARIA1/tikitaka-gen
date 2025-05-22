
import { DimensionPreset, Dimensions, TextStyle, LayoutStyle, HorizontalAlignment, VerticalAlignment, AppState, DEFAULT_FONT_FAMILIES, DisplayTextStyle, ContentDisplayType } from './types';

export const DIMENSION_PRESETS_MAP: Record<DimensionPreset, Dimensions | null> = {
  [DimensionPreset.INSTAGRAM]: { width: 1080, height: 1080 },
  [DimensionPreset.TWITTER]: { width: 1600, height: 900 },
  [DimensionPreset.FACEBOOK]: { width: 1200, height: 630 },
  [DimensionPreset.CUSTOM]: null, // Indicates custom input is used
};

export const DEFAULT_CUSTOM_DIMENSIONS: Dimensions = { width: 300, height: 500 };
export const MIN_DIMENSION = 0;
export const MAX_DIMENSION = 3000;
export const MAX_CUSTOM_FONTS = 5;

export const DEFAULT_TEXT_STYLE_BASE_NO_TEXT: Omit<TextStyle, 'text' | 'fontFamily'> = {
  fontSize: 16,
  color: "#000000",
  isBold: false,
  isItalic: false,
};

export const DEFAULT_MODEL_DISPLAY_STYLE: DisplayTextStyle = {
  fontFamily: DEFAULT_FONT_FAMILIES[0].value, 
  fontSize: 14,
  color: "#555555",
  isBold: false,
  isItalic: true,
};

export const DEFAULT_CHARACTER_TEXT_STYLE: TextStyle = {
  ...DEFAULT_TEXT_STYLE_BASE_NO_TEXT,
  fontFamily: DEFAULT_FONT_FAMILIES[1].value,
  fontSize: 25,
  color: "#FFFFFF",
  isBold: false,
  isItalic: true,
  text: "",
};

export const DEFAULT_ORIGINAL_TEXT_STYLE: Omit<TextStyle, 'text'> = {
  ...DEFAULT_TEXT_STYLE_BASE_NO_TEXT,
  fontFamily: DEFAULT_FONT_FAMILIES[1].value,
  fontSize: 18,
  color: "#FFFFFF",
  isBold: false,
  isItalic: false,
};

export const DEFAULT_TRANSLATED_TEXT_STYLE: Omit<TextStyle, 'text'> = {
  ...DEFAULT_TEXT_STYLE_BASE_NO_TEXT,
  fontFamily: DEFAULT_FONT_FAMILIES[0].value, // Changed to Sans-Serif (System)
  fontSize: 12,
  color: "#DDDDDD", // Slightly lighter than original content's default for differentiation
  isBold: false,
  isItalic: false,
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
  aiModelDisplayStyle: { ...DEFAULT_MODEL_DISPLAY_STYLE },
  aiCharacterName: { ...DEFAULT_CHARACTER_TEXT_STYLE },
  
  spacingAfterCharacterName: 0, // Default spacing after character name
  spacingAfterModelName: 30,     // Default spacing after model name

  contentDisplayType: ContentDisplayType.BLOCK,

  blockOriginalText: "",
  blockTranslationText: "",
  translationMarginTop: 8,

  linePairs: [],
  originalLineToTranslationSpacing: 10,
  interPairSpacing: 50,

  originalTextStyle: { ...DEFAULT_ORIGINAL_TEXT_STYLE },
  translatedTextStyle: { ...DEFAULT_TRANSLATED_TEXT_STYLE },
  
  dimensionPreset: DimensionPreset.CUSTOM,
  customDimensions: { ...DEFAULT_CUSTOM_DIMENSIONS },
  backgroundColor: "#000000",
  backgroundImage: null,
  backgroundImageDimness: 30,
  layout: { ...DEFAULT_LAYOUT_STYLE },
  customFontRules: [],
};