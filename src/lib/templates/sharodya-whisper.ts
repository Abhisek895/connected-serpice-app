import { TemplateThemeTokens } from "./types";

export const WHISPER_THEME: TemplateThemeTokens = {
  primaryBg: "#FFF8F0",       // Warm parchment
  primaryDark: "#2C1A0E",     // Deep sepia
  primaryAccent: "#E8791A",   // Rich saffron
  festivalAccent: "#C05B7A",  // Dusty rose
  highlightGold: "#F4B942",   // Marigold
  secondaryBeige: "#FDF5E6",  // Ivory
  fontBengali: "'Hind Siliguri', 'Noto Serif Bengali', sans-serif",
  fontEditorial: "'Playfair Display', 'Lora', serif",
  fontSans: "var(--font-inter, sans-serif)",
};

export const WHISPER_DEFAULT_AUDIO_URL =
  "https://k4q9rpuc4cgssyjq.public.blob.vercel-storage.com/audio/mayabono_biharini_horini.mp3";

export const WHISPER_DEFAULT_DATA = {
  demoId: "puja-whisper",
  recipientName: "Riya",
  creatorName: "Ayan",
  memoryMessage:
    "Last Ashtami, you were laughing at something the dhaki played wrong. I remember thinking — I want to be standing next to you every time you laugh like that.",
  secretMessage:
    "I already know which phuchka stall I want to take you to. I've been saving it. 🧆 And I want the first photo we take together this Puja to be the one we both keep.",
  vibeHint: "I was thinking The Evening — but it's completely up to you.",
  creatorFavFood: "phuchka",
  foodOptions: ["phuchka", "momos", "roll", "biryani", "sweet", "you-choose"],
  audioUrl: WHISPER_DEFAULT_AUDIO_URL,
  soundEnabledByDefault: false,
};

// Re-export existing data so the template can import from a single place
export {
  DEFAULT_PUJA_DAYS,
  DEFAULT_PUJA_VIBE_OPTIONS,
  DEFAULT_FOOD_OPTIONS,
} from "./durga-puja";
