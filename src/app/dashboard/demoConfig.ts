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
};

export const demos: DemoItem[] = [
  {
    id: "ankita-surprise",
    title: "Romantic Love Surprise 💖",
    badge: "Requires Customization",
    badgeColor: "bg-rose-500 text-white",
    description: "Interactive romantic surprise with floating heart animations, love song (loveSong.mp3), photo showcase, & love letter reveal.",
    previewUrl: "/p/demo-romantic",
    builderTheme: "Romantic",
    image: "/demos/ankita-surprise/images.jpeg",
    icon: Sparkles,
    borderColor: "border-rose-200",
    hasInstantUse: false
  },
  {
    id: "birthday-wish",
    title: "Happy Birthday Surprise 🎂",
    badge: "Requires Customization",
    badgeColor: "bg-amber-500 text-white",
    description: "Interactive birthday card with photo slideshow gallery, birthday music (hbd.mp3), confetti, & custom love message reveal.",
    previewUrl: "/p/demo-birthday",
    builderTheme: "Romantic",
    image: "/demos/birthday-wish/s0.jpeg",
    icon: Gift,
    borderColor: "border-amber-200",
    hasInstantUse: false
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
    hasInstantUse: true
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
    hasInstantUse: true
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
    hasInstantUse: true
  }
];
