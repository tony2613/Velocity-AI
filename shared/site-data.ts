/**
 * Shared Site Data & SEO / AEO Knowledge Base
 * Single source of truth for features, blog posts, pricing catalog, and structured data.
 * Consumed by client components, server-side pre-rendering, and LLM text directives.
 */

export interface FeatureItem {
  id: string;
  title: string;
  shortDesc: string;
  fullDesc: string;
  category: "core" | "exam_prep" | "productivity";
  isNew?: boolean;
}

export interface BlogPostItem {
  id: string;
  title: string;
  date: string;
  summary: string;
  content: string;
}

export const SITE_URL = "https://velocityaisoftware.app";
export const SITE_NAME = "Velocity AI";
export const LINKEDIN_URL = "https://www.linkedin.com/company/velocityai-software";

export const FEATURES: FeatureItem[] = [
  {
    id: "ai-summarization",
    title: "AI Summarization",
    shortDesc: "Condenses lengthy textbooks, research PDFs, and lecture slides into high-yield summaries.",
    fullDesc: "Advanced AI models extract key concepts, definitions, formulas, and structural highlights from massive documents in seconds. Reduces study prep time by up to 80%.",
    category: "core",
  },
  {
    id: "quiz-generation",
    title: "Active Recall Quiz Generation",
    shortDesc: "Instantly auto-generates multiple-choice and conceptual practice questions directly from your notes.",
    fullDesc: "Leverages the cognitive testing effect and active retrieval to reinforce long-term memory. Automatically creates targeted practice quizzes with explanations for each question.",
    category: "core",
  },
  {
    id: "exam-calendar",
    title: "Exam Calendar",
    shortDesc: "Real-time exam countdowns, interactive scheduling, and daily task agenda.",
    fullDesc: "Never miss a test date. Track countdowns to midterms and finals, visualize upcoming exam milestones, and align daily revision goals seamlessly.",
    category: "exam_prep",
    isNew: true,
  },
  {
    id: "adaptive-planner",
    title: "Adaptive Study Planner",
    shortDesc: "Dynamic AI study timetable that automatically rebalances study sessions based on pace and exam deadlines.",
    fullDesc: "Calculates optimal study pacing per topic, adjusts schedules when tasks are completed or missed, and automatically rebalances workloads leading up to exam day.",
    category: "exam_prep",
    isNew: true,
  },
  {
    id: "weakness-tracker",
    title: "Weakness Tracker",
    shortDesc: "Diagnostic topic-level mastery analytics and targeted revision prioritization.",
    fullDesc: "Automatically analyzes quiz attempts, pinpoints specific topics where you struggle, and prioritizes high-yield review sessions to close knowledge gaps before test day.",
    category: "exam_prep",
    isNew: true,
  },
  {
    id: "note-organization",
    title: "Smart Note Organization",
    shortDesc: "Keep all study materials organized by subject, class, and semester with an intuitive explorer.",
    fullDesc: "Categorize summaries, lecture slides, and quizzes into dedicated subject hierarchies. Fast search and filter tools let you retrieve notes in milliseconds.",
    category: "productivity",
  },
  {
    id: "export-tools",
    title: "Universal Export Tools",
    shortDesc: "Download summaries and quizzes as PDF or DOCX files for offline review.",
    fullDesc: "Export beautifully formatted study sheets, printable quiz handouts, or backup your notes to GitHub and external cloud storage effortlessly.",
    category: "productivity",
  },
];

