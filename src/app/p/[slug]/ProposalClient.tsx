"use client"

import RomanticLoveTemplate from "./templates/RomanticLoveTemplate";
import NasamajhLakriTemplate from "./templates/NasamajhLakriTemplate";
import DatePlannerTemplate from "./templates/DatePlannerTemplate";
import BirthdayTemplate from "./templates/BirthdayTemplate";
import SheCantSayNoTemplate from "./templates/SheCantSayNoTemplate";
import ImSorryTemplate from "./templates/ImSorryTemplate";
import { RecipientActionBar } from "@/components/ui/RecipientActionBar";

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
  _photo2?: string;
  _photo3?: string;
  _audio?: string;
  demoId?: string;
  recipientName?: string;
  dodgeMessages?: string;
  patternText?: string;
  customData?: Record<string, any>;
  media: MediaItem[];
};

export default function ProposalClient(props: ProposalClientProps) {
  const { demoId } = props;

  // Fallback if demoId is missing
  let content = <RomanticLoveTemplate {...props} />;
  
  if (demoId === "im-sorry" || demoId === "apology") {
    content = <ImSorryTemplate {...props} />;
  } else if (demoId === "she-cant-say-no") {
    content = <SheCantSayNoTemplate {...props} />;
  } else if (demoId === "nasamajh-lakri") {
    content = <NasamajhLakriTemplate {...props} />;
  } else if (demoId === "date-planner" || demoId === "jalpaiguri-planner") {
    content = <DatePlannerTemplate {...props} />;
  } else if (demoId === "birthday-wish") {
    content = <BirthdayTemplate {...props} />;
  } else if (demoId === "surprise") {
    content = <RomanticLoveTemplate {...props} />;
  }

  const url = typeof window !== "undefined" ? window.location.href : "";

  return (
    <>
      {content}
      <RecipientActionBar 
        url={url} 
        recipientName={props.recipientName}
        title={props.title}
        themeColors={{ primary: "#e11d48", secondary: "#f43f5e" }} // Update based on theme later
      />
    </>
  );
}
