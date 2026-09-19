export type OccasionType =
  | "durga-puja"
  | "valentines"
  | "birthday"
  | "anniversary"
  | "proposal"
  | "custom";

export interface TemplateThemeTokens {
  primaryBg: string;
  primaryDark: string;
  primaryAccent: string;
  festivalAccent: string;
  highlightGold: string;
  secondaryBeige: string;
  fontBengali: string;
  fontEditorial: string;
  fontSans: string;
}

export interface ChoiceCard {
  id: string;
  icon?: string;
  title: string;
  subtitle?: string;
  description: string;
  tags?: string[];
}

export interface DurgaPujaCustomData {
  demoId?: string;
  recipientName: string;
  creatorName: string;
  nickname?: string;
  vibe?: "Romantic" | "Cute" | "Elegant" | "Playful";
  personalMessage?: string;
  pujaVibeOptions?: ChoiceCard[];
  selectedVibe?: string;
  adventureOptions?: ChoiceCard[];
  foodOptions?: string[];
  customFood?: string;
  venueName?: string;
  address?: string;
  googleMapsUrl?: string;
  date?: string;
  time?: string;
  audioUrl?: string;
  soundEnabledByDefault?: boolean;
}

export interface RecipientResponseData {
  status: "ACCEPTED" | "THINKING";
  selectedVibe?: string;
  selectedAdventure?: string;
  selectedFoods?: string[];
  locationPreference?: string;
  recipientNote?: string;
  submittedAt: string;
}