export const BLOG_POSTS: BlogPostItem[] = [
  {
    id: "how-velocityai-helps-users-retain-more-knowledge",
    title: "How VelocityAI Helps Users Retain More Knowledge",
    date: "Aug 10, 2026",
    summary: "Active recall vs. rereading: Why self-quizzing beats highlighting and how VelocityAI helps you study smarter.",
    content: `If you've ever spent an evening highlighting your textbook in three colors, feeling productive, only to blank out on the exam — you're not alone. And it's not because you didn't work hard enough. It's because rereading and highlighting are, science tells us, some of the least effective ways to actually learn something.

Here's what works better, why, and how to build it into your study routine without adding extra hours.

THE PROBLEM WITH REREADING

Rereading feels productive because it creates fluency — the material starts to look familiar, and your brain mistakes that familiarity for understanding. Psychologists call this the "illusion of competence." You recognize the sentence "the mitochondria is the powerhouse of the cell" because you've seen it five times. But recognizing isn't the same as being able to recall it, unprompted, in an exam hall with a blank sheet in front of you.

Highlighting has the same issue — it's a passive act. Your hand is doing something, but your brain is often on autopilot.

WHAT ACTUALLY WORKS: ACTIVE RECALL

Active recall means forcing yourself to retrieve information without looking at the source. Instead of asking "does this look familiar?", you ask "can I produce this from memory?"

This is a much harder — and much more useful — mental exercise. It mimics exactly what you'll be asked to do in an exam: pull an answer out of your own head, not recognize it on a page.

The research backing this is old and consistent. Studies on the "testing effect" (going back to work by Roediger and Karpicke in the 2000s) repeatedly show that students who quiz themselves on material retain it significantly longer than students who reread the same material for the same amount of time — even when the rereaders feel more confident going in.

HOW TO ACTUALLY DO ACTIVE RECALL (WITHOUT OVERCOMPLICATING IT)

You don't need a fancy system. Here's a simple loop:

1. Read or attend the lecture once, properly. Don't try to memorize on the first pass — just understand it.
2. Close the material. Notes away, PDF closed, slides off screen.
3. Try to answer questions about it from memory. Not "read the definition" — actually write out or say the definition, then check yourself.
4. Mark what you got wrong or fuzzy. This is the important part — most students skip this and just move on.
5. Come back to the wrong ones later, not immediately. Spacing the retry out (a few hours or the next day) is what makes it stick long-term. This pairing of active recall with spaced repetition is often called spaced retrieval, and it's one of the most well-supported study techniques in cognitive psychology.

The catch: writing your own quiz questions for every chapter is slow, and most students don't do it consistently — which is exactly why the technique gets abandoned even though everyone agrees it works.

MAKING ACTIVE RECALL ACTUALLY SUSTAINABLE

This is the gap Velocity AI is built to close. Instead of manually writing flashcards or quiz questions for every PDF, lecture slide, or note set, you upload the material and get a quiz generated directly from it — so the retrieval practice step takes minutes instead of an evening.

A workflow that takes this from theory to habit might look like:

- Upload your lecture PDF or notes right after class, while the content is still fresh.
- Skim the auto-generated summary once, to consolidate understanding (this replaces the "read it properly" step above).
- Take the quiz without looking back at your notes — this is the active recall step.
- Review what you got wrong, and ask CANA to explain the specific concept you missed, rather than re-reading the whole chapter.
- Come back to the same quiz 2-3 days later. Getting a question wrong the second time is useful information, not a failure — it tells you exactly where to focus.

THE TAKEAWAY

Highlighting and rereading feel like studying. Active recall is studying. The switch is uncomfortable at first — testing yourself is harder and less pleasant than passively rereading — but that difficulty is exactly the point. Struggling to retrieve an answer is what builds the memory in the first place.

If you're prepping for exams this semester, try swapping just one rereading session for a self-quiz this week and see how it feels. Most students notice the difference by the second attempt.

---

Velocity AI turns your PDFs and notes into summaries and quizzes automatically, so active recall takes minutes, not hours.`,
  },
  {
    id: "future-of-ai",
    title: "The Future of AI in Education",
    date: "Jan 1, 2026",
    summary: "How AI is changing the way students learn, adapt, and retain complex knowledge.",
    content: `AI is no longer just a futuristic concept; it's a present reality in classrooms worldwide. From personalized learning paths to instant summarization, AI tools like VelocityAI are empowering students to tackle complex subjects with newfound confidence.

In the coming years, we expect to see even deeper integration of AI in curriculum design and real-time feedback systems that adapt to each student's unique learning pace.

VelocityAI leads this evolution by pairing state-of-the-art document intelligence with proven cognitive science principles: active recall, spaced repetition, and diagnostic weakness tracking.`,
  },
  {
    id: "study-hacks-2026",
    title: "Top 5 Study Hacks for 2026",
    date: "Dec 15, 2025",
    summary: "Boost your exam productivity with these 5 proven cognitive learning techniques.",
    content: `1. Use AI for Initial Summaries: Don't spend hours reading 50 pages of raw text when you can extract core conceptual frameworks in minutes.
2. Interval Recall Quizzing: Turn summaries into practice quizzes immediately after reading to lock concepts into memory.
3. Adaptive Revision Scheduling: Use automated calendars to rebalance study sessions dynamically when deadlines shift.
4. Digital Focus Sessions: Utilize timed focus blocks aligned with high-priority topics identified by weakness diagnostics.
5. Collaborative Question Banks: Share AI-generated quizzes with study groups for peer review and discussion.`,
  },
];

