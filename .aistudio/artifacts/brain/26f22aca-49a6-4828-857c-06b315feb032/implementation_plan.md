# StudyPilot AI: Your Personal Study Planner

An AI-powered academic study platform engineered for students across all learning stages. StudyPilot AI unifies syllabus tracking, AI-powered schedule generation, note summarization, interactive quiz & flashcard generation, a 24/7 AI study coach, and active focus timers into a cohesive, distraction-free workspace.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> The following user preferences were confirmed during interactive clarification and govern the implementation:
> - **Academic Curriculum Scope**: Versatile configuration accommodating **all academic levels** (undergraduate university courses, high school AP/IB preparation, and competitive examination syllabi) with specialized subject templates.
> - **Productivity & Timing Preset**: Pre-configured with the **Deep Work standard (50-minute study sessions with 10-minute restorative breaks)**, fully customizable in Settings and Focus Timer.
> - **Initial Data State**: Pre-loaded with **realistic sample data** (e.g., Computer Systems Architecture, Organic Chemistry, Data Structures) with prominent demonstration badges and a one-click reset/restore mechanism.

---

### 1. Overview & Core Concept

- **What It Does**: StudyPilot AI bridges the gap between raw syllabuses and disciplined execution. It automates realistic study timetables based on exam deadlines and confidence ratings, condenses lecture notes with zero hallucinated facts, builds self-assessment quizzes and flashcards, and provides conversational conceptual coaching using server-side Gemini 2.5 Flash.
- **Target Audience**: Undergraduate, graduate, high school, and competitive exam students needing structured time-management, active recall tools, and reliable progress telemetry.
- **Key Value**: Eliminates planning paralysis, provides objective analytics calculated strictly from real study logs, and delivers privacy-compliant AI assistance without exposing API keys.

---

### 2. User Experience & Visual Design

#### A. Key User Flows
1. **Dashboard & Pacing**: Students view study hours completed, topics pending vs. completed, quiz average, upcoming exam milestones, and launch 1-click quick actions.
2. **Subject & Syllabus Management**: Students add subjects, set target exam dates, log confidence ratings (1–5), add chapters/topics, and check off completed topics.
3. **AI Study Plan Generator**: Input available study days, daily study hours, preferred session lengths, exam dates, and confidence levels. Gemini generates a conflict-free, prioritized study timetable that strictly respects time limits and excludes post-exam sessions.
4. **Notes Summarizer**: Paste notes, choose length (Short, Medium, Detailed) and style (Simple Explanation, Exam Revision, Key Points). Outputs verified main concepts, key definitions, examples from source, and quick-revision bullet points.
5. **AI Quiz & Active Recall**: Generate targeted Multiple-Choice or True/False quizzes from topics or notes. Interactive one-by-one question flow with explanation cards and score tracking.
6. **Flashcards**: Interactive 3D flip cards with shuffle, "Mark as Known", and "Mark for Revision" controls.
7. **AI Study Coach**: Conversational Gemini-powered tutor equipped with strict academic coaching system prompts. Explains concepts with beginner-friendly analogies and builds step-by-step revision checklists.
8. **Focus Timer**: Dedicated deep work timer (50m/10m) with task selector, active-only second counter (pauses do not inflate stats), and automatic session logging.
9. **Progress Analytics & Reports**: Live charts for study minutes per day, subject distribution, quiz score history, and real completion streaks.
10. **Settings & Data Control**: Configure personal daily targets, intervals, and one-click data backup, restore, and factory reset.

#### B. Visual Identity & Design Tokens (Academic Precision)
- **Palette**:
  - Neutral Canvas: `#F8FAFC` daylight off-white backdrop with `#FFFFFF` card surfaces and `#E2E8F0` hairline dividers.
  - Primary Typography: Deep slate navy (`#0F172A`) for high-legibility headings; Slate (`#475569`) for readable body text; Muted slate (`#94A3B8`) for contextual annotations.
  - Interactive Brand Accent: Royal Blue (`#2563EB`, hover `#1D4ED8`) for primary navigation and actionable controls.
  - AI Intelligence Accent: Soft Violet (`#7C3AED` to `#6D28D9`) reserved for generative actions, AI Coach interactions, and synthesis tags.
  - Pacing & Milestones: Soft Teal (`#0D9488`) for completed topics, active streaks, and perfect quiz feedback.
