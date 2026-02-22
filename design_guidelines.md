# Design Guidelines: AI Study Platform

## Design Approach
**Reference-Based Approach** drawing inspiration from:
- **Turbo AI**: Clean, student-focused interface with clear content hierarchy
- **Notion**: Organized workspaces and intuitive content management
- **Quizlet**: Engaging study card interactions and learning tools
- **Linear**: Modern typography and purposeful minimalism

**Core Principle**: Create an energizing, confidence-building learning environment that feels accessible and motivating for students while maintaining professional credibility.

**Color Aesthetic**: Purple and black theme with black dominating the background, creating a modern, sophisticated study environment.

---

## Typography System

**Primary Font**: Inter (via Google Fonts CDN)
- Headings: 600-700 weight
- Body: 400-500 weight
- UI Elements: 500 weight

**Type Scale**:
- Hero Headline: text-5xl to text-6xl (font-bold)
- Page Titles: text-4xl (font-semibold)
- Section Headers: text-2xl to text-3xl (font-semibold)
- Card Titles: text-xl (font-semibold)
- Body Text: text-base (font-normal)
- Captions/Metadata: text-sm (font-medium)
- Buttons/CTAs: text-base (font-medium)

---

## Layout System

**Spacing Primitives**: Consistently use Tailwind units of **2, 4, 8, 12, 16**
- Tight spacing: p-2, gap-2
- Standard spacing: p-4, gap-4, m-4
- Section spacing: p-8, py-12, py-16
- Generous spacing: p-16, py-20

**Grid Strategy**:
- Dashboard: 12-column grid for flexible layouts
- Study Cards: 3-column on desktop (grid-cols-1 md:grid-cols-2 lg:grid-cols-3)
- Content Areas: 2-column split for main content + sidebar

**Container Widths**:
- Full-width sections: max-w-7xl mx-auto
- Content sections: max-w-6xl mx-auto
- Reading content: max-w-4xl mx-auto

---

## Component Library

### Navigation
**Top Navigation Bar**:
- Logo left-aligned
- Main navigation center (Dashboard, My Notes, Quizzes, Library)
- User profile + Upload button right-aligned
- Sticky positioning (sticky top-0)
- Subtle shadow on scroll

### Hero Section (Landing Page)
**Layout**: Asymmetric split with compelling imagery
- Left: Headline + subheadline + dual CTA buttons (primary + secondary)
- Right: Hero image showing student studying with AI-generated notes interface
- Height: min-h-screen with proper vertical centering
- Social proof strip below: "Join 50,000+ students learning smarter"

**Images**:
- **Hero Image**: Bright, diverse student using laptop with visible AI-generated study materials on screen. Modern, aspirational, energetic mood. Position: right side of hero, taking 45% width
- **Features Section**: Screenshot mockups of note summarization and quiz generation interfaces
- **Testimonial Section**: Student headshots (circular avatars, 64x64)

### Dashboard Components

**Quick Action Cards**:
- Large, prominent cards with icons (Heroicons)
- "Upload Notes" → "Generate Quiz" → "Review Summaries"
- Hover lift effect (transform translate-y)
- Icon + Title + Brief description

**Recent Activity Feed**:
- Timeline-style list of recent summaries and quizzes
- Each item: Icon + Title + Timestamp + Quick action button
- Dividers between items

**Study Stats Widget**:
- 3-4 stat cards in grid
- Large number + label + trend indicator
- Examples: "Notes Summarized", "Quizzes Completed", "Study Streak"

### Content Cards

**Note Summary Cards**:
- Rounded corners (rounded-lg)
- Clear hierarchy: Subject tag → Title → Preview text → Metadata footer
- Action buttons: "View Summary" + "Generate Quiz" + More menu (...)
- Hover state with subtle elevation

**Quiz Cards**:
- Question number badge
- Question text prominent
- Answer options as radio/checkbox groups with clear hit areas
- Progress indicator at top
- "Submit" and "Next Question" buttons

### Forms

**Upload Interface**:
- Large drag-and-drop zone with dashed border
- File icon (Heroicons: document-text)
- "Drag files here or click to browse"
- Supported formats listed below
- Paste text area as alternative tab

**Organization**:
- Folder selector dropdown
- Subject tags with color indicators
- "Create New Folder" quick action

### Modals & Overlays

**Summary View Modal**:
- Full-screen overlay with close button (X)
- Summary content with proper reading typography
- Sidebar: Original notes preview (scrollable)
- Actions footer: "Download PDF" + "Generate Quiz from This"

### Buttons

**Primary CTA**: 
- Rounded-lg, px-8 py-3
- Medium weight text
- Subtle shadow
- When on images: backdrop-blur-md with semi-transparent background

**Secondary**:
- Border variant with transparency
- Same padding as primary

**Icon Buttons**:
- Circular or square with p-2
- Heroicons at size-5 or size-6

---

## Page Layouts

### Landing Page Structure
1. **Hero Section**: Asymmetric with hero image (described above)
2. **How It Works**: 3-step process with numbered cards
3. **Features Grid**: 2x3 grid showcasing AI summarization, quiz generation, organization, export options
4. **Social Proof**: Student testimonials in 3-column card layout with photos
5. **Pricing**: Simple comparison (Free vs Premium) in side-by-side cards
6. **Final CTA**: Centered with background pattern, primary + secondary buttons
7. **Footer**: Multi-column (About, Features, Resources, Legal) + newsletter signup + social links

### Dashboard Layout
- **Top**: Navigation bar
- **Left Sidebar** (20% width): 
  - Quick filters (All Notes, By Subject, Recent)
  - Folder tree navigation
  - Storage usage indicator at bottom
- **Main Content** (80% width):
  - Stats overview row
  - Quick actions cards
  - Recent activity feed
  - "Your Notes" grid with filtering

### Study View Layout
- **Clean, focused interface**:
  - Progress bar at top (e.g., "Question 5 of 20")
  - Centered content with max-w-3xl
  - Question + answers with ample spacing
  - Navigation buttons fixed at bottom

---

## Interaction Patterns

**Micro-interactions** (minimal, purposeful):
- Button hover: Slight scale (scale-105) + shadow increase
- Card hover: Translate up (-translate-y-1) + shadow
- Success states: Checkmark animation on quiz correct answers
- Loading states: Simple spinner or skeleton screens

**No Animations For**:
- Page transitions
- Scroll triggers
- Background effects

---

## Accessibility Standards

- All interactive elements minimum 44x44px touch targets
- Form inputs with visible labels and clear focus states (ring-2)
- ARIA labels for icon-only buttons
- Keyboard navigation support throughout
- Contrast ratios meeting WCAG AA standards
- Skip to main content link

---

## Key Differentiators

- **Student-Centric**: Energetic, confidence-building, not corporate
- **Content-First**: Clear hierarchy prioritizing study materials over decoration
- **Action-Oriented**: Prominent CTAs for core workflows (Upload → Summarize → Quiz)
- **Achievement-Focused**: Progress tracking and stats to motivate learning