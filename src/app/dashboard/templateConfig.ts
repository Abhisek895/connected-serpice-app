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
  presetSuggestions?: string[]; // 1-click inspiration chips
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
    id: "im-sorry",
    title: "Cute Forgive Me Proposal 🥺",
    hasInstantUse: true,
    defaultData: {
      demoId: "im-sorry",
      title: "I'm Really Sorry... 🥺",
      question: "",
      acceptBtn: "Yes, I Forgive You 🥰",
      rejectBtn: "No 😤",
      recipientName: "Someone Special ✨",
      loveMessage: "I am so deeply sorry for making you upset. You mean the entire world to me, and seeing you hurt breaks my heart into a million pieces.\n\nI promise to listen better, cherish you more, and make it up to you every single day. Please give me another chance to make you smile! I love you endlessly ❤️",
    },
    steps: [
      {
        title: "Front Page Title",
        description: "Customize the main header title displayed on the front page.",
        fields: [
          {
            key: "title",
            label: "Header Title",
            type: "text",
            placeholder: "I'm Really Sorry... 🥺",
            presetSuggestions: [
              "I'm Really Sorry... 🥺",
              "Please Hear Me Out... 💌",
              "A Message From My Heart 💖",
            ],
          },
        ],
      },
      {
        title: "Apology Letter Content",
        description: "Customize your secret heart-felt apology letter.",
        fields: [
          {
            key: "loveMessage",
            label: "Apology Letter Content",
            type: "textarea",
            placeholder: "Write your special heart-felt apology letter here...",
            hint: "Revealed inside the 'A Letter From My Heart 💌' drawer modal.",
          },
        ],
      },
    ],
  },
  {
    id: "she-cant-say-no",
    title: "She Can't Say No Proposal 💖",
    hasInstantUse: true,
    defaultData: {
      demoId: "she-cant-say-no",
      title: "Do you love me? 🤗",
      question: "Do you love me? 🤗",
      acceptBtn: "Yes",
      rejectBtn: "No",
      recipientName: "mvn",
    },
    steps: [
      {
        title: "Proposal Page Customization",
        description: "Customize title, proposal question, and button labels.",
        fields: [
          {
            key: "title",
            label: "Opening Question Title",
            type: "text",
            placeholder: "Do you love me? 🤗",
          },
          {
            key: "recipientName",
            label: "Recipient Name / Note",
            type: "text",
            placeholder: "mvn",
            hint: "Renders as '[Name] is all yours'",
          },
          {
            key: "acceptBtn",
            label: "Yes Button Text",
            type: "text",
            placeholder: "Yes",
          },
          {
            key: "rejectBtn",
            label: "No Button Text",
            type: "text",
            placeholder: "No",
          },
          {
            key: "dodgeMessages",
            label: "Dodging Messages (One per line)",
            type: "textarea",
            placeholder: "Ek aur baar Soch lo! 🥺\nPlease think again! 😳\nbeautiful pls Man jao na! Kitna code likh waogi 😭",
            hint: "Messages displayed sequentially as the recipient clicks/hovers No.",
          },
        ],
      },
    ],
  },
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
      recipientName: "Someone Special ✨",
      hasDefaultMusic: true,
      patternText: "love you",
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
            presetSuggestions: [
              "A Surprise For You... 😊",
              "Happy Anniversary My Love! ❤️",
              "You Make My World Sweeter 🌸",
            ],
          },
          {
            key: "recipientName",
            label: "Recipient / Partner Name",
            type: "text",
            placeholder: "Someone Special ✨",
          },
          {
            key: "loveMessage",
            label: "Secret Love Letter (Back Text)",
            type: "textarea",
            placeholder: "Write a cute message…",
            hint: "Revealed when they click '💌 Read My Message' on the portrait page.",
            presetSuggestions: [
              "Every single day with you feels like a beautiful dream come true. You are my favorite person in the entire world! ❤️",
              "Life is so much sweeter, funnier, and warmer with you by my side. Thank you for being you! ✨",
              "I didn't believe in magic until I met you. Here's to us, forever and always! 💖",
            ],
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
            key: "patternText",
            label: "Portrait Background Text",
            type: "text",
            placeholder: "love you",
            hint: "The repeating text that makes up the hidden portrait.",
            presetSuggestions: ["love you", "forever yours", "my cutie"],
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
      acceptBtn: "Love ❤️",
      rejectBtn: "Hate 💔",
      loveMessage: "May all your dreams come true. You deserve all the happiness in the world! 🎉",
      recipientName: "Someone Special ✨",
      hasDefaultMusic: true,
    },
    steps: [
      {
        title: "Cover Page — Birthday Greeting",
        description: "Customize the birthday title, wish heading, button texts, and special message.",
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
            placeholder: "Someone Special ✨",
          },
          {
            key: "question",
            label: "Birthday Wish Heading",
            type: "text",
            placeholder: "Wishing you the happiest birthday! 🎂",
          },
          {
            key: "acceptBtn",
            label: "Positive Choice Button Text",
            type: "text",
            placeholder: "Love ❤️",
            hint: "Text shown on the main interactive pink button.",
          },
          {
            key: "rejectBtn",
            label: "Funny Reaction Button Text",
            type: "text",
            placeholder: "Hate 💔",
            hint: "Text shown on the second button.",
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
    title: "Cute Mey Proposal ❤️",
    hasInstantUse: true,
    defaultData: {
      demoId: "nasamajh-lakri",
      title: "Hi, Cute Mey 😊",
      question: "Will you be mine? 💖",
      acceptBtn: "Yes 😍",
      rejectBtn: "No 🙈",
      recipientName: "Someone Special ✨",
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
            placeholder: "Hi, Cute Mey 😊",
          },
          {
            key: "recipientName",
            label: "Recipient Name",
            type: "text",
            placeholder: "Someone Special ✨",
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
          {
            key: "dodgeMessages",
            label: "Funny 'No' Button Messages (One per line)",
            type: "textarea",
            placeholder: "piliiiiiizzzzzzzzzzzzzzzzzzzzz? 💔\nThink again, piliiiiiizzzzzzzzzzzzzzzzzzzzzzz? 🌻",
            hint: "These messages show up one by one every time your partner tries to click 'No'. Put each message on a new line.",
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
      recipientName: "Someone Special ✨",
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
            placeholder: "Someone Special ✨",
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
      recipientName: "Someone Special ✨",
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
            placeholder: "Someone Special ✨",
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
