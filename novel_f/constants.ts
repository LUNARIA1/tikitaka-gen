
import { FontOption, StyleSettings, ExcerptDetails } from './types';

export const CANVAS_PRESETS = [
  { name: 'Instagram Post (1:1)', width: 1080, height: 1080 },
  { name: 'Instagram Story (9:16)', width: 1080, height: 1920 },
  { name: 'Twitter Post (16:9)', width: 1200, height: 675 },
  { name: 'Facebook Post (1.91:1)', width: 1200, height: 630 },
  { name: 'Custom (600x1000px)', width: 600, height: 1000, isCustomPlaceholder: true },
];

export const DEFAULT_EXCERPT_DETAILS: ExcerptDetails = {
  title: "여름밤의 꿈",
  author: "윌리엄 셰익스피어",
  text: "사랑은 눈이 아니라 마음으로 보는 거지.\n그래서 날개 달린 큐피드는 장님으로 그려지는 거야.\n\n세상의 어떤 것도 사랑 앞에서는 가치가 없어.\n사랑은 진실을 모르거든.\n날개 달리고 눈이 멀었으니 얼마나 성급하겠어.\n그래서 사랑은 선택을 잘못하는 어린애라고들 하지."
};

export const FONT_FAMILIES: FontOption[] = [
  { name: 'Noto Sans KR (기본)', value: '"Noto Sans KR", sans-serif', className: 'font-noto-sans-kr' },
  { name: 'Playfair Display (세리프)', value: '"Playfair Display", serif', className: 'font-playfair' },
  { name: 'Roboto Slab (슬랩 세리프)', value: '"Roboto Slab", serif', className: 'font-roboto-slab' },
  { name: 'Arial', value: 'Arial, sans-serif' },
  { name: 'Georgia', value: 'Georgia, serif' },
  { name: 'Courier New', value: '"Courier New", Courier, monospace' },
];

export const DEFAULT_STYLE_SETTINGS: StyleSettings = {
  fontFamily: FONT_FAMILIES[0].value,
  fontSize: 18, 
  titleFontSize: 27, 
  authorFontSize: 16, 
  textColor: '#333333',
  backgroundColor: '#F8F0E3', 
  canvasWidth: CANVAS_PRESETS[0].width,
  canvasHeight: CANVAS_PRESETS[0].height,
  paddingX: 60,
  paddingTop: 60,
  paddingBottom: 60,
  lineHeightMultiplier: 1.6,
  textAlign: 'center',
  verticalAlign: 'center',
  backgroundImageOverlayOpacity: 0, // Default no overlay
  autoCenterText: false, // Default manual alignment
};