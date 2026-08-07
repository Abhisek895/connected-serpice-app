"use client"

import RomanticLoveTemplate from "./templates/RomanticLoveTemplate";
import NasamajhLakriTemplate from "./templates/NasamajhLakriTemplate";

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
  media: MediaItem[];
};

export default function ProposalClient(props: ProposalClientProps) {
  const { demoId } = props;

  // Render the correct template component based on demoId
  if (demoId === "nasamajh-lakri") {
    return <NasamajhLakriTemplate {...props} />;
  }

  // Default fallback template
  return <RomanticLoveTemplate {...props} />;
}