- **Typography**:
  - Headings: `Plus Jakarta Sans` (weights 600, 700) for confident, approachable structure.
  - Body Prose: `Inter` (weights 400, 500) for crisp reading density.
  - Tabular Numerals: Tabular figures (`tabular-nums font-mono`) applied to all countdown timers, test scores, timetable hour slots, and analytics metrics.
- **Elevation & Layout Geometry**:
  - Desktop: 260px collapsible left navigation sidebar + 1-row top header + responsive multi-panel canvas.
  - Mobile: Floating bottom navigation bar + swipeable study cards.
  - Card Radius: `rounded-xl` (12px) with 1px border (`border-slate-200`) and soft ambient elevation (`shadow-sm`).
  - Zero-Pill Rule: Informational metadata rendered as clean unboxed text separated by `·` dividers. Interactive buttons use defined segmented controls.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Full-Stack Architecture with Server-Side Gemini Proxy**
  - *Chosen Approach*: Express server (`server.ts`) hosting dedicated endpoints (`/api/gemini/study-plan`, `/api/gemini/summarize`, `/api/gemini/quiz`, `/api/gemini/coach`) using `@google/genai` and `gemini-3.8-flash`.
  - *Why*: Strict security (keeps `GEMINI_API_KEY` entirely out of client bundles), enforces structured JSON schema validation, and enables custom academic system prompts.
  - *Alternatives Considered*: Client-side SDK calls were rejected as they violate platform security and expose keys in browser network inspectors.
- **Decision 2: LocalStorage Persistent Data Layer with Safe Synchronization**
  - *Chosen Approach*: Robust client data manager (`src/utils/storage.ts`) with typed schemas, schema migrations, and immediate reactivity across views.
  - *Why*: Instant prototype responsiveness, offline availability, zero user friction (no cumbersome login forms), and zero external database setup latency.
- **Decision 3: Honest Analytics & Verifiable AI Outputs**
  - *Chosen Approach*: All dashboard statistics are dynamically calculated from stored study sessions, topic statuses, and quiz attempts. AI responses are strictly validated; quizzes without valid answer keys are rejected, and notes summaries never invent examples not found in the source text.
  - *Why*: Adheres to academic integrity and prevents deceptive or fabricated progress numbers.

---

