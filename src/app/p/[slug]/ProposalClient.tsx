"use client"

import RomanticLoveTemplate from "./templates/RomanticLoveTemplate";
import NasamajhLakriTemplate from "./templates/NasamajhLakriTemplate";
import DatePlannerTemplate from "./templates/DatePlannerTemplate";
import BirthdayTemplate from "./templates/BirthdayTemplate";
import SheCantSayNoTemplate from "./templates/SheCantSayNoTemplate";
import GlowingHeartTemplate from "./templates/GlowingHeartTemplate";
import ImSorryTemplate from "./templates/ImSorryTemplate";

type MediaItem = {
  id: string;
  url: string;
  type: string;
};

type ProposalClientProps = {
  slug: string;
  themeName: string;
  title?: string;
  question: string;
  acceptBtn: string;
  rejectBtn: string;
  loveMessage?: string;
  photoUrl?: string;
  audioUrl?: string;
  _photo?: string;
  _audio?: string;
  demoId?: string;
  recipientName?: string;
  dodgeMessages?: string;
  patternText?: string;
  media: MediaItem[];
};

export default function ProposalClient(props: ProposalClientProps) {
  const { demoId } = props;

  // Render the correct template component based on demoId (Class Identifier)
  if (demoId === "im-sorry" || demoId === "apology") {
    return <ImSorryTemplate {...props} />;
  }

  if (demoId === "3d-glowing-heart" || demoId === "glowing-heart") {
    return <GlowingHeartTemplate {...props} />;
  }

  if (demoId === "she-cant-say-no") {
    return <SheCantSayNoTemplate {...props} />;
  }

  if (demoId === "nasamajh-lakri") {
    return <NasamajhLakriTemplate {...props} />;
  }

  if (demoId === "date-planner" || demoId === "jalpaiguri-planner") {
    return <DatePlannerTemplate {...props} />;
  }

  if (demoId === "birthday-wish") {
    return <BirthdayTemplate {...props} />;
  }

  if (demoId === "surprise") {
    return <RomanticLoveTemplate {...props} />;
  }

  // Default fallback if demoId is missing or strictly custom (Custom Events)
  return <RomanticLoveTemplate {...props} />;
}
