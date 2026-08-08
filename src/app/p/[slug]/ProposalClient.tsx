"use client"

import RomanticLoveTemplate from "./templates/RomanticLoveTemplate";
import NasamajhLakriTemplate from "./templates/NasamajhLakriTemplate";
import DatePlannerTemplate from "./templates/DatePlannerTemplate";
import BirthdayTemplate from "./templates/BirthdayTemplate";

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
  demoId?: string;
  recipientName?: string;
  media: MediaItem[];
};

export default function ProposalClient(props: ProposalClientProps) {
  const { demoId } = props;

  // Render the correct template component based on demoId (Class Identifier)
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
