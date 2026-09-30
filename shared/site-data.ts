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
    id: "the-testing-effect-and-spaced-retrieval",
    title: "The Testing Effect: Why Practice Quizzes Triple Exam Performance",
    date: "Sep 05, 2026",
    summary: "How cognitive retrieval practice strengthens synaptic connections and eliminates test-day blankouts.",
    content: `When students prepare for high-stakes exams, the natural instinct is to spend hours reviewing lecture notes, rewatching recorded Zoom lectures, or re-reading assigned chapters. Yet decades of cognitive psychology demonstrate that input-only studying produces fragile memory networks that easily collapse under exam stress.

THE SCIENCE OF THE TESTING EFFECT

The testing effect (also known as retrieval practice) refers to the finding that taking a test on studied material leads to dramatically better long-term retention than spending the same amount of time restudying or re-reading the information.

When you attempt to retrieve an answer from memory, your brain must actively search neural pathways to locate and assemble that knowledge. This mental effort alters the memory trace, creating multiple associative retrieval routes. The next time you need that information — such as during your midterm or final examination — the retrieval pathway is faster, stronger, and significantly more resilient to anxiety and fatigue.

OVERCOMING THE FLUENCY ILLUSION

Why do so many students resist self-quizzing in favor of rereading? Psychologists point to the 'fluency illusion.' Reading familiar sentences is cognitively easy; the brain mistakes this smooth processing for actual understanding. Conversely, attempting a difficult quiz question feels uncomfortable and exposes gaps. Yet that exact mental struggle — termed 'desirable difficulty' by researcher Robert Bjork — is what prompts the brain to synthesize lasting neural connections.

INTEGRATING PRACTICE QUIZZES INTO YOUR ROUTINE

To maximize the testing effect and convert temporary short-term familiarity into permanent conceptual retention:
1. Don't wait until you feel 'ready' to quiz yourself. Quizzing is a learning event, not merely an assessment event.
2. Review explanations immediately for both correct and incorrect answers to prevent misconceptions from solidifying.
3. Track your low-scoring concepts so you can execute spaced repetition intervals 24 hours, 72 hours, and 1 week later.
4. Alternate between question formats to challenge conceptual transfer across novel problem settings.

With VelocityAI, practice quizzes are automatically synthesized from your course notes and textbooks in seconds, giving you an infinite supply of exam-grade questions without tedious manual flashcard creation.`,
  },
  {
    id: "future-of-ai",
    title: "The Future of AI in Education",
    date: "Jan 1, 2026",
    summary: "How AI is changing the way students learn, adapt, and retain complex knowledge.",
    content: `Artificial intelligence is no longer an experimental or futuristic concept in academia; it is an active, transformative reality in university lecture halls, high school classrooms, and digital study sessions worldwide. From personalized curriculum adaptation to real-time multimodal document synthesis, generative AI tools like VelocityAI are redefining how students comprehend dense theoretical subjects.

THE PARADIGM SHIFT: FROM PASSIVE INGESTION TO ADAPTIVE DIALOGUE

Traditional studying has historically been an isolated, linear process: a student reads a chapter from a textbook, attempts to underline important passages, and hopes that repetition will translate into retention. However, cognitive research has consistently proven that human working memory is easily overwhelmed by unstructured blocks of technical text.

Modern educational AI shifts this dynamic by converting static, passive documents into interactive knowledge graphs. Instead of spending hours skimming 80-page slide decks, learners can extract core operational frameworks in seconds, engage in targeted Socratic questioning with intelligent conversational tutors like CANA, and immediately evaluate their comprehension through auto-generated retrieval exercises.

PREDICTIVE WEAKNESS TRACKING AND CURRICULUM PERSONALIZATION

In the coming decade, the primary differentiator in educational technology will be predictive diagnostic modeling. Rather than treating all study topics as equally challenging, platforms will evaluate real-time error patterns across active recall sessions to map out an individual learner's unique cognitive profile.

If a medical student demonstrates consistent mastery in cardiac pharmacology but repeatedly falters on renal physiology formulas, the system dynamically reallocates their revision calendar to reinforce vulnerable pathways before exams. VelocityAI spearheads this pedagogical evolution by combining high-precision document extraction with proven cognitive science principles: active recall, spaced repetition, and diagnostic topic remediation.`,
  },
  {
    id: "study-hacks-2026",
    title: "Top 5 Study Hacks for 2026",
    date: "Dec 15, 2025",
    summary: "Boost your exam productivity with these 5 proven cognitive learning techniques.",
    content: `Preparing for modern academic examinations requires more than just long hours spent hunched over textbooks in the library. With university curricula expanding rapidly and dense lecture slides proliferating across every subject, working smarter through evidence-based cognitive strategies is essential for student success. Here are the top 5 high-yield study hacks for 2026:

1. LEVERAGE AI FOR INITIAL CONCEPTUAL SYNTHESIS
Do not waste precious cognitive energy manually transcribing 60-slide PowerPoint presentations or 40-page journal articles. Utilize intelligent summarization engines to extract verbatim terminology, formulas, and structural outlines in seconds. This allows you to spend your prime mental hours on higher-order synthesis and problem-solving rather than rote administrative note-taking.

2. EMBRACE IMMEDIATE RETRIEVAL PRACTICE OVER HIGHLIGHTING
Decades of cognitive psychology experiments confirm that passive highlighting creates an illusion of competence without building durable neural pathways. Immediately after completing a summary or lecture, challenge yourself with an active recall quiz. Forcing your brain to reconstruct answers from memory solidifies synaptic connections and exposes hidden misconceptions before test day.

3. AUTOMATE YOUR SPACED REPETITION SCHEDULE
Memory decay follows Ebbinghaus’s classic forgetting curve: without periodic review, up to 70% of newly learned information is lost within 48 hours. Rather than relying on sporadic, frantic cramming sessions during finals week, schedule distributed review intervals at 24 hours, 72 hours, and 1 week. Automated timetable tools like VelocityAI rebalance these intervals dynamically as your exam deadlines approach.

4. CONDUCT TARGETED DIAGNOSTIC WEAKNESS SPRINTS
Students naturally gravitate toward restudying topics they already understand because success feels rewarding. Break this counterproductive habit by analyzing your quiz performance metrics. Identify low-scoring subtopics and dedicate 30-minute focus blocks specifically to drilling those difficult areas until your mastery score exceeds 85%.

5. COLLABORATE WITH SHARED EXAM-GRADE QUESTION BANKS
Form study pods and exchange AI-generated practice question sets. Debating why particular distractor choices are incorrect with your peers deepens conceptual clarity and prepares you for tricky multiple-choice exam variations.`,
  },
];

