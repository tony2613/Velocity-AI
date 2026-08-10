import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import SEO from "@/components/SEO";

export const blogPosts = [
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

Velocity AI turns your PDFs and notes into summaries and quizzes automatically, so active recall takes minutes, not hours.`
  },
  {
    id: "future-of-ai",
    title: "The Future of AI in Education",
    date: "Jan 1, 2026",
    summary: "How AI is changing the way students learn.",
    content: `
      AI is no longer just a futuristic concept; it's a present reality in classrooms worldwide. 
      From personalized learning paths to instant summarization, AI tools like VelocityAI are 
      empowering students to tackle complex subjects with newfound confidence.

      In the coming years, we expect to see even deeper integration of AI in curriculum design 
      and real-time feedback systems that adapt to each student's unique learning pace.
    `
  },
  {
    id: "study-hacks-2026",
    title: "Top 5 Study Hacks for 2026",
    date: "Dec 15, 2025",
    summary: "Boost your productivity with these simple tips.",
    content: `
      1. Use AI for Initial Summaries: Don't read 50 pages if you can get the core concepts in 2.
      2. Interval Recall Quizzing: Turn your summaries into quizzes immediately.
      3. Digital Minimalism: Keep your study environment clutter-free.
      4. Pomodoro 2.0: Use AI-timed focus sessions.
      5. Collaborative Learning: Share your AI-generated insights with peers.
    `
  },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Blog – AI Study Tips & Learning Guides"
        description="Read VelocityAI's blog for study tips, AI learning strategies, and guides to help you master your subjects faster using AI-powered tools."
        canonicalPath="/blog"
      />
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h1 className="text-4xl font-bold mb-12 text-center">VelocityAI Blog</h1>
        <div className="grid md:grid-cols-2 gap-8">
          {blogPosts.map((post) => (
            <Link key={post.id} href={`/blog/${post.id}`}>
              <a className="block group">
                <Card className="hover-elevate h-full transition-all group-hover:border-primary/50">
                  <CardHeader>
                    <CardTitle className="group-hover:text-primary transition-colors">{post.title}</CardTitle>
                    <p className="text-xs text-muted-foreground">{post.date}</p>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{post.summary}</p>
                  </CardContent>
                </Card>
              </a>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
