import { ChoiceCard, DurgaPujaCustomData, TemplateThemeTokens } from "./types";

export const DURGA_PUJA_THEME: TemplateThemeTokens = {
  primaryBg: "#FDFBF7",        // Warm Ivory / Cream
  primaryDark: "#161413",      // Deep Charcoal
  primaryAccent: "#631726",    // Deep Wine / Burgundy
  festivalAccent: "#C0422B",   // Muted Vermilion
  highlightGold: "#D4AF37",    // Antique Gold
  secondaryBeige: "#F2EBE0",   // Warm Beige
  fontBengali: "'Noto Serif Bengali', serif",
  fontEditorial: "'Cormorant Garamond', 'Playfair Display', serif",
  fontSans: "var(--font-inter, sans-serif)",
};

export const DEFAULT_PUJA_VIBE_OPTIONS: ChoiceCard[] = [
  {
    id: "explorer",
    icon: "🛕",
    title: "The Explorer",
    subtitle: "মণ্ডপ পরিক্রমা",
    description: "Let's wander through beautiful Puja places.",
  },
  {
    id: "food-adda",
    icon: "🍜",
    title: "Food + Adda",
    subtitle: "খাওয়া দাওয়া আর আড্ডা",
    description: "More food. More talking. Less planning.",
  },
  {
    id: "evening",
    icon: "🌙",
    title: "The Evening",
    subtitle: "আলো আর সন্ধ্যার মেজাজ",
    description: "Lights, dhak, pandals and a little night walk.",
  },
  {
    id: "memory",
    icon: "📸",
    title: "Make a Memory",
    subtitle: "স্মৃতি ধরে রাখার গল্প",
    description: "Let's take pictures we'll smile at later.",
  },
  {
    id: "surprise",
    icon: "🎲",
    title: "Surprise Me",
    subtitle: "তোমার ইচ্ছেমতো",
    description: "You plan it. I'll trust you. 😌",
  },
];

export const DEFAULT_ADVENTURE_OPTIONS: ChoiceCard[] = [
  {
    id: "walk",
    icon: "🚶",
    title: "Let's walk",
    subtitle: "হেঁটে হেঁটে আবিষ্কার",
    description: "No rush. Let's explore.",
  },
  {
    id: "journey",
    icon: "🚗",
    title: "Let's go somewhere",
    subtitle: "একটু দূরে একটা যাত্রা",
    description: "A little journey sounds nice.",
  },
  {
    id: "close",
    icon: "📍",
    title: "Keep it close",
    subtitle: "কাছাকাছি আর সহজ",
    description: "Somewhere nearby and easy.",
  },
  {
    id: "you-decide",
    icon: "🎁",
    title: "You decide",
    subtitle: "পুরোটাই তোমার প্ল্যান",
    description: "I'll trust your plan.",
  },
];

export const DEFAULT_FOOD_OPTIONS = [
  { id: "phuchka", name: "Phuchka", icon: "🌶️", desc: "Crispy, tangy & irresistible" },
  { id: "momos", name: "Momos", icon: "🍜", desc: "Steaming hot with spicy chutney" },
  { id: "roll", name: "Kathi Roll", icon: "🌯", desc: "Classic festival street food" },
  { id: "biryani", name: "Biryani", icon: "🍚", desc: "Fragrant, royal & comforting" },
  { id: "sweet", name: "Something sweet", icon: "🍨", desc: "Mishti or ice cream to end" },
  { id: "you-choose", name: "You choose", icon: "❤️", desc: "Surprise me with your pick" },
];

export const DEFAULT_ACTIVITIES = [
  "Pandal",
  "Food",
  "Walk",
  "Photography",
  "Adda",
  "Shopping",
  "Bhog",
  "Dhunuchi Naach",
];

export const DEFAULT_PUJA_AUDIO_URL = "https://k4q9rpuc4cgssyjq.public.blob.vercel-storage.com/audio/mayabono_biharini_horini.mp3";
export const DEFAULT_PUJA_LOCAL_AUDIO_URL = "/demos/durga-puja/mayabono_biharini.mp3";

export const DURGA_PUJA_DEFAULT_DATA: DurgaPujaCustomData = {
  demoId: "durga-puja",
  recipientName: "Riya",
  creatorName: "Ayan",
  nickname: "",
  vibe: "Romantic",
  personalMessage: "Puja has always been special to me, but this year I couldn't imagine celebrating it with anyone else.",
  pujaVibeOptions: DEFAULT_PUJA_VIBE_OPTIONS,
  adventureOptions: DEFAULT_ADVENTURE_OPTIONS,
  foodOptions: ["Phuchka", "Momos", "Kathi Roll", "Biryani", "Something sweet", "You choose"],
  venueName: "",
  address: "",
  googleMapsUrl: "",
  date: "",
  time: "",
  soundEnabledByDefault: false,
  audioUrl: DEFAULT_PUJA_AUDIO_URL,
};