/**
 * Returns complete SoftwareApplication & Organization JSON-LD Schema
 * Crucial for Google Search, Google AI Overview, and LLM entity extraction.
 */
export function getSoftwareApplicationSchema() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "@id": `${SITE_URL}/#software`,
        name: SITE_NAME,
        alternateName: ["VelocityAI", "Velocity AI Software", "velocityaisoftware.app"],
        url: SITE_URL,
        applicationCategory: "EducationalApplication",
        operatingSystem: "Web, iOS, Android, macOS, Windows",
        description:
          "VelocityAI is an AI-powered study engine that transforms textbooks, lecture slides, and academic PDFs into concise summaries, active recall quizzes, adaptive study schedules, and weakness diagnostic trackers.",
        screenshot: `${SITE_URL}/pwa-512x512.png`,
        featureList: FEATURES.map((f) => `${f.title}: ${f.shortDesc}`),
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: "4.9",
          ratingCount: "148",
          bestRating: "5",
          worstRating: "1",
        },
        offers: [
          {
            "@type": "Offer",
            name: "Free Tier",
            price: "0",
            priceCurrency: "USD",
            description: "5 Uploads/day, basic summarization, 3 quizzes/day.",
          },
          {
            "@type": "Offer",
            name: "Velocity Pro",
            price: "10",
            priceCurrency: "USD",
            description: "50 Uploads/day, priority processing, unlimited quizzes, CANA AI access.",
          },
          {
            "@type": "Offer",
            name: "Velocity Elite",
            price: "30",
            priceCurrency: "USD",
            description: "200 Uploads/day, expert summarization, unlimited quizzes, research mode.",
          },
        ],
        author: {
          "@type": "Organization",
          "@id": `${SITE_URL}/#organization`,
        },
      },
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: SITE_NAME,
        legalName: "VelocityAI Software",
        alternateName: ["VelocityAI", "Velocity-AI", "Velocity AI Software"],
        url: SITE_URL,
        logo: `${SITE_URL}/pwa-512x512.png`,
        sameAs: [LINKEDIN_URL],
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: `${SITE_URL}/`,
        name: SITE_NAME,
        alternateName: ["VelocityAI", "Velocity AI Software", "velocityaisoftware.app"],
        publisher: {
          "@id": `${SITE_URL}/#organization`,
        },
      },
    ],
  };
}

/**
 * Returns Page-Specific SEO Metadata, Structured Data, and Semantic HTML
 */
