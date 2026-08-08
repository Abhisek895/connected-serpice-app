/**
 * TEMPLATE CONFIG — Class Registry
 *
 * Each entry here is a "class definition" for a template.
 * A saved event created from it is an "object" instance.
 *
 * `defaultData` = what the class renders if the user never customizes.
 * `steps`       = the customize form pages, mirroring the template's actual page count.
 */

export type TemplateField = {
  key: string;           // maps to customData key
  label: string;
  type: "text" | "textarea" | "file-image" | "file-audio";
  placeholder?: string;
  required?: boolean;
  accept?: string;       // for file inputs
  hint?: string;
};

export type TemplateStep = {
  title: string;
  description: string;
  fields: TemplateField[];
};

export type TemplateClass = {
  id: string;           // demoId — unique identifier
  title: string;
  hasInstantUse: boolean;
  defaultData: Record<string, any>;  // class defaults (merged on top of user overrides)
  steps: TemplateStep[];
};

export const TEMPLATE_CLASSES: TemplateClass[] = [
  {
    id: "surprise",
    title: "Romantic Love Surprise 💖",
    hasInstantUse: false,
    defaultData: {
      demoId: "surprise",
      title: "A Surprise For You... 😊",
      question: "Will you be mine? 💖",
      acceptBtn: "Yes! 😍",
      rejectBtn: "No 🙈",
      loveMessage: "A little surprise from someone who truly cares…",
      recipientName: "My Love 💕",
      hasDefaultMusic: true,
    },
    steps: [
      {
        title: "Cover Page — Title & Love Letter",
        description: "Customize what appears on the opening page your recipient sees.",
        fields: [
          {
            key: "title",
            label: "Surprise Title",
            type: "text",
            placeholder: "A Surprise For You... 😊",
          },
          {
            key: "recipientName",
            label: "Recipient / Partner Name",
            type: "text",
            placeholder: "My Love 💕",
          },
          {
            key: "loveMessage",
            label: "Secret Love Letter (Back Text)",
            type: "textarea",
            placeholder: "Write a cute message…",
            hint: "Revealed when they click '\ud83d\udc8c Read My Message' on the portrait page.",
          },
        ],
      },
      {
        title: "Photo & Music Upload",
        description: "Upload a custom surprise photo and optional background music.",
        fields: [
          {
            key: "_photo",
            label: "Surprise Photo",
            type: "file-image",
            accept: "image/*",
            hint: "Displayed as the main surprise photo on the cover page.",
          },
          {
            key: "_audio",
            label: "Background Music (optional)",
            type: "file-audio",
            accept: "audio/*",
            hint: "Replaces the default love song. Leave empty to keep default.",
          },
        ],
      },
    ],
  },
  {
    id: "birthday-wish",
    title: "Happy Birthday Surprise 🎂",
    hasInstantUse: false,
    defaultData: {
      demoId: "birthday-wish",
      title: "Happy Birthday! 🎂",
      question: "Wishing you the happiest birthday! 🎂",
      loveMessage: "May all your dreams come true. You deserve all the happiness in the world! 🎉",
      recipientName: "My Love 💕",
      hasDefaultMusic: true,
    },
    steps: [
      {
        title: "Cover Page — Birthday Greeting",
        description: "Customize the birthday title and special message.",
        fields: [
          {
            key: "title",
            label: "Birthday Title",
            type: "text",
            placeholder: "Happy Birthday! 🎂",
          },
          {
            key: "recipientName",
            label: "Recipient Name",
            type: "text",
            placeholder: "My Love 💕",
          },
          {
            key: "question",
            label: "Birthday Wish Heading",
            type: "text",
            placeholder: "Wishing you the happiest birthday! 🎂",
          },
          {
            key: "loveMessage",
            label: "Birthday Love Message",
            type: "textarea",
            placeholder: "May all your dreams come true…",
            hint: "Shown with typewriter effect when they click 'Read My Message 💌'",
          },
        ],
      },
      {
        title: "Slideshow Photos & Music",
        description: "Upload up to 6 slideshow photos (shown in rotation on the birthday card) and optional music.",
        fields: [
          {
            key: "_photo",
            label: "Slideshow Photo 1",
            type: "file-image",
            accept: "image/*",
            hint: "Up to 6 photos shown in rotation. Leave empty to use default demo photos.",
          },
          {
            key: "_photo2",
            label: "Slideshow Photo 2 (optional)",
            type: "file-image",
            accept: "image/*",
          },
          {
            key: "_photo3",
            label: "Slideshow Photo 3 (optional)",
            type: "file-image",
            accept: "image/*",
          },
          {
            key: "_audio",
            label: "Birthday Music (optional)",
            type: "file-audio",
            accept: "audio/*",
            hint: "Replaces the default HBD music. Leave empty to keep default.",
          },
        ],
      },
    ],
  },
  {
    id: "nasamajh-lakri",
    title: "Nasamajh Lakri Proposal ❤️",
    hasInstantUse: true,
    defaultData: {
      demoId: "nasamajh-lakri",
      title: "Hi, Nasamajh Lakri 😊",
      question: "Will you be mine? 💖",
      acceptBtn: "Yes 😍",
      rejectBtn: "No 🙈",
      recipientName: "My Love 💕",
    },
    steps: [
      {
        title: "Proposal Page Customization",
        description: "Customize the title, proposal question, and button texts.",
        fields: [
          {
            key: "title",
            label: "Opening Title",
            type: "text",
            placeholder: "Hi, Nasamajh Lakri 😊",
          },
          {
            key: "recipientName",
            label: "Recipient Name",
            type: "text",
            placeholder: "My Love 💕",
          },
          {
            key: "question",
            label: "The Big Proposal Question",
            type: "text",
            placeholder: "Will you be mine? 💖",
          },
          {
            key: "acceptBtn",
            label: "Yes Button Text",
            type: "text",
            placeholder: "Yes 😍",
          },
          {
            key: "rejectBtn",
            label: "No Button Text",
            type: "text",
            placeholder: "No 🙈",
          },
        ],
      },
    ],
  },
  {
    id: "date-planner",
    title: "Kolkata Date Night Planner 🌸",
    hasInstantUse: true,
    defaultData: {
      demoId: "date-planner",
      title: "Date Planner 🌸",
      question: "Let's plan our perfect date! 🌸",
      recipientName: "My Love 💕",
      hasDefaultMusic: true,
      hasSummaryCard: true,
    },
    steps: [
      {
        title: "Date Planner Customization",
        description: "Personalize the title and recipient name for your Kolkata date night.",
        fields: [
          {
            key: "title",
            label: "Planner Title",
            type: "text",
            placeholder: "Date Planner 🌸",
          },
          {
            key: "recipientName",
            label: "Recipient / Partner Name",
            type: "text",
            placeholder: "My Love 💕",
          },
        ],
      },
    ],
  },
  {
    id: "jalpaiguri-planner",
    title: "Jalpaiguri Date Night Planner 🌿",
    hasInstantUse: true,
    defaultData: {
      demoId: "jalpaiguri-planner",
      title: "Date Planner 🌿",
      question: "Let's plan our perfect date! 🌿",
      recipientName: "My Love 💕",
      hasDefaultMusic: true,
      hasSummaryCard: true,
    },
    steps: [
      {
        title: "Date Planner Customization",
        description: "Personalize the title and recipient name for your Jalpaiguri date night.",
        fields: [
          {
            key: "title",
            label: "Planner Title",
            type: "text",
            placeholder: "Date Planner 🌿",
          },
          {
            key: "recipientName",
            label: "Recipient / Partner Name",
            type: "text",
            placeholder: "My Love 💕",
          },
        ],
      },
    ],
  },
];

/** Find a template class definition by demoId */
export function getTemplateClass(demoId: string): TemplateClass | undefined {
  return TEMPLATE_CLASSES.find((t) => t.id === demoId);
}