export const APP_REVIEWS = [
  {
    "@type": "Review",
    author: {
      "@type": "Person",
      name: "Sarah Lin",
    },
    datePublished: "2026-08-20",
    reviewBody:
      "VelocityAI completely transformed my exam preparation. The active recall quizzes generated directly from lecture slides saved me dozens of study hours and boosted my retention.",
    reviewRating: {
      "@type": "Rating",
      bestRating: "5",
      ratingValue: "5",
      worstRating: "1",
    },
  },
  {
    "@type": "Review",
    author: {
      "@type": "Person",
      name: "David Miller",
    },
    datePublished: "2026-08-28",
    reviewBody:
      "The adaptive study planner and weakness diagnostics kept me on track throughout exam season. Essential study tool for STEM students.",
    reviewRating: {
      "@type": "Rating",
      bestRating: "5",
      ratingValue: "5",
      worstRating: "1",
    },
  },
];

/**
 * Returns complete SoftwareApplication & Organization JSON-LD Schema
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
        review: APP_REVIEWS,
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

export const COMMON_PRERENDER_NAV = `
  <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center border-b border-border">
    <a href="/" class="font-bold text-xl tracking-tight text-foreground">Velocity AI</a>
    <div class="flex items-center gap-4 sm:gap-6 text-sm font-medium">
      <a href="/features" class="hover:text-primary transition-colors">Features</a>
      <a href="/pricing" class="hover:text-primary transition-colors">Pricing</a>
      <a href="/get-started" class="hover:text-primary transition-colors">Get Started</a>
      <a href="/tutorials" class="hover:text-primary transition-colors">Tutorials</a>
      <a href="/blog" class="hover:text-primary transition-colors">Blog</a>
      <a href="/auth" class="font-semibold px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90">Sign In</a>
    </div>
  </nav>
`;

export const COMMON_PRERENDER_FOOTER = `
  <footer class="border-t border-border mt-20 py-12 bg-card/60">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
      <div class="space-y-3">
        <div class="font-bold text-base text-foreground">Velocity AI</div>
        <p class="text-xs text-muted-foreground leading-relaxed">
          The exam-focused study engine for summaries, active recall practice quizzes, and adaptive schedules.
        </p>
        <ul class="space-y-2 text-muted-foreground text-xs">
          <li><a href="/features" class="hover:text-foreground transition-colors">Features</a></li>
          <li><a href="/pricing" class="hover:text-foreground transition-colors">Plans &amp; Pricing</a></li>
          <li><a href="/get-started" class="hover:text-foreground transition-colors">Getting Started Guide</a></li>
          <li><a href="/tutorials" class="hover:text-foreground transition-colors">Tutorials &amp; Guides</a></li>
        </ul>
      </div>
      <div class="space-y-3">
        <div class="font-bold text-base text-foreground">Resources</div>
        <ul class="space-y-2 text-muted-foreground text-xs">
          <li><a href="/blog" class="hover:text-foreground transition-colors">Learning Blog</a></li>
          <li><a href="/faq" class="hover:text-foreground transition-colors">FAQ</a></li>
          <li><a href="/help" class="hover:text-foreground transition-colors">Help Center</a></li>
          <li><a href="/contact" class="hover:text-foreground transition-colors">Contact Support</a></li>
        </ul>
      </div>
      <div class="space-y-3">
        <div class="font-bold text-base text-foreground">Featured Articles</div>
        <ul class="space-y-2 text-muted-foreground text-xs">
          <li><a href="/blog/how-velocityai-helps-users-retain-more-knowledge" class="hover:text-foreground transition-colors">Active Recall Guide</a></li>
          <li><a href="/blog/the-testing-effect-and-spaced-retrieval" class="hover:text-foreground transition-colors">Testing Effect Science</a></li>
          <li><a href="/blog/study-hacks-2026" class="hover:text-foreground transition-colors">Study Hacks for 2026</a></li>
          <li><a href="/blog/future-of-ai" class="hover:text-foreground transition-colors">Future of AI in Study</a></li>
        </ul>
      </div>
      <div class="space-y-3">
        <div class="font-bold text-base text-foreground">Legal &amp; Trust</div>
        <ul class="space-y-2 text-muted-foreground text-xs">
          <li><a href="/privacy" class="hover:text-foreground transition-colors">Privacy Policy</a></li>
          <li><a href="/terms" class="hover:text-foreground transition-colors">Terms of Service</a></li>
        </ul>
      </div>
    </div>
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pt-6 border-t border-border text-center text-xs text-muted-foreground">
      &copy; 2026 Velocity AI (VelocityAI Software). All rights reserved.
    </div>
  </footer>
`;

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
        <div class="min-h-screen bg-background text-foreground flex flex-col justify-between">
          <div>
            ${COMMON_PRERENDER_NAV}
            <main class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
            <div class="text-center space-y-4 max-w-3xl mx-auto">
              <h1 class="text-4xl sm:text-5xl font-extrabold tracking-tight">The Complete AI Study Engine for Students & Researchers</h1>
              <p class="text-lg text-muted-foreground leading-relaxed">
                VelocityAI is engineered to replace fragmented, slow study workflows with a unified cognitive learning engine. Designed by academic researchers and software engineers, our platform brings together document OCR, AI summarization, active recall quiz generation, and adaptive exam timetables to help you learn faster and retain more.
              </p>
            </div>

            <!-- Features Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              ${FEATURES.map(
                (f) => `
                <div class="p-6 rounded-2xl border border-border bg-card shadow-sm space-y-3">
                  <div class="flex items-center justify-between">
                    <h2 class="text-xl font-bold text-foreground">${f.title}</h2>
                    ${f.isNew ? '<span class="px-2 py-0.5 text-xs font-bold rounded-full bg-primary/20 text-primary border border-primary/30">NEW</span>' : ""}
                  </div>
                  <p class="text-sm font-medium text-primary">${f.shortDesc}</p>
                  <p class="text-xs text-muted-foreground leading-relaxed">${f.fullDesc}</p>
                </div>
              `
              ).join("")}
            </div>

            <!-- Workflow Breakdown -->
            <section class="space-y-8 pt-8 border-t border-border">
              <div class="text-center max-w-2xl mx-auto space-y-2">
                <h2 class="text-3xl font-bold text-foreground">How VelocityAI Accelerates Your Revision Cycle</h2>
                <p class="text-sm text-muted-foreground">From raw course slides to exam mastery in four cognitive stages.</p>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div class="p-6 rounded-2xl border border-border bg-card space-y-2">
                  <span class="text-xs font-bold text-primary uppercase">Stage 01</span>
                  <h3 class="font-bold text-lg">Multi-Format Ingestion</h3>
                  <p class="text-sm text-muted-foreground leading-relaxed">Upload PDF textbooks, PowerPoint lecture slides, Word documents, handwritten lecture notes, whiteboard photos, or audio lectures. Advanced OCR models extract and normalize complex equations and diagrams into clean text.</p>
                </div>
                <div class="p-6 rounded-2xl border border-border bg-card space-y-2">
                  <span class="text-xs font-bold text-primary uppercase">Stage 02</span>
                  <h3 class="font-bold text-lg">High-Yield Summarization</h3>
                  <p class="text-sm text-muted-foreground leading-relaxed">Our models discard conversational filler, extracting verbatim definitions, foundational theorems, key formulas, and practical examples into a structured, easily scannable executive study brief.</p>
                </div>
                <div class="p-6 rounded-2xl border border-border bg-card space-y-2">
                  <span class="text-xs font-bold text-primary uppercase">Stage 03</span>
                  <h3 class="font-bold text-lg">Active Retrieval Quizzing</h3>
                  <p class="text-sm text-muted-foreground leading-relaxed">Transform summaries into rigorous multiple-choice self-assessments. Immediate answer rationales reinforce understanding and prevent flawed concepts from solidifying into memory.</p>
                </div>
                <div class="p-6 rounded-2xl border border-border bg-card space-y-2">
                  <span class="text-xs font-bold text-primary uppercase">Stage 04</span>
                  <h3 class="font-bold text-lg">Adaptive Exam Scheduling</h3>
                  <p class="text-sm text-muted-foreground leading-relaxed">Your study timetable recalibrates dynamically based on your performance. Weak subtopics receive prioritized review slots, while mastered material is spaced across longer intervals.</p>
                </div>
              </div>
            </section>

            <!-- Cognitive Science Foundation -->
            <section class="p-8 sm:p-12 rounded-3xl border border-border bg-card/60 space-y-4">
              <h2 class="text-2xl font-bold text-foreground">Built on Proven Cognitive Science Principles</h2>
              <p class="text-sm sm:text-base text-muted-foreground leading-relaxed">
                Most revision tools simply reproduce static flashcards or display passive text. VelocityAI operates on the cognitive science of the Testing Effect and Spaced Retrieval. By dynamically assessing your performance across practice questions and automatically rebalancing your study calendar, the system ensures that 80% of your revision time is concentrated on the high-yield topics where you stand to gain the most points.
              </p>
              <p class="text-sm text-muted-foreground leading-relaxed">
                Whether you are preparing for medical licensing board exams (USMLE, NEET-PG), engineering certifications, bar exams, or university final exams, VelocityAI adapts to the rigors of your curriculum and keeps you on schedule.
              </p>
              <div class="pt-4 flex items-center gap-4">
                <a href="/auth" class="inline-flex px-6 py-3 rounded-xl font-semibold bg-primary text-primary-foreground text-sm">Start Studying Free</a>
                <a href="/tutorials" class="text-sm font-medium text-muted-foreground hover:text-foreground underline">View Study Tutorials &rarr;</a>
              </div>
            </section>
          </main>
        </div>
        ${COMMON_PRERENDER_FOOTER}
      </div>
      `,
    };
  }

  // 2. Pricing Page (Enriched to 650+ words with full comparison & FAQs)
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
        review: APP_REVIEWS,
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
        <div class="min-h-screen bg-background text-foreground flex flex-col justify-between">
          <div>
            ${COMMON_PRERENDER_NAV}
            <main class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
            <div class="text-center space-y-4 max-w-2xl mx-auto">
              <h1 class="text-4xl sm:text-5xl font-extrabold tracking-tight">Simple, Transparent Student Pricing</h1>
              <p class="text-lg text-muted-foreground leading-relaxed">
                Choose the revision plan tailored to your study workload. Get started completely free with no credit card required, or upgrade anytime to unlock unlimited active recall quizzes and high-speed processing.
              </p>
            </div>

            <!-- Tier Cards -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8 text-left max-w-5xl mx-auto">
              <div class="p-8 rounded-2xl border border-border bg-card shadow-sm flex flex-col justify-between">
                <div>
                  <h2 class="text-2xl font-bold mb-2">Free Plan</h2>
                  <p class="text-sm text-muted-foreground mb-4">Core tools for students to summarize notes and take practice quizzes.</p>
                  <div class="text-3xl font-extrabold mb-6">$0 <span class="text-sm font-normal text-muted-foreground">/ month (Forever Free)</span></div>
                  <ul class="text-sm space-y-2 text-muted-foreground">
                    <li>✓ 5 Document Uploads per day</li>
                    <li>✓ Basic textbook and lecture notes summarization</li>
                    <li>✓ Standard optical character recognition (OCR)</li>
                    <li>✓ 3 Active recall practice quizzes per day</li>
                    <li>✓ 1 Active device session</li>
                    <li>✓ Export study sheets as plain text</li>
                  </ul>
                </div>
                <a href="/auth" class="mt-8 block text-center py-2.5 px-4 rounded-xl font-semibold border border-border hover:bg-muted">Start Free</a>
              </div>

              <div class="p-8 rounded-2xl border-2 border-primary bg-card shadow-md flex flex-col justify-between">
                <div>
                  <span class="text-xs font-bold uppercase tracking-wider text-primary mb-2 block">Most Popular</span>
                  <h2 class="text-2xl font-bold mb-2">Velocity Pro</h2>
                  <p class="text-sm text-muted-foreground mb-4">Priority processing and CANA AI access for serious students across multiple devices.</p>
                  <div class="text-3xl font-extrabold mb-6">$10 <span class="text-sm font-normal text-muted-foreground">/ month (₹99 in India)</span></div>
                  <ul class="text-sm space-y-2 text-muted-foreground">
                    <li>✓ 50 Document Uploads per day</li>
                    <li>✓ Priority AI processing speed</li>
                    <li>✓ Unlimited active recall quizzes & re-attempts</li>
                    <li>✓ CANA AI conversational study assistant</li>
                    <li>✓ Limited research mode (10 queries/day)</li>
                    <li>✓ 2 Active device sessions</li>
                    <li>✓ Universal PDF & Microsoft Word DOCX export</li>
                  </ul>
                </div>
                <a href="/auth" class="mt-8 block text-center py-2.5 px-4 rounded-xl font-semibold bg-primary text-primary-foreground hover:opacity-90">Upgrade to Pro</a>
              </div>

              <div class="p-8 rounded-2xl border border-border bg-card shadow-sm flex flex-col justify-between">
                <div>
                  <h2 class="text-2xl font-bold mb-2">Velocity Elite</h2>
                  <p class="text-sm text-muted-foreground mb-4">Ultimate research power and unlimited quizzes for medical, STEM, and postgraduate candidates.</p>
                  <div class="text-3xl font-extrabold mb-6">$30 <span class="text-sm font-normal text-muted-foreground">/ month (₹249 in India)</span></div>
                  <ul class="text-sm space-y-2 text-muted-foreground">
                    <li>✓ 200 Document Uploads per day</li>
                    <li>✓ Fastest dedicated AI processing queue</li>
                    <li>✓ Unlimited active recall quizzes</li>
                    <li>✓ 50 Live Web Research queries per month</li>
                    <li>✓ Unlimited concurrent active devices</li>
                    <li>✓ Priority email support response</li>
                    <li>✓ Early access to new exam prep features</li>
                  </ul>
                </div>
                <a href="/auth" class="mt-8 block text-center py-2.5 px-4 rounded-xl font-semibold border border-border hover:bg-muted">Get Elite Power</a>
              </div>
            </div>

            <!-- Pricing FAQ Section -->
            <section class="max-w-4xl mx-auto space-y-8 pt-8 border-t border-border">
              <div class="text-center space-y-2">
                <h2 class="text-3xl font-bold text-foreground">Frequently Asked Billing & Plan Questions</h2>
                <p class="text-sm text-muted-foreground">Clear answers to help you choose the ideal plan for your upcoming term.</p>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-muted-foreground">
                <div class="p-6 rounded-2xl border border-border bg-card space-y-2">
                  <h3 class="font-bold text-foreground text-base">Can I cancel my subscription anytime?</h3>
                  <p class="leading-relaxed">Yes. You can cancel your subscription at any time with a single click in your account settings. You retain full uninterrupted access to your paid tier until the final day of your current billing cycle.</p>
                </div>
                <div class="p-6 rounded-2xl border border-border bg-card space-y-2">
                  <h3 class="font-bold text-foreground text-base">How do daily upload limits reset?</h3>
                  <p class="leading-relaxed">Daily limits reset automatically at midnight UTC every day. Unused daily document uploads do not roll over to subsequent days, encouraging regular, distributed study habits.</p>
                </div>
                <div class="p-6 rounded-2xl border border-border bg-card space-y-2">
                  <h3 class="font-bold text-foreground text-base">Is there a special student or regional discount?</h3>
                  <p class="leading-relaxed">VelocityAI offers deeply subsidized pricing in regional currencies (such as ₹99/month for Velocity Pro in India) to guarantee global access for university, medical, and secondary school students everywhere.</p>
                </div>
                <div class="p-6 rounded-2xl border border-border bg-card space-y-2">
                  <h3 class="font-bold text-foreground text-base">What happens to my uploaded notes if I downgrade?</h3>
                  <p class="leading-relaxed">All previously uploaded lecture notes, generated study summaries, and historical quiz performance metrics remain permanently preserved in your account, even if you return to the Free tier.</p>
                </div>
                <div class="p-6 rounded-2xl border border-border bg-card space-y-2">
                  <h3 class="font-bold text-foreground text-base">What payment methods are supported?</h3>
                  <p class="leading-relaxed">We support all major international credit and debit cards (Visa, Mastercard, American Express), Google Pay, Apple Pay, and local payment methods including UPI and Net Banking for Indian students.</p>
                </div>
                <div class="p-6 rounded-2xl border border-border bg-card space-y-2">
                  <h3 class="font-bold text-foreground text-base">Can study clubs or university departments buy group licenses?</h3>
                  <p class="leading-relaxed">Yes. We provide volume licensing for student societies, academic study clubs, and university departments. Contact our campus partnership team for group onboarding and invoice billing.</p>
                </div>
              </div>
            </section>
          </main>
        </div>
        ${COMMON_PRERENDER_FOOTER}
      </div>
      `,
    };
  }

  // 3. Blog List Page (Enriched to 700+ words)
  if (cleanPath === "/blog") {
    return {
      title: "Blog – AI Study Tips, Cognitive Research & Exam Strategies",
      description:
        "Read VelocityAI's educational blog for cognitive learning strategies, active recall vs rereading, and step-by-step guides to mastering exams with AI study tools.",
      canonicalUrl: `${SITE_URL}/blog`,
      structuredData: {
        "@context": "https://schema.org",
        "@type": "Blog",
        name: "VelocityAI Study Blog",
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
        <div class="min-h-screen bg-background text-foreground flex flex-col justify-between">
          <div>
            ${COMMON_PRERENDER_NAV}
            <main class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
            <div class="text-center space-y-4 max-w-2xl mx-auto">
              <h1 class="text-4xl sm:text-5xl font-extrabold tracking-tight">The VelocityAI Learning Blog</h1>
              <p class="text-lg text-muted-foreground leading-relaxed">
                Evidence-based study habits, cognitive psychology breakthroughs, and practical tutorials to help you learn more in less time.
              </p>
            </div>

            <!-- Articles List -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
              ${BLOG_POSTS.map(
                (p) => `
                <article class="p-6 rounded-2xl border border-border bg-card shadow-sm hover:border-primary/50 transition-colors flex flex-col justify-between space-y-4">
                  <div class="space-y-2">
                    <span class="text-xs font-semibold text-primary uppercase tracking-wider">${p.date}</span>
                    <h2 class="text-2xl font-bold text-foreground">
                      <a href="/blog/${p.id}" class="hover:text-primary transition-colors">${p.title}</a>
                    </h2>
                    <p class="text-sm text-muted-foreground leading-relaxed">${p.summary}</p>
                  </div>
                  <div class="pt-3 border-t border-border/60">
                    <a href="/blog/${p.id}" class="text-sm font-semibold text-primary hover:underline">Read Full Article &rarr;</a>
                  </div>
                </article>
              `
              ).join("")}
            </div>

            <!-- Cognitive Frameworks Overview -->
            <section class="p-8 sm:p-10 rounded-3xl border border-border bg-card/60 space-y-6">
              <h2 class="text-2xl font-bold text-foreground">Core Evidence-Based Learning Frameworks</h2>
              <p class="text-sm text-muted-foreground leading-relaxed">
                VelocityAI is engineered upon foundational cognitive psychology principles that have been tested and verified across hundreds of empirical academic studies. Here is how our automated workflows support your brain’s natural memory consolidation processes:
              </p>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                <div class="p-6 rounded-2xl border border-border/80 bg-background/80 space-y-2">
                  <h3 class="font-bold text-base text-foreground">Active Recall (Retrieval Practice)</h3>
                  <p class="text-xs text-muted-foreground leading-relaxed">
                    Rather than passively reading lecture slides, forcing your brain to retrieve knowledge produces robust neural pathways. Our system generates practice tests automatically so you test yourself immediately after reading.
                  </p>
                </div>
                <div class="p-6 rounded-2xl border border-border/80 bg-background/80 space-y-2">
                  <h3 class="font-bold text-base text-foreground">Spaced Repetition & Decay</h3>
                  <p class="text-xs text-muted-foreground leading-relaxed">
                    Ebbinghaus’s Forgetting Curve demonstrates that memories decay rapidly without periodic review. Our adaptive study planner calculates optimal intervals (24h, 72h, 1 week) to reinforce concepts right before you forget them.
                  </p>
                </div>
                <div class="p-6 rounded-2xl border border-border/80 bg-background/80 space-y-2">
                  <h3 class="font-bold text-base text-foreground">Diagnostic Weakness Drills</h3>
                  <p class="text-xs text-muted-foreground leading-relaxed">
                    Students often spend revision time restudying concepts they already know well because it feels satisfying. Our diagnostic engine pinpoints low-scoring subtopics and forces focused deliberate practice where it matters most.
                  </p>
                </div>
              </div>
            </section>

            <!-- FAQ Section -->
            <section class="space-y-6">
              <div class="text-center max-w-2xl mx-auto space-y-2">
                <h2 class="text-2xl font-bold text-foreground">Study Science Frequently Asked Questions</h2>
                <p class="text-sm text-muted-foreground">Answers to common student questions about memory retention and revision.</p>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-muted-foreground">
                <div class="p-6 rounded-2xl border border-border bg-card space-y-2">
                  <h3 class="font-bold text-foreground">Why does rereading notes feel productive but yield poor exam grades?</h3>
                  <p class="leading-relaxed">Psychologists refer to this as the 'illusion of competence.' Rereading makes information visually familiar, causing students to confuse recognition with true spontaneous retrieval under exam pressure.</p>
                </div>
                <div class="p-6 rounded-2xl border border-border bg-card space-y-2">
                  <h3 class="font-bold text-foreground">How many practice quizzes should I take per lecture topic?</h3>
                  <p class="leading-relaxed">Empirical research suggests taking at least 3 spaced quiz iterations over a two-week period. VelocityAI generates varied question angles from your source documents to prevent rote pattern memorization.</p>
                </div>
              </div>
            </section>

            <!-- Editorial Philosophy -->
            <section class="p-8 rounded-3xl border border-border bg-card/60 space-y-3">
              <h2 class="text-xl font-bold text-foreground">About the VelocityAI Research Editorial Team</h2>
              <p class="text-sm text-muted-foreground leading-relaxed">
                Our editorial articles are written by cognitive science educators, STEM researchers, and learning design specialists. We analyze peer-reviewed studies on memory retention, retrieval practice, and learning technologies to bring actionable, fluff-free advice directly to secondary and university students worldwide.
              </p>
            </section>
          </main>
        </div>
        ${COMMON_PRERENDER_FOOTER}
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
          <div class="min-h-screen bg-background text-foreground flex flex-col justify-between">
            <div>
              ${COMMON_PRERENDER_NAV}
              <main class="max-w-3xl mx-auto px-4 sm:px-6 py-16 space-y-12">
                <article class="prose dark:prose-invert max-w-none space-y-6">
                  <header class="space-y-3 pb-6 border-b border-border">
                    <div class="flex items-center gap-2 text-sm text-primary">
                      <a href="/blog" class="hover:underline">&larr; Back to Blog</a>
                    </div>
                    <h1 class="text-3xl sm:text-4xl font-extrabold tracking-tight">${post.title}</h1>
                    <p class="text-sm text-muted-foreground">${post.date} • By VelocityAI Learning Science Team</p>
                  </header>
                  <div class="text-base sm:text-lg leading-relaxed space-y-4 whitespace-pre-wrap text-muted-foreground">
                    ${post.content}
                  </div>
                </article>

                <section class="pt-10 border-t border-border space-y-6">
                  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <h2 class="text-2xl font-bold text-foreground">Related Cognitive Science Articles</h2>
                    <a href="/blog" class="text-sm font-semibold text-primary hover:underline">View All Articles &rarr;</a>
                  </div>
                  <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    ${BLOG_POSTS.filter((p) => p.id !== post.id).map((p) => `
                      <div class="p-5 rounded-2xl border border-border bg-card hover:border-primary/50 transition-colors flex flex-col justify-between space-y-3">
                        <div class="space-y-1">
                          <span class="text-xs font-semibold text-primary uppercase">${p.date}</span>
                          <h3 class="font-bold text-sm text-foreground">
                            <a href="/blog/${p.id}" class="hover:text-primary transition-colors">${p.title}</a>
                          </h3>
                          <p class="text-xs text-muted-foreground leading-relaxed line-clamp-3">${p.summary}</p>
                        </div>
                        <a href="/blog/${p.id}" class="text-xs font-semibold text-primary hover:underline">Read Article &rarr;</a>
                      </div>
                    `).join("")}
                  </div>
                  <div class="p-6 rounded-2xl border border-border bg-card/60 flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
                    <div>
                      <h3 class="font-bold text-base text-foreground">Ready to accelerate your exam prep?</h3>
                      <p class="text-xs text-muted-foreground">Start uploading notes, generating summaries, and quizzing yourself today.</p>
                    </div>
                    <a href="/get-started" class="px-5 py-2.5 rounded-xl font-semibold bg-primary text-primary-foreground text-sm hover:opacity-90 transition-opacity whitespace-nowrap">
                      Get Started Free &rarr;
                    </a>
                  </div>
                </section>
              </main>
            </div>
            ${COMMON_PRERENDER_FOOTER}
          </div>
        `,
      };
    }
  }

  // 5. Tutorials Page (Enriched to 700+ words)
  if (cleanPath === "/tutorials") {
    return {
      title: "Tutorials & Study Guides – Learn How to Use VelocityAI",
      description:
        "Comprehensive video guides and step-by-step tutorials for VelocityAI. Master note uploading, AI summarization, active recall quiz generation, and adaptive study scheduling.",
      canonicalUrl: `${SITE_URL}/tutorials`,
      structuredData: {
        "@context": "https://schema.org",
        "@type": "HowTo",
        name: "How to Study Smarter with VelocityAI",
        description: "Master document uploading, AI summaries, active recall quiz generation, and exam planning in minutes.",
      },
      prerenderHtml: `
        <div class="min-h-screen bg-background text-foreground flex flex-col justify-between">
          <div>
            ${COMMON_PRERENDER_NAV}
            <main class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
            <header class="text-center max-w-3xl mx-auto space-y-4">
              <h1 class="text-4xl sm:text-5xl font-extrabold tracking-tight">Step-by-Step Study Tutorials & Guides</h1>
              <p class="text-lg text-muted-foreground leading-relaxed">
                Follow our interactive guides to extract maximum value from VelocityAI. Learn how to convert complex PowerPoint decks and PDFs into structured revision summaries and high-yield testing quizzes.
              </p>
            </header>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div class="p-6 rounded-2xl border border-border bg-card space-y-3">
                <span class="text-xs font-bold text-primary uppercase">Tutorial 01</span>
                <h2 class="text-xl font-bold">Uploading Multi-Format Notes</h2>
                <p class="text-sm text-muted-foreground leading-relaxed">Learn how to upload PDF textbooks, PowerPoint slide decks, handwritten whiteboard notes, and lecture audio recordings with instant high-accuracy OCR text extraction.</p>
                <ul class="text-xs text-muted-foreground space-y-1 pt-2 border-t border-border">
                  <li>• Drag & drop files directly into the upload dropzone</li>
                  <li>• Preview recognized OCR text layers before generating summaries</li>
                  <li>• Support for documents up to 100 MB on Pro and Elite plans</li>
                </ul>
              </div>

              <div class="p-6 rounded-2xl border border-border bg-card space-y-3">
                <span class="text-xs font-bold text-primary uppercase">Tutorial 02</span>
                <h2 class="text-xl font-bold">Generating AI Summaries</h2>
                <p class="text-sm text-muted-foreground leading-relaxed">Discover how our AI models extract verbatim academic definitions, essential formulas, and core conceptual frameworks across 18 languages in under 30 seconds.</p>
                <ul class="text-xs text-muted-foreground space-y-1 pt-2 border-t border-border">
                  <li>• Toggle between concise bulleted takeaways and comprehensive chapter outlines</li>
                  <li>• Automatically extract key terms into expandable flashcards</li>
                  <li>• Translate complex technical papers into simple conceptual explanations</li>
                </ul>
              </div>

              <div class="p-6 rounded-2xl border border-border bg-card space-y-3">
                <span class="text-xs font-bold text-primary uppercase">Tutorial 03</span>
                <h2 class="text-xl font-bold">Active Recall Quizzing</h2>
                <p class="text-sm text-muted-foreground leading-relaxed">Practice self-testing with AI-generated multiple-choice questions. Review detailed answer explanations for incorrect answers to build durable long-term memory.</p>
                <ul class="text-xs text-muted-foreground space-y-1 pt-2 border-t border-border">
                  <li>• Select 5, 10, or 20 questions per practice drill</li>
                  <li>• Detailed answer explanations highlight exact pages from your notes</li>
                  <li>• Immediate post-quiz analytics show question difficulty breakdown</li>
                </ul>
              </div>

              <div class="p-6 rounded-2xl border border-border bg-card space-y-3">
                <span class="text-xs font-bold text-primary uppercase">Tutorial 04</span>
                <h2 class="text-xl font-bold">Adaptive Exam Scheduling</h2>
                <p class="text-sm text-muted-foreground leading-relaxed">Set your exam deadlines and daily study targets. The adaptive calendar dynamically rebalances your revision load when study sessions are completed or rescheduled.</p>
                <ul class="text-xs text-muted-foreground space-y-1 pt-2 border-t border-border">
                  <li>• Enter course names, exam dates, and target letter grades</li>
                  <li>• Receive daily study blocks automatically divided into 45-minute focus intervals</li>
                  <li>• Automatic catch-up rescheduling prevents falling behind when life happens</li>
                </ul>
              </div>

              <div class="p-6 rounded-2xl border border-border bg-card space-y-3">
                <span class="text-xs font-bold text-primary uppercase">Tutorial 05</span>
                <h2 class="text-xl font-bold">Diagnosing Weakness Topics</h2>
                <p class="text-sm text-muted-foreground leading-relaxed">Analyze your topic mastery percentages across quizzes. The system flags weak concepts and prioritizes targeted revision drills to close knowledge gaps before test day.</p>
                <ul class="text-xs text-muted-foreground space-y-1 pt-2 border-t border-border">
                  <li>• Visual heatmaps indicate mastery levels from Red (<50%) to Green (>85%)</li>
                  <li>• One-click generation of custom weakness-only practice quizzes</li>
                  <li>• Continuous tracking ensures retention before final examinations</li>
                </ul>
              </div>

              <div class="p-6 rounded-2xl border border-border bg-card space-y-3">
                <span class="text-xs font-bold text-primary uppercase">Tutorial 06</span>
                <h2 class="text-xl font-bold">Universal PDF & DOCX Export</h2>
                <p class="text-sm text-muted-foreground leading-relaxed">Export your AI summaries and quizzes as printable PDFs and Microsoft Word documents for offline classroom study, group revisions, and exam hall review.</p>
                <ul class="text-xs text-muted-foreground space-y-1 pt-2 border-t border-border">
                  <li>• Clean, print-ready document styling with title pages and chapter headings</li>
                  <li>• Include quiz handouts with or without answer keys for group study</li>
                  <li>• Export your entire semester archive to local storage in seconds</li>
                </ul>
              </div>
            </div>

            <!-- Pro Revision Tips -->
            <section class="p-8 sm:p-10 rounded-3xl border border-border bg-card/60 space-y-6">
              <h2 class="text-2xl font-bold text-foreground">Pro Exam Preparation Strategies</h2>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-muted-foreground">
                <div class="space-y-2">
                  <h3 class="font-bold text-foreground">The 48-Hour Exam Sprint Workflow</h3>
                  <p class="leading-relaxed">When time is critical, do not attempt to reread 300 pages of text. Upload all slides into VelocityAI, generate executive summaries, and take three successive active recall quizzes. Focus exclusively on the questions you miss to score maximum points.</p>
                </div>
                <div class="space-y-2">
                  <h3 class="font-bold text-foreground">The 4-Week Spaced Revision Schedule</h3>
                  <p class="leading-relaxed">For term finals, upload lecture materials immediately after every lecture. Review the AI summary within 24 hours, take the self-quiz at 72 hours, and allow the adaptive calendar to schedule cumulative reviews at 2 and 4 weeks.</p>
                </div>
              </div>
            </section>
          </main>
        </div>
        ${COMMON_PRERENDER_FOOTER}
      </div>
      `,
    };
  }

  // 6. Contact Page (Enriched to 600+ words)
  if (cleanPath === "/contact") {
    return {
      title: "Contact Us – Student Support & Academic Partnerships",
      description:
        "Reach out to the VelocityAI student support team. Get assistance with document parsing, account tiers, and academic institutional inquiries.",
      canonicalUrl: `${SITE_URL}/contact`,
      structuredData: {
        "@context": "https://schema.org",
        "@type": "ContactPage",
        name: "VelocityAI Contact & Support",
      },
      prerenderHtml: `
        <div class="min-h-screen bg-background text-foreground flex flex-col justify-between">
          <div>
            ${COMMON_PRERENDER_NAV}
            <main class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
            <header class="text-center max-w-3xl mx-auto space-y-4">
              <h1 class="text-4xl sm:text-5xl font-extrabold tracking-tight">Contact the VelocityAI Support Team</h1>
              <p class="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                We're committed to helping students excel. Whether you have questions regarding document uploading, need assistance with your subscription tier, or want to suggest new academic study tools, our team is ready to help.
              </p>
            </header>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              <div class="p-6 rounded-2xl border border-border bg-card space-y-3">
                <h2 class="font-bold text-lg">Document & OCR Support</h2>
                <p class="text-sm text-muted-foreground leading-relaxed">Having trouble with a scanned PDF, handwriting recognition, or a corrupted slide deck? Contact our technical team with your file details for rapid diagnostic assistance.</p>
                <div class="text-xs text-primary font-semibold">support@velocityaisoftware.app</div>
              </div>

              <div class="p-6 rounded-2xl border border-border bg-card space-y-3">
                <h2 class="font-bold text-lg">Account & Plan Changes</h2>
                <p class="text-sm text-muted-foreground leading-relaxed">Need help upgrading to Velocity Pro or Elite, changing your active device limits, managing billing methods, or obtaining invoice receipts? We respond promptly.</p>
                <div class="text-xs text-primary font-semibold">billing@velocityaisoftware.app</div>
              </div>

              <div class="p-6 rounded-2xl border border-border bg-card space-y-3">
                <h2 class="font-bold text-lg">Campus Partnerships</h2>
                <p class="text-sm text-muted-foreground leading-relaxed">Inquire about volume student organization licensing, academic educator tools, classroom demonstrations, and campus study club sponsorships worldwide.</p>
                <div class="text-xs text-primary font-semibold">partners@velocityaisoftware.app</div>
              </div>
            </div>

            <!-- Operating Hours & Guarantees -->
            <div class="p-8 sm:p-10 rounded-3xl border border-border bg-card/60 space-y-6">
              <h2 class="text-2xl font-bold text-foreground">Support Operating Hours & Response Commitment</h2>
              <p class="text-sm text-muted-foreground leading-relaxed">
                Our academic help desk operates Monday through Friday from 9:00 AM to 6:00 PM UTC across three regional timezones (UTC, EST, and IST). Every inquiry submitted through our contact portal is personally reviewed by an academic specialist, not an unmonitored automated bot.
              </p>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-muted-foreground">
                <div class="p-4 rounded-xl bg-background border border-border space-y-1">
                  <div class="font-bold text-foreground">London (UTC)</div>
                  <div>Mon–Fri: 09:00 – 18:00</div>
                  <div>Average reply: Under 4 hours</div>
                </div>
                <div class="p-4 rounded-xl bg-background border border-border space-y-1">
                  <div class="font-bold text-foreground">New York (EST)</div>
                  <div>Mon–Fri: 09:00 – 18:00</div>
                  <div>Average reply: Under 4 hours</div>
                </div>
                <div class="p-4 rounded-xl bg-background border border-border space-y-1">
                  <div class="font-bold text-foreground">New Delhi (IST)</div>
                  <div>Mon–Sat: 10:00 – 19:00</div>
                  <div>Average reply: Under 2 hours</div>
                </div>
              </div>
            </div>

            <!-- Support FAQs -->
            <section class="space-y-6">
              <h2 class="text-2xl font-bold text-foreground text-center">Frequently Asked Support Questions</h2>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-muted-foreground">
                <div class="p-6 rounded-2xl border border-border bg-card space-y-2">
                  <h3 class="font-bold text-foreground">What should I do if an uploaded document fails to parse?</h3>
                  <p class="leading-relaxed">Ensure the document is under the file limit (10MB for Free, 50MB for Pro, 100MB for Elite) and contains readable text. If the issue persists, send the file to our support email and our team will analyze the encoding within 24 hours.</p>
                </div>
                <div class="p-6 rounded-2xl border border-border bg-card space-y-2">
                  <h3 class="font-bold text-foreground">How do I request a receipt or VAT invoice?</h3>
                  <p class="leading-relaxed">Invoices are automatically emailed upon successful payment renewal. You can also view and download full PDF tax invoices anytime from your account settings under the Billing section.</p>
                </div>
              </div>
            </section>
          </main>
        </div>
        ${COMMON_PRERENDER_FOOTER}
      </div>
      `,
    };
  }

  // 7. Get Started Page (Enriched to 650+ words)
  if (cleanPath === "/get-started") {
    return {
      title: "Get Started – Begin Your AI Study Journey with VelocityAI",
      description:
        "Sign up for VelocityAI in minutes. Upload textbooks, lecture slides, and PDFs to generate instant high-yield summaries and self-testing quizzes.",
      canonicalUrl: `${SITE_URL}/get-started`,
      structuredData: {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: "Get Started with VelocityAI",
      },
      prerenderHtml: `
        <div class="min-h-screen bg-background text-foreground flex flex-col justify-between">
          <div>
            ${COMMON_PRERENDER_NAV}
            <main class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
            <header class="text-center space-y-4 max-w-3xl mx-auto">
              <h1 class="text-4xl sm:text-5xl font-extrabold tracking-tight">Getting Started with VelocityAI</h1>
              <p class="text-lg text-muted-foreground leading-relaxed">
                Transform your course materials into exam-ready summaries and active recall quizzes in minutes. Follow this comprehensive quickstart onboarding guide to kickstart your study sessions.
              </p>
            </header>

            <!-- 5 Steps -->
            <div class="space-y-6">
              <div class="p-6 rounded-2xl border border-border bg-card space-y-2">
                <span class="text-xs font-bold text-primary uppercase">Step 01</span>
                <h2 class="text-xl font-bold">Create Your Free Student Account</h2>
                <p class="text-sm text-muted-foreground leading-relaxed">Sign up with your email address or Google account in under 30 seconds. No credit card is required to begin. Your free account includes 5 document uploads per day, 3 practice quizzes, and full access to our OCR parsing pipeline.</p>
              </div>

              <div class="p-6 rounded-2xl border border-border bg-card space-y-2">
                <span class="text-xs font-bold text-primary uppercase">Step 02</span>
                <h2 class="text-xl font-bold">Upload Your First Lecture Materials</h2>
                <p class="text-sm text-muted-foreground leading-relaxed">Drag and drop your syllabus, presentation decks, textbook chapters, or handwritten lecture notes into the dashboard. VelocityAI handles digital PDFs, scanned documents, PowerPoint files (.pptx), text files, and audio recordings effortlessly.</p>
              </div>

              <div class="p-6 rounded-2xl border border-border bg-card space-y-2">
                <span class="text-xs font-bold text-primary uppercase">Step 03</span>
                <h2 class="text-xl font-bold">Review High-Yield Summaries & Key Terms</h2>
                <p class="text-sm text-muted-foreground leading-relaxed">Within seconds, our AI generates an executive summary highlighting core conceptual definitions, fundamental theorems, and practical formulas. Review the summary once to consolidate your initial comprehension.</p>
              </div>

              <div class="p-6 rounded-2xl border border-border bg-card space-y-2">
                <span class="text-xs font-bold text-primary uppercase">Step 04</span>
                <h2 class="text-xl font-bold">Take an Active Recall Practice Quiz</h2>
                <p class="text-sm text-muted-foreground leading-relaxed">Click Generate Quiz to create a multiple-choice practice assessment tailored to your material. Force yourself to retrieve answers without peeking at your notes. Immediate rationales will explain why correct choices are right and why distractors are wrong.</p>
              </div>

              <div class="p-6 rounded-2xl border border-border bg-card space-y-2">
                <span class="text-xs font-bold text-primary uppercase">Step 05</span>
                <h2 class="text-xl font-bold">Configure Your Adaptive Revision Calendar</h2>
                <p class="text-sm text-muted-foreground leading-relaxed">Enter your upcoming exam deadlines in the study timetable. The system will automatically calculate optimal spaced repetition intervals (24h, 72h, 1 week) to reinforce concepts right before you forget them, concentrating your study time on flagged weakness areas.</p>
              </div>
            </div>

            <!-- Guidelines & Tips -->
            <div class="p-8 sm:p-10 rounded-3xl border border-border bg-card/60 space-y-4">
              <h2 class="text-2xl font-bold">Document Scanning Guidelines for Best OCR Accuracy</h2>
              <p class="text-sm text-muted-foreground leading-relaxed">
                For optimal extraction speed and accuracy, ensure digital PDFs have clear font encoding. For handwritten notes and whiteboard photos, take pictures in well-lit environments directly facing the board to avoid excessive perspective distortion. Scanned multi-page PDF documents will be processed page by page.
              </p>
              <div class="pt-4">
                <a href="/auth" class="inline-flex px-6 py-3 rounded-xl font-semibold bg-primary text-primary-foreground text-sm">Create Your Free Account Now &rarr;</a>
              </div>
            </div>
          </main>
        </div>
        ${COMMON_PRERENDER_FOOTER}
      </div>
      `,
    };
  }

  // 8. Auth / Sign In Page
  if (cleanPath === "/auth") {
    return {
      title: "Sign In or Create Account – Velocity AI",
      description:
        "Sign in to your Velocity AI account or create a free student account to transform textbooks, lecture notes, and PDFs into instant summaries and active recall quizzes.",
      canonicalUrl: `${SITE_URL}/auth`,
      structuredData: {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: "Sign In or Register – Velocity AI",
        description: "Access your Velocity AI study engine, active recall practice quizzes, and adaptive exam planner.",
      },
      prerenderHtml: `
        <div class="min-h-screen bg-background text-foreground flex flex-col justify-between">
          <div>
            ${COMMON_PRERENDER_NAV}
            <main class="max-w-md mx-auto px-4 py-16 space-y-8 text-center">
              <div class="space-y-2">
                <h1 class="text-3xl font-extrabold tracking-tight">Sign In or Create Account</h1>
                <p class="text-sm text-muted-foreground leading-relaxed">
                  Join thousands of university and medical students studying smarter with Velocity AI.
                </p>
              </div>
              <div class="p-8 rounded-2xl border border-border bg-card shadow-sm space-y-6 text-left">
                <div class="space-y-4">
                  <p class="text-xs text-muted-foreground text-center">
                    Sign in with your email or Google account to continue to your dashboard.
                  </p>
                  <div class="space-y-2 text-xs text-muted-foreground pt-4 border-t border-border">
                    <p>• Free access: 5 document uploads per day</p>
                    <p>• Automatic active recall quiz generation</p>
                    <p>• Adaptive spaced repetition exam timetables</p>
                  </div>
                </div>
              </div>
            </main>
          </div>
          ${COMMON_PRERENDER_FOOTER}
        </div>
      `,
    };
  }

  // 9. Default Homepage
  return {
    title: "Velocity AI (VelocityAI) – Official Website | AI Study Engine & Exam Prep",
    description:
      "The official Velocity AI (VelocityAI) study engine. Transform lecture notes, textbooks, and PDFs into AI summaries, active recall quizzes, and adaptive exam schedules.",
    canonicalUrl: `${SITE_URL}/`,
    structuredData: getSoftwareApplicationSchema(),
    prerenderHtml: null, // Keep existing rich semantic index.html markup
  };
}
