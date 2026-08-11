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
    image: "/demos/surprise/images.jpeg",
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
    previewUrl: "/demos/birthday-wish/index.html",
    builderTheme: "Romantic",
    image: "/demos/birthday-wish/s0.jpeg",
    icon: Gift,
    borderColor: "border-amber-200",
    hasInstantUse: false
  },
  {
    id: "3d-glowing-heart",
    title: "3D Glowing Text Heart Proposal 💖",
    badge: "Instant Available",
    badgeColor: "bg-purple-600 text-white",
    description: "Viral 3D animated heart made of glowing repeating 'i love you' text with romantic music & secret love letter reveal!",
    previewUrl: "/demos/3d-glowing-heart/index.html",
    builderTheme: "Romantic",
    image: "/demos/surprise/images.jpeg",
    icon: Sparkles,
    borderColor: "border-purple-300",
    hasInstantUse: true,
    price: 2900,
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
    image: "https://media1.tenor.com/m/al4yRBO26akAAAAC/cat-goma.gif",
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
