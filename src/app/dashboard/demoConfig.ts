import { Compass, Gift, Heart, Sparkles } from "lucide-react";

export type DemoItem = {
  id: string;
  title: string;
  badge: string;
  badgeColor: string;
  description: string;
  previewUrl: string;
  builderTheme: string;
  image: string;
  icon: any;
  borderColor: string;
  hasInstantUse: boolean;
  price?: number;
  durationDays?: number;
};

export const demos: DemoItem[] = [
  {
    id: "surprise",
    title: "Romantic Love Surprise 💖",
    badge: "Requires Customization",
    badgeColor: "bg-rose-500 text-white",
    description: "Interactive romantic surprise with floating heart animations, love song (loveSong.mp3), photo showcase, & love letter reveal.",
    previewUrl: "/demos/surprise/index.html",
    builderTheme: "Romantic",
    image: "/demos/surprise/thumb_surprise_1786296446260.jpg",
    icon: Sparkles,
    borderColor: "border-rose-200",
    hasInstantUse: false,
    price: 7900,
    durationDays: 14
  },
  {
    id: "birthday-wish",
    title: "Happy Birthday Surprise 🎂",
    badge: "Requires Customization",
    badgeColor: "bg-amber-500 text-white",
    description: "Interactive birthday card with photo slideshow gallery, birthday music (hbd.mp3), confetti, & custom love message reveal.",
    previewUrl: "/demos/birthday-wish/index.html",
    builderTheme: "Romantic",
    image: "/demos/birthday-wish/thumb_birthday-wish_1786297523075.jpg",
    icon: Gift,
    borderColor: "border-amber-200",
    hasInstantUse: false
  },
  {
    id: "im-sorry",
    title: "Apology Storybook & Love Battery 💌🔋",
    badge: "Instant Available",
    badgeColor: "bg-[#e11d48] text-white",
    description: "Heartwarming interactive storybook with typewriter apology note, Polaroid memory cards, Love Battery meter & Peace Contract stamp seal!",
    previewUrl: "/demos/im-sorry/index.html",
    builderTheme: "Romantic",
    image: "/demos/im-sorry/thumb_im-sorry_1787476191118.jpg",
    icon: Sparkles,
    borderColor: "border-rose-300",
    hasInstantUse: true,
    price: 2100,
    durationDays: 7
  },
  {
    id: "she-cant-say-no",
    title: "She Can't Say No Proposal 💖",
    badge: "Instant Available",
    badgeColor: "bg-rose-500 text-white",
    description: "Viral 'Ask Her Out' interactive proposal page with cute cat stickers & a dodging 'No' button that runs away from the cursor!",
    previewUrl: "/demos/she-cant-say-no/index.html",
    builderTheme: "Romantic",
    image: "/demos/she-cant-say-no/thumb_she-cant-say-no_1786438715530.jpg",
    icon: Heart,
    borderColor: "border-rose-300",
    hasInstantUse: true,
    price: 2500,
    durationDays: 7
  },
  {
    id: "nasamajh-lakri",
    title: "Nasamajh Lakri Proposal ❤️",
    badge: "Instant Available",
    badgeColor: "bg-pink-600 text-white",
    description: "Interactive Valentine proposal with romantic audio tracks (Start.mp3, yess.mp3, no.mp3), playful buttons, & gradient aesthetic.",
    previewUrl: "/demos/nasamajh-lakri/index.html",
    builderTheme: "Romantic",
    image: "/demos/birthday-wish/s0.jpeg",
    icon: Heart,
    borderColor: "border-pink-200",
    hasInstantUse: true,
    price: 3400,
    durationDays: 7
  },
  {
    id: "date-planner",
    title: "Kolkata Date Night Planner 🌸",
    badge: "Instant Available",
    badgeColor: "bg-rose-500 text-white",
    description: "Pre-configured with default background music (Tum Se Hi), food menu (Biryani, Momo, Fuchka), date picker & summary card.",
    previewUrl: "/demos/date-planner/index.html",
    builderTheme: "Romantic",
    image: "/demos/date-planner/victoria_memorial_1785673658927.png",
    icon: Compass,
    borderColor: "border-rose-200",
    hasInstantUse: true,
    price: 1500,
    durationDays: 7
  },
  {
    id: "jalpaiguri-planner",
    title: "Jalpaiguri Date Night Planner 🌿",
    badge: "Instant Available",
    badgeColor: "bg-rose-500 text-white",
    description: "Pre-configured with default background music (Tum Se Hi), food menu (Biryani, Momo, Fuchka), date picker & summary card.",
    previewUrl: "/demos/jalpaiguri-planner/index.html",
    builderTheme: "Romantic",
    image: "/demos/jalpaiguri-planner/jalpaiguri_rajbari.png",
    icon: Compass,
    borderColor: "border-rose-200",
    hasInstantUse: true,
    price: 1500,
    durationDays: 7
  }
];