### 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        STUDYPILOT AI FRONTEND                          │
│                                                                        │
│  ┌─────────────────────────┐  ┌─────────────────────────────────────┐  │
│  │   Collapsible Sidebar   │  │   Header Bar (Breadcrumbs & Profile)│  │
│  └─────────────────────────┘  └─────────────────────────────────────┘  │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Active Module View (Dashboard / Subjects / Planner / Notes /     │  │
│  │ Quizzes / Flashcards / AI Coach / Focus Timer / Analytics)       │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                │                                       │
│                                ▼                                       │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ State & Persistence Layer (localStorage + Typed Change Listeners)│  │
│  │ • Subjects & Topics         • Quiz Attempts & Flashcard Sets     │  │
│  │ • Study Plan Timetables     • Focus Session Real-Time Logs       │  │
│  │ • Summaries Archive         • User Target & Interval Settings    │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────┬──────────────────────────────────────┘
                                  │ HTTP API Calls (POST /api/gemini/*)
                                  ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      EXPRESS BACKEND (server.ts)                       │
│                                                                        │
│  • Vite Middleware in Development (Single Port 3000)                   │
│  • Server-Side @google/genai Client with GEMINI_API_KEY                │
│  • /api/gemini/study-plan  -> Structured JSON Timetable Generation     │
│  • /api/gemini/summarize   -> Conceptual & Definition Extraction       │
│  • /api/gemini/quiz        -> Schema-Enforced Question & Explanation   │
│  • /api/gemini/coach       -> Conversational Academic Socratic Tutor   │
└────────────────────────────────────────────────────────────────────────┘
```

#### Core Data Schemas (`src/types/index.ts`)
- `Subject`: `id`, `name`, `code`, `color`, `examDate`, `confidenceLevel` (1-5), `notes`, `topics: Topic[]`.
- `Topic`: `id`, `name`, `completed`, `estimatedHours`, `completedAt?`.
- `StudySession`: `id`, `date`, `startTime`, `endTime`, `subjectId`, `subjectName`, `topic`, `activity`, `durationMinutes`, `priority`, `completed`.
- `StudyPlan`: `id`, `createdAt`, `preferences`, `sessions: StudySession[]`, `unfinishedTopics: string[]`, `notes: string`.
- `SummaryItem`: `id`, `subjectId`, `subjectName`, `title`, `sourceNotes`, `length`, `style`, `summary`, `concepts: string[]`, `definitions: {term: string, definition: string}[]`, `keyPoints: string[]`, `examples: string[]`, `terminology: string[]`, `quickRevision: string[]`, `createdAt`.
- `QuizItem`: `id`, `subjectId`, `subjectName`, `topic`, `difficulty`, `type`, `questions: QuizQuestion[]`, `createdAt`.
- `QuizQuestion`: `id`, `question`, `options`, `correctIndex`, `explanation`, `sourceContext?`.
- `QuizAttempt`: `id`, `quizId`, `subjectId`, `score`, `totalQuestions`, `percentage`, `userAnswers: Record<string, number>`, `completedAt`.
- `FlashcardSet`: `id`, `subjectId`, `subjectName`, `title`, `cards: {id: string, front: string, back: string, known?: boolean}[]`, `createdAt`.
- `FocusRecord`: `id`, `taskId`, `taskName`, `subjectName`, `durationMinutes`, `completedAt`, `activeSeconds`.
- `UserSettings`: `displayName`, `academicLevel`, `dailyStudyGoalMinutes`, `sessionDurationMinutes`, `breakDurationMinutes`, `availableDays: string[]`, `theme`.

---

### 5. Verification & Acceptance Testing Plan

The application will be validated through 12 rigorous integration tests:
1. **Subject & Syllabus Persistence**: Add subject, add 3 topics, mark 1 complete, refresh page, verify state stays identical.
2. **Timetable Conflict Resolution**: Generate plan with 2 subjects, disparate exam dates, and strict daily caps; verify zero overlaps and zero sessions post-exam.
3. **Validation Gates**: Test generation forms with empty or invalid parameters; verify clear inline validation messages appear.
4. **Notes Summarizer Grounding**: Paste notes, generate summary, verify definitions and examples correspond strictly to input text.
5. **Interactive Quiz Engine**: Complete quiz questions one-by-one, change an answer, submit, verify score and explanation cards.
6. **Flashcards Mechanics**: Flip card, navigate next/prev, mark known/revision, test shuffle.
7. **Focus Session Accuracy**: Run timer, pause for 5s, resume, complete session; verify only active elapsed time is recorded and duplicate records are prevented.
8. **AI Study Coach Chat**: Test conceptual query and verify helpful, structured Socratic explanation with clear loading indicators.
9. **Dashboard Analytics Sync**: Complete a focus session and quiz; verify dashboard statistics (hours, quiz average, streak) recalculate instantly.
10. **Storage Reset & Restore**: Load demo data, edit fields, perform factory reset, verify clean restore.
11. **Responsive Reflow**: Verify desktop 260px sidebar and mobile bottom navigation without horizontal scroll.
12. **Console & Lint Audit**: Confirm clean compilation (`compile_applet`) and zero uncaught exceptions in server and browser console.
