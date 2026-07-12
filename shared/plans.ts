export interface PlanLimit {
  uploadLimit: number;
  searchLimit: number;
  quizLimit: string;
  deviceLimit: number | null;
  canaAccess: boolean;
  streaksAccess: boolean;
}

export interface PlanDetails {
  name: string;
  value: 'free' | 'pro' | 'elite';
  description: string;
  pricing: {
    IN: { price: string; period: string };
    EU: { price: string; period: string };
    US: { price: string; period: string };
  };
  limits: PlanLimit;
  features: string[];
}

export const PLAN_LIMITS: Record<'free' | 'pro' | 'elite', PlanLimit> = {
  free: {
    uploadLimit: 5,
    searchLimit: 0,
    quizLimit: "3 per day",
    deviceLimit: 1,
    canaAccess: false,
    streaksAccess: true
  },
  pro: {
    uploadLimit: 50,
    searchLimit: 10,
    quizLimit: "Unlimited",
    deviceLimit: 2,
    canaAccess: true,
    streaksAccess: true
  },
  elite: {
    uploadLimit: 200,
    searchLimit: 50,
    quizLimit: "Unlimited",
    deviceLimit: null,
    canaAccess: true,
    streaksAccess: true
  }
};

export const PLANS: PlanDetails[] = [
  {
    name: "Free",
    value: "free",
    description: "Core tools for students to summarize notes and take basic quizzes.",
    pricing: {
      IN: { price: "₹0", period: "/month" },
      EU: { price: "€0", period: "/month" },
      US: { price: "$0", period: "/month" }
    },
    limits: PLAN_LIMITS.free,
    features: [
      "5 Uploads per day",
      "Basic text summarization",
      "Standard OCR processing",
      "3 Quizzes per day",
      "No Research Mode",
      "1 Active device limit"
    ]
  },
  {
    name: "Velocity Pro",
    value: "pro",
    description: "Priority processing and CANA AI access for serious students across multiple devices.",
    pricing: {
      IN: { price: "₹99", period: "/month" },
      EU: { price: "€10", period: "/month" },
      US: { price: "$10", period: "/month" }
    },
    limits: PLAN_LIMITS.pro,
    features: [
      "50 Uploads per day",
      "Priority processing",
      "Advanced summarization",
      "Unlimited Quizzes",
      "Limited Research Mode (10/day)",
      "2 Active devices limit"
    ]
  },
  {
    name: "Velocity Elite",
    value: "elite",
    description: "Ultimate research power, unlimited quizzes, and exactly 50 monthly AI queries for power users.",
    pricing: {
      IN: { price: "₹249", period: "/month" },
      EU: { price: "€25", period: "/month" },
      US: { price: "$30", period: "/month" }
    },
    limits: PLAN_LIMITS.elite,
    features: [
      "200 Uploads per day",
      "Fastest processing speed",
      "Expert-level summaries",
      "Unlimited Quizzes",
      "50 Research Queries / Month",
      "Unlimited active devices"
    ]
  }
];