export function getPageSeoData(pathname: string) {
  const cleanPath = pathname.split("?")[0].replace(/\/$/, "") || "/";

  // 1. Features Page
  if (cleanPath === "/features") {
    return {
      title: "Features – AI Summarization, Quiz Generation, Exam Calendar & Planner",
      description:
        "Explore VelocityAI's comprehensive study suite: AI Summaries, Active Recall Quizzes, Exam Calendar, Adaptive Study Planner, and Weakness Tracker.",
      canonicalUrl: `${SITE_URL}/features`,
      structuredData: {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: "VelocityAI Study Features",
        itemListElement: FEATURES.map((f, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: f.title,
          description: f.fullDesc,
        })),
      },
      prerenderHtml: `
        <div class="min-h-screen bg-background text-foreground">
          <nav class="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center border-b border-border">
            <a href="/" class="font-bold text-xl">Velocity AI</a>
            <div class="flex items-center gap-4">
              <a href="/pricing" class="text-sm font-medium hover:text-primary">Pricing</a>
              <a href="/blog" class="text-sm font-medium hover:text-primary">Blog</a>
              <a href="/auth" class="text-sm font-semibold px-4 py-2 rounded-lg bg-primary text-primary-foreground">Get Started</a>
            </div>
          </nav>
          <main class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div class="text-center mb-12">
              <h1 class="text-4xl sm:text-5xl font-bold tracking-tight mb-4">Powerful Study Features</h1>
              <p class="text-xl text-muted-foreground max-w-2xl mx-auto">
                Everything you need to master your subjects faster with AI-powered study intelligence.
              </p>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              ${FEATURES.map(
                (f) => `
                <div class="p-6 rounded-2xl border border-border bg-card shadow-sm">
                  <div class="flex items-center gap-2 mb-3">
                    <h2 class="text-xl font-semibold">${f.title}</h2>
                    ${f.isNew ? '<span class="px-2 py-0.5 text-xs font-bold rounded-full bg-primary/20 text-primary">NEW</span>' : ""}
                  </div>
                  <p class="text-sm text-muted-foreground mb-3">${f.shortDesc}</p>
                  <p class="text-xs text-muted-foreground/80">${f.fullDesc}</p>
                </div>
              `
              ).join("")}
            </div>
          </main>
        </div>
      `,
    };
  }

  // 2. Pricing Page
  if (cleanPath === "/pricing") {
    return {
      title: "Pricing – Free, Pro & Elite Study Plans",
      description:
        "Transparent, student-friendly pricing for VelocityAI. Start free or upgrade to Velocity Pro or Elite for unlimited quizzes, priority AI processing, and CANA access.",
      canonicalUrl: `${SITE_URL}/pricing`,
      structuredData: {
        "@context": "https://schema.org",
        "@type": "Product",
        name: "VelocityAI Subscription",
        description: "AI study companion for summaries, quizzes, and adaptive exam planning.",
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: "4.9",
          ratingCount: "148",
          bestRating: "5",
          worstRating: "1",
        },
        offers: {
          "@type": "AggregateOffer",
          priceCurrency: "USD",
          lowPrice: "0",
          highPrice: "30",
          offerCount: "3",
          offers: [
            {
              "@type": "Offer",
              name: "Free Tier",
              price: "0",
              priceCurrency: "USD",
              description: "5 Uploads/day, 3 Quizzes/day, 1 Device",
            },
            {
              "@type": "Offer",
              name: "Velocity Pro",
              price: "10",
              priceCurrency: "USD",
              description: "50 Uploads/day, Unlimited Quizzes, 2 Devices, CANA Assistant",
            },
            {
              "@type": "Offer",
              name: "Velocity Elite",
              price: "30",
              priceCurrency: "USD",
              description: "200 Uploads/day, Unlimited Quizzes, Research Mode, Unlimited Devices",
            },
          ],
        },
      },
      prerenderHtml: `
        <div class="min-h-screen bg-background text-foreground">
          <nav class="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center border-b border-border">
            <a href="/" class="font-bold text-xl">Velocity AI</a>
            <div class="flex items-center gap-4">
              <a href="/features" class="text-sm font-medium hover:text-primary">Features</a>
              <a href="/blog" class="text-sm font-medium hover:text-primary">Blog</a>
              <a href="/auth" class="text-sm font-semibold px-4 py-2 rounded-lg bg-primary text-primary-foreground">Get Started</a>
            </div>
          </nav>
          <main class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
            <h1 class="text-4xl sm:text-5xl font-bold tracking-tight mb-4">Simple, Transparent Pricing</h1>
            <p class="text-xl text-muted-foreground max-w-2xl mx-auto mb-12">
              Choose the plan that fits your study needs. Upgrade anytime to unlock more power.
            </p>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8 text-left max-w-5xl mx-auto">
              <div class="p-8 rounded-2xl border border-border bg-card shadow-sm flex flex-col justify-between">
                <div>
                  <h2 class="text-2xl font-bold mb-2">Free</h2>
                  <p class="text-sm text-muted-foreground mb-4">Core tools for students to summarize notes and take practice quizzes.</p>
                  <div class="text-3xl font-extrabold mb-6">$0 <span class="text-sm font-normal text-muted-foreground">/month</span></div>
                  <ul class="text-sm space-y-2 text-muted-foreground">
                    <li>✓ 5 Uploads per day</li>
                    <li>✓ Basic text summarization</li>
                    <li>✓ 3 Quizzes per day</li>
                    <li>✓ 1 Active device</li>
                  </ul>
                </div>
                <a href="/auth" class="mt-8 block text-center py-2.5 px-4 rounded-xl font-semibold border border-border hover:bg-muted">Start Free</a>
              </div>
              <div class="p-8 rounded-2xl border-2 border-primary bg-card shadow-md flex flex-col justify-between">
                <div>
                  <span class="text-xs font-bold uppercase tracking-wider text-primary mb-2 block">Most Popular</span>
                  <h2 class="text-2xl font-bold mb-2">Velocity Pro</h2>
                  <p class="text-sm text-muted-foreground mb-4">Priority processing and CANA AI access for serious students.</p>
                  <div class="text-3xl font-extrabold mb-6">$10 <span class="text-sm font-normal text-muted-foreground">/month (₹99 in India)</span></div>
                  <ul class="text-sm space-y-2 text-muted-foreground">
                    <li>✓ 50 Uploads per day</li>
                    <li>✓ Priority AI processing</li>
                    <li>✓ Unlimited Quizzes</li>
                    <li>✓ CANA AI Assistant</li>
                    <li>✓ 2 Active devices</li>
                  </ul>
                </div>
                <a href="/auth" class="mt-8 block text-center py-2.5 px-4 rounded-xl font-semibold bg-primary text-primary-foreground hover:opacity-90">Get Velocity Pro</a>
              </div>
              <div class="p-8 rounded-2xl border border-border bg-card shadow-sm flex flex-col justify-between">
                <div>
                  <h2 class="text-2xl font-bold mb-2">Velocity Elite</h2>
                  <p class="text-sm text-muted-foreground mb-4">Ultimate research power and unlimited quizzes for power users.</p>
                  <div class="text-3xl font-extrabold mb-6">$30 <span class="text-sm font-normal text-muted-foreground">/month (₹249 in India)</span></div>
                  <ul class="text-sm space-y-2 text-muted-foreground">
                    <li>✓ 200 Uploads per day</li>
                    <li>✓ Fastest processing speed</li>
                    <li>✓ Unlimited Quizzes</li>
                    <li>✓ 50 Research Queries / month</li>
                    <li>✓ Unlimited active devices</li>
                  </ul>
                </div>
                <a href="/auth" class="mt-8 block text-center py-2.5 px-4 rounded-xl font-semibold border border-border hover:bg-muted">Get Elite</a>
              </div>
            </div>
          </main>
        </div>
      `,
    };
  }

  // 3. Blog List Page
  if (cleanPath === "/blog") {
    return {
      title: "Blog – AI Study Tips & Learning Techniques",
      description:
        "Read VelocityAI's blog for cognitive learning strategies, active recall vs rereading, and guides to mastering exams with AI tools.",
      canonicalUrl: `${SITE_URL}/blog`,
      structuredData: {
        "@context": "https://schema.org",
        "@type": "Blog",
        name: "VelocityAI Blog",
        url: `${SITE_URL}/blog`,
        blogPost: BLOG_POSTS.map((p) => ({
          "@type": "BlogPosting",
          headline: p.title,
          url: `${SITE_URL}/blog/${p.id}`,
          datePublished: p.date,
          description: p.summary,
        })),
      },
      prerenderHtml: `
        <div class="min-h-screen bg-background text-foreground">
          <nav class="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center border-b border-border">
            <a href="/" class="font-bold text-xl">Velocity AI</a>
            <div class="flex items-center gap-4">
              <a href="/features" class="text-sm font-medium hover:text-primary">Features</a>
              <a href="/pricing" class="text-sm font-medium hover:text-primary">Pricing</a>
              <a href="/auth" class="text-sm font-semibold px-4 py-2 rounded-lg bg-primary text-primary-foreground">Get Started</a>
            </div>
          </nav>
          <main class="max-w-4xl mx-auto px-4 py-16">
            <h1 class="text-4xl font-bold mb-10 text-center">VelocityAI Blog</h1>
            <div class="space-y-6">
              ${BLOG_POSTS.map(
                (p) => `
                <article class="p-6 rounded-2xl border border-border bg-card shadow-sm hover:border-primary/50 transition-colors">
                  <a href="/blog/${p.id}" class="block">
                    <h2 class="text-2xl font-bold mb-2 text-foreground hover:text-primary">${p.title}</h2>
                    <p class="text-xs text-muted-foreground mb-3">${p.date}</p>
                    <p class="text-sm text-muted-foreground">${p.summary}</p>
                  </a>
                </article>
              `
              ).join("")}
            </div>
          </main>
        </div>
      `,
    };
  }

  // 4. Individual Blog Post Page (/blog/:id)
  if (cleanPath.startsWith("/blog/")) {
    const postId = cleanPath.replace("/blog/", "");
    const post = BLOG_POSTS.find((p) => p.id === postId);
    if (post) {
      return {
        title: post.title,
        description: post.summary,
        canonicalUrl: `${SITE_URL}/blog/${post.id}`,
        structuredData: {
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.title,
          description: post.summary,
          datePublished: post.date,
          articleBody: post.content,
          publisher: {
            "@type": "Organization",
            name: SITE_NAME,
            logo: `${SITE_URL}/pwa-512x512.png`,
          },
          author: {
            "@type": "Organization",
            name: "VelocityAI Team",
          },
        },
        prerenderHtml: `
          <div class="min-h-screen bg-background text-foreground">
            <nav class="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center border-b border-border">
              <a href="/" class="font-bold text-xl">Velocity AI</a>
              <div class="flex items-center gap-4">
                <a href="/blog" class="text-sm font-medium hover:text-primary">← All Posts</a>
                <a href="/pricing" class="text-sm font-medium hover:text-primary">Pricing</a>
                <a href="/auth" class="text-sm font-semibold px-4 py-2 rounded-lg bg-primary text-primary-foreground">Get Started</a>
              </div>
            </nav>
            <main class="max-w-3xl mx-auto px-4 sm:px-6 py-16">
              <article class="prose dark:prose-invert max-w-none">
                <header class="mb-8">
                  <h1 class="text-3xl sm:text-4xl font-bold mb-3">${post.title}</h1>
                  <p class="text-sm text-muted-foreground">${post.date} • By VelocityAI Team</p>
                </header>
                <div class="text-base sm:text-lg leading-relaxed space-y-4 whitespace-pre-wrap">
                  ${post.content}
                </div>
              </article>
            </main>
          </div>
        `,
      };
    }
  }

  // 5. Default Homepage
  return {
    title: "Velocity AI (VelocityAI) – Official Website | AI Study Engine & Exam Prep",
    description:
      "The official Velocity AI (VelocityAI) study engine. Transform lecture notes, textbooks, and PDFs into AI summaries, active recall quizzes, and adaptive exam schedules.",
    canonicalUrl: `${SITE_URL}/`,
    structuredData: getSoftwareApplicationSchema(),
    prerenderHtml: null, // Keep existing highly optimized HeroSection skeleton
  };
}
