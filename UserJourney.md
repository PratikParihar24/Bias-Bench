# ⚖️ BiasBench — The Complete Project Handbook

> **One document to understand everything** — from the first click to the last database write.

---

## Table of Contents

1. [What is BiasBench? (The 30-Second Pitch)](#1-what-is-biasbench)
2. [Architecture Overview](#2-architecture-overview)
3. [Project File Map](#3-project-file-map)
4. [The Full User Journey](#4-the-full-user-journey)
5. [The Full Data Journey](#5-the-full-data-journey)
6. [Frontend Deep Dive — Every Component Explained](#6-frontend-deep-dive)
7. [Backend Deep Dive — Every Service Explained](#7-backend-deep-dive)
8. [Database Layer](#8-database-layer)
9. [API Contract](#9-api-contract)
10. [Streaming vs Fast Mode](#10-streaming-vs-fast-mode)
11. [Export System](#11-export-system)
12. [Environment & Deployment](#12-environment--deployment)
13. [End-to-End Sequence Diagram](#13-end-to-end-sequence-diagram)

---

## 1. What is BiasBench?

**Plain English:** BiasBench is like a courtroom for AI models. You type a single question, and the app fires that exact question at 3 different AI models simultaneously. Then a separate "Judge AI" reads all the answers and evaluates whether any model showed bias, subjectivity, or disagreement. Everything is saved so you can go back and review past audits.

**Technical:** BiasBench is a full-stack AI forensics platform with a **Next.js 16** frontend and a **FastAPI** backend. It uses the **Factory Pattern** to route prompts to multiple LLM providers (Google Gemini, Meta Llama, Mixtral, Gemma) via their respective APIs (Google GenAI SDK, Groq, OpenRouter). A dedicated Judge AI (via OpenRouter) performs comparative bias evaluation, and all results are persisted in a **PostgreSQL** database via **SQLAlchemy ORM**.

---

## 2. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        USER'S BROWSER                               │
│                                                                     │
│  ┌─────────────┐  ┌──────────┐  ┌─────────────┐  ┌──────────────┐  │
│  │ DashboardHdr│  │ PromptBar│  │ ModelColumn  │  │ VerdictPanel │  │
│  └─────────────┘  └────┬─────┘  │  (x3)       │  └──────┬───────┘  │
│                        │        └──────┬───────┘         │          │
│  ┌─────────┐           │               │                 │          │
│  │ Sidebar │           │               │                 │          │
│  │ (Vault) │           │               │                 │          │
│  └────┬────┘           │               │                 │          │
│       │         ┌──────┴───────────────┴─────────────────┘          │
│       │         │           page.tsx (Orchestrator)                  │
│       │         │       State: response, verdict, models             │
│       └─────────┤                                                    │
│                 └────────────────┬───────────────────────────────────┘
│                                  │ fetch() calls
│                                  ▼
│  ┌──────────────────────────────────────────────────────────────┐
│  │                    FastAPI Backend (:8000)                    │
│  │                                                              │
│  │  POST /api/audit ──► BackgroundTasks ──► process_audit()     │
│  │  GET  /api/jobs/{id} ──► JOBS dict (in-memory)               │
│  │  GET  /api/history ──► SQLAlchemy query                      │
│  │  DELETE /api/history/{id} ──► SQLAlchemy delete               │
│  │                                                              │
│  │  ┌────────────────────────────────────────────────────────┐  │
│  │  │              LLMFactory (Service Layer)                │  │
│  │  │                                                        │  │
│  │  │  fetch_gemini()  ──► Google GenAI SDK                  │  │
│  │  │  fetch_llama()   ──► Groq API (70B)                    │  │
│  │  │  fetch_llama_8b()──► Groq API (8B)                     │  │
│  │  │  fetch_mixtral() ──► Groq API (8x7B)                   │  │
│  │  │  fetch_gemma()   ──► Groq API (9B)                     │  │
│  │  │                                                        │  │
│  │  │  evaluate_bias() ──► OpenRouter (Judge AI)             │  │
│  │  │  run_all()       ──► asyncio.gather + Judge            │  │
│  │  └────────────────────────────────────────────────────────┘  │
│  │                                                              │
│  │  ┌──────────────────────┐                                    │
│  │  │   SQLAlchemy ORM     │                                    │
│  │  │   AuditRecord model  │──► PostgreSQL / SQLite             │
│  │  └──────────────────────┘                                    │
│  └──────────────────────────────────────────────────────────────┘
```

---

## 3. Project File Map

### Backend (`backend/`)

| File | Purpose |
|------|---------|
| `main.py` | **Entry point.** FastAPI app, CORS, all 4 API routes, background task orchestration, in-memory JOBS dict |
| `app/database.py` | SQLAlchemy engine setup, `SessionLocal` factory, `get_db()` dependency generator |
| `app/models.py` | `AuditRecord` ORM model — the single database table (`audits`) |
| `app/services/llm_factory.py` | **The brain.** `LLMFactory` class with 5 model fetchers, the Judge AI evaluator, `run_all()` orchestrator |
| `app/services/judge.py` | Empty placeholder (Judge logic lives inside `llm_factory.py`) |
| `app/services/stream.py` | Empty placeholder (streaming is handled client-side) |
| `app/api/routes.py` | Empty placeholder (routes live in `main.py`) |
| `app/core/config.py` | Empty placeholder |
| `app/core/database.py` | Empty placeholder |
| `app/schemas/audit.py` | Empty placeholder |
| `app/models/experiment.py` | Empty placeholder |
| `.env` | API keys (Gemini, Groq, OpenRouter) and `DATABASE_URL` |
| `requirements.txt` | Python dependencies (FastAPI, SQLAlchemy, google-genai, groq, openai, etc.) |

### Frontend (`frontend/`)

| File | Purpose |
|------|---------|
| `app/page.tsx` | **The orchestrator.** All state management, audit logic, polling, model selection, export |
| `app/layout.tsx` | Root layout, Google Fonts (Geist), metadata, Vercel Analytics |
| `app/globals.css` | Cyberpunk design system — CSS custom properties, animations, grid background |
| `components/dashboard-header.tsx` | Top header bar with logo, system status indicator |
| `components/prompt-bar.tsx` | Search input, AUDIT button, Live/Fast toggle, suggested prompts |
| `components/model-column.tsx` | AI response display — markdown rendering, typewriter effect, copy, expand |
| `components/verdict-panel.tsx` | Judge AI results — subjectivity score bar, bias tag, agreement rate, confidence |
| `components/sidebar.tsx` | History drawer — fetch past audits, load them, delete them |
| `components/guide-modal.tsx` | "How it works" user guide modal |
| `components/bias-radar-chart.tsx` | Recharts radar chart (static/demo data, not connected to live responses) |
| `components/theme-provider.tsx` | next-themes wrapper (not actively used — app is forced dark mode) |
| `components/ui/*` | 57 shadcn/ui primitive components (Button, Badge, Card, Toast, etc.) |
| `lib/utils.ts` | `cn()` utility — merges Tailwind class names with clsx + tailwind-merge |
| `hooks/use-mobile.ts` | `useIsMobile()` — media query hook for responsive breakpoint (768px) |
| `hooks/use-toast.ts` | Toast notification system (reducer-based state management) |
| `.env.local` | `NEXT_PUBLIC_API_URL` pointing to backend |
| `next.config.mjs` | TypeScript error bypass, unoptimized images |
| `components.json` | shadcn/ui configuration (New York style, Lucide icons) |
| `package.json` | All frontend dependencies |

---

## 4. The Full User Journey

### Screen 1: Landing (Initial State)

**What the user sees:**
- A dark cyberpunk-themed dashboard with a grid background
- Top-left: hamburger menu button (☰)
- Top: "BIASBENCH — AI Bias Forensics Lab" header with `SYS:ONLINE` status
- Center: search bar with "Enter a prompt to audit across models..." placeholder
- Three suggested prompt buttons below the bar: "Is climate change real?", "Should guns be regulated?", "Is AI dangerous?"
- Three model columns labeled MODEL A, MODEL B, MODEL C — each showing "Awaiting prompt..." with a ghost icon
- Three dropdown selectors defaulting to: Gemini 2.5 Flash, Llama 3.3 70B, Llama 3.1 8B
- Bottom-right: floating "How it works" button
- A pulsing AUDIT button (disabled until text is entered)
- A Live/Fast toggle button (green = Live mode by default)

**What happens technically:**
- `page.tsx` renders as a client component (`"use client"`)
- State initializes: `isAuditing=false`, `hasAudited=false`, `response={a:"",b:"",c:""}`, `verdict=null`, `enableStreaming=true`
- `AVAILABLE_MODELS` array defines 5 models with IDs, display names, icon types, and accent colors
- `selectedModels` state defaults to `{a: "gemini", b: "llama_70b", c: "llama_8b"}`
- Each `ModelColumn` receives empty response, renders the "Awaiting prompt..." placeholder

### Step 2: User Selects Models

**What the user does:** Clicks any of the three dropdown selectors and picks a different model.

**What happens technically:**
- The `<select>` element's `onChange` fires `setSelectedModels({...selectedModels, a: e.target.value})`
- The `AVAILABLE_MODELS.find()` lookup updates the model name, icon, and accent color passed to `ModelColumn`
- Dropdowns are disabled during auditing (`disabled={isAuditing || isStreaming}`)

### Step 3: User Types a Prompt

**What the user does:** Types "Is AI dangerous?" into the search bar (or clicks a suggested prompt button).

**What happens technically:**
- `PromptBar` component manages its own local `prompt` state via `useState`
- Clicking a suggested prompt calls `setPrompt(s)` which fills the input
- The AUDIT button becomes enabled when `prompt.trim()` is truthy

### Step 4: User Clicks AUDIT

**What the user sees:**
- AUDIT button text changes to "SCANNING..."
- All three model columns instantly show "Connecting to BiasBench AI Engine..." / "Waiting..." / "Waiting...."
- The dropdowns become disabled
- After 3-15 seconds, responses start appearing (typed character-by-character in Live mode, or instantly in Fast mode)

**What happens technically (Frontend → Backend → Frontend):**

1. **`handleAudit(prompt)` fires** in `page.tsx`
2. Any previous in-flight request is aborted via `AbortController`
3. UI resets: `setIsAuditing(true)`, `setHasAudited(false)`, `setFinishedTypingCount(0)`
4. Placeholder responses are set: `setResponse({a:"Connecting...", b:"Waiting...", c:"Waiting...."})`
5. **POST `/api/audit`** is called with `{prompt, models: ["gemini", "llama_70b", "llama_8b"]}`
6. Backend returns `{job_id: "uuid-string"}` immediately (HTTP 200)
7. **Polling loop begins:** Frontend calls `GET /api/jobs/{job_id}` every 2 seconds
8. When `jobData.status === "completed"`, the loop exits with the full response data
9. Responses are unpacked: `aiResponse[selectedModels.a]` → column A, etc.
10. Verdict is extracted: `aiResponse.data.verdict`
11. If **Live mode**: `setStreaming(true)` → `ModelColumn` starts character-by-character animation
12. If **Fast mode**: `setHasAudited(true)` + `setFinishedTypingCount(3)` → instant display

### Step 5: Responses Stream In (Live Mode)

**What the user sees:** Characters appear one-by-one in each column with a blinking cursor (▌), with a subtle scanline animation sweeping across each panel.

**What happens technically:**
- `ModelColumn` has a `useEffect` that runs a `setTimeout` loop
- Each iteration: `setDisplayedText(response.slice(0, charIndex + 1))` and `setCharIndex(prev => prev + 1)`
- Delay between characters: `Math.random() * 20 + 10` ms (10-30ms, simulating typing)
- Auto-scrolls to bottom: `textRef.current.scrollTop = textRef.current.scrollHeight`
- When `charIndex >= response.length`, calls `onFinish()` which increments `finishedTypingCount` in the parent
- When all 3 columns report finished (`finishedTypingCount === 3`), parent sets `setStreaming(false)` and `setHasAudited(true)`

### Step 6: Verdict Appears

**What the user sees:** A verdict panel slides in at the bottom showing:
- **Subjectivity Score:** 0-100 with a gradient progress bar (green → yellow → red)
- **Bias Tag:** e.g., "Left-Leaning", "Neutral/Centrist", "Right-Leaning", "Highly Subjective"
- **Agreement Rate:** HIGH, MEDIUM, or LOW
- **Confidence:** 0-100%
- **Summary:** A 2-sentence comparative analysis

**What happens technically:**
- `VerdictPanel` renders when `isActive={hasAudited}` is true and `data` is not null
- It receives the `verdict` object from state, which matches the `VerdictData` interface:
  ```typescript
  interface VerdictData {
    summary: string;
    subjectivity_score: number;
    bias_tag: string;
    agreement_rate: string;
    confidence: number;
  }
  ```

### Step 7: User Interacts with Results

**Available actions per model column:**
- **Copy** (📋): `navigator.clipboard.writeText(response)` — copies raw response text
- **Expand** (⛶): Opens a full-screen modal with larger markdown rendering
- **Markdown rendering**: All responses render through `ReactMarkdown` with `remarkGfm` plugin and `SyntaxHighlighter` for code blocks

### Step 8: User Exports Report

**What the user does:** Clicks the floating "Export Report" button (appears only after audit completes).

**What happens technically:**
- `handleExport()` builds a markdown string with:
  - Date, prompt, verdict section (bias tag, scores, summary), all model responses
- Creates a `Blob` with MIME type `text/markdown`
- Triggers browser download as `biasbench-report-{timestamp}.md`

### Step 9: User Opens The Vault (Sidebar)

**What the user does:** Clicks the hamburger menu (☰) in the top-left corner.

**What the user sees:** A sliding drawer from the left showing:
- "Audit History" header
- "New Audit" button
- List of past audits showing truncated prompts, subjectivity scores, and delete buttons

**What happens technically:**
- `Sidebar` component's `useEffect` fires `fetchHistory()` when `isOpen` becomes true
- `GET /api/history` → returns the 10 most recent `AuditRecord` rows, ordered by `created_at DESC`
- Each audit card shows `audit.prompt` (line-clamped to 2 lines) and `audit.verdict?.subjectivity_score`

### Step 10: User Loads a Past Audit

**What the user does:** Clicks on a past audit card in the sidebar.

**What happens technically:**
- `loadPastAudit(audit)` fires in `page.tsx`
- Updates `selectedModels` from `audit.selected_models[0/1/2]`
- Unpacks `audit.responses[model_key]` into the three columns
- Sets `verdict` from `audit.verdict`
- Sets `hasAudited=true`, `isStreaming=false`, `finishedTypingCount=3` — everything appears instantly

### Step 11: User Deletes an Audit

**What the user does:** Hovers over a past audit card and clicks the trash icon.

**What happens technically:**
- `handleDelete(e, id)` fires with `e.stopPropagation()` to prevent loading the audit
- `DELETE /api/history/{id}` is called
- On success, the audit is removed from local state: `setHistory(prev => prev.filter(item => item.id !== id))`

### Step 12: User Starts New Audit

**What the user does:** Clicks "New Audit" in the sidebar.

**What happens technically:**
- `handleNewAudit()` resets ALL state: responses cleared, verdict null, models back to defaults, all flags reset
- Sidebar closes automatically

---

## 5. The Full Data Journey

### Phase 1: Prompt Leaves the Browser

```
User types "Is AI dangerous?" → PromptBar.prompt (local state)
    → handleSubmit() → onAudit(prompt) → handleAudit(prompt) in page.tsx
    → fetch("POST /api/audit", { prompt, models: ["gemini","llama_70b","llama_8b"] })
```

### Phase 2: Backend Receives & Dispatches

```
FastAPI /api/audit route (main.py:82)
    → Creates UUID job_id
    → Stores JOBS[job_id] = {status: "processing", data: null}
    → Spawns BackgroundTask: process_audit(job_id, request)
    → Returns {job_id} immediately to frontend

BackgroundTask: process_audit() (main.py:51)
    → Calls llm_engine.run_all(prompt, models)
```

### Phase 3: LLMFactory Orchestrates Parallel API Calls

```
LLMFactory.run_all() (llm_factory.py:165)
    → Builds task list from selected_models using available_models dict
    → asyncio.gather(*tasks) fires ALL API calls simultaneously:
    
    ┌─ fetch_gemini(prompt) → Google GenAI SDK → gemini-2.5-flash
    │     Uses: self.gemini_client.aio.models.generate_content()
    │     Returns: response.text
    │
    ├─ fetch_llama(prompt) → Groq API → llama-3.3-70b-versatile
    │     Uses: self.groq_client.chat.completions.create()
    │     Returns: response.choices[0].message.content
    │
    └─ fetch_llama_8b(prompt) → Groq API → llama-3.1-8b-instant
          Uses: self.groq_client.chat.completions.create()
          Returns: response.choices[0].message.content

    → Results zipped into: answers_dict = {"gemini": "...", "llama_70b": "...", "llama_8b": "..."}
```

### Phase 4: Judge AI Evaluates

```
LLMFactory.evaluate_bias(user_prompt, answers_dict) (llm_factory.py:93)
    → Builds analysis_input string with system instructions + all model responses
    → Calls _fetch_judge_response() (with @retry decorator: 3 attempts, exponential backoff)
    
    _fetch_judge_response() (llm_factory.py:139)
        → OpenRouter API (openrouter/free model)
        → response_format: {"type": "json_object"} (forces structured JSON output)
        → temperature: 0.1 (near-deterministic)
        → Parses response → strips markdown fences → json.loads()
        → Validates against JudgeResponseSchema (Pydantic):
            {summary, subjectivity_score, bias_tag, agreement_rate, confidence}
        → Returns validated dict

    → run_all() returns: {responses: answers_dict, verdict: judge_verdict}
```

### Phase 5: Persistence & Job Completion

```
process_audit() continues (main.py:57)
    → Opens new SQLAlchemy session (SessionLocal())
    → Creates AuditRecord:
        prompt = "Is AI dangerous?"
        selected_models = ["gemini", "llama_70b", "llama_8b"]     (JSON column)
        responses = {"gemini": "...", "llama_70b": "...", ...}     (JSON column)
        verdict = {summary, subjectivity_score, bias_tag, ...}     (JSON column)
        created_at = datetime.utcnow()                             (auto)
    → db.add(new_audit) → db.commit() → db.refresh(new_audit)
    → JOBS[job_id] = {status: "completed", data: {status: "success", data: results, audit_id: id}}
    → db.close()
```

### Phase 6: Frontend Receives Results

```
Polling loop in handleAudit() (page.tsx:98)
    → GET /api/jobs/{job_id}
    → jobData.status === "completed"
    → jsonResponse = jobData.data
    → aiResponse = jsonResponse.data.responses  →  {gemini: "...", llama_70b: "...", llama_8b: "..."}
    → aiVerdict = jsonResponse.data.verdict     →  {summary, subjectivity_score, ...}
    → setResponse({a: aiResponse["gemini"], b: aiResponse["llama_70b"], c: aiResponse["llama_8b"]})
    → setVerdict(aiVerdict)
    → setStreaming(true) OR setHasAudited(true)
```

### Phase 7: Rendering Pipeline

```
ModelColumn receives new response prop
    → useEffect resets displayedText="" and charIndex=0
    → If Live mode: setTimeout loop types character-by-character through ReactMarkdown
    → If Fast mode: displayedText = response (immediate)
    → ReactMarkdown renders with remarkGfm + SyntaxHighlighter for code blocks
    → On finish: onFinish() → parent's finishedTypingCount++
    → When count === 3: VerdictPanel renders with verdict data
```

---

## 6. Frontend Deep Dive

### `page.tsx` — The Orchestrator

**File:** `frontend/app/page.tsx` (389 lines)

This is the **single most important frontend file**. It holds ALL application state and orchestrates every interaction.

**State Variables:**
| Variable | Type | Purpose |
|----------|------|---------|
| `isAuditing` | boolean | True while waiting for backend response |
| `hasAudited` | boolean | True after responses are fully rendered |
| `response` | `{a, b, c}` | The three model response texts |
| `verdict` | any | The Judge AI verdict object |
| `isStreaming` | boolean | True during typewriter animation |
| `enableStreaming` | boolean | User preference: Live vs Fast mode |
| `currentPrompt` | string | The prompt that was sent (for export) |
| `selectedModels` | `{a, b, c}` | Currently selected model IDs |
| `isGuideOpen` | boolean | Controls guide modal visibility |
| `finishedTypingCount` | number | Tracks how many columns finished typing (0-3) |
| `abortControllerRef` | ref | Cancels in-flight fetch requests |

**Key Functions:**
| Function | What It Does |
|----------|-------------|
| `handleAudit(prompt)` | Main audit flow: reset state → POST to backend → poll → set results |
| `loadPastAudit(audit)` | Loads a historical audit from sidebar into all state |
| `handleNewAudit()` | Resets everything to initial state |
| `handleExport()` | Builds markdown string → triggers browser download |

---

### `components/prompt-bar.tsx` — The Input Bar

- Contains its own `prompt` local state
- Renders: search icon, text input, AUDIT button, Live/Fast toggle, suggested prompts
- The AUDIT button uses the `animate-pulse-glow` CSS animation
- Button text switches between "AUDIT" and "SCANNING..."
- Toggle button changes color: green (Live) ↔ yellow (Fast)

---

### `components/model-column.tsx` — The Response Panel

**Props:**
| Prop | Purpose |
|------|---------|
| `modelName` | Display name (e.g., "Google Gemini 2.5 Flash") |
| `modelTag` | Label (e.g., "MODEL A") |
| `response` | Full response text from backend |
| `isStreaming` | Whether to animate typing |
| `enableStreaming` | Whether streaming mode is on |
| `accentColor` | Hex color for theming (e.g., "#38bdf8" for Gemini) |
| `icon` | Icon type: "bot", "cpu", or "brain" |
| `onFinish` | Callback when typing animation completes |

**Features:**
- **Typewriter effect:** `setTimeout` loop with random 10-30ms delay per character
- **Markdown rendering:** `ReactMarkdown` + `remarkGfm` + `Prism SyntaxHighlighter` (vscDarkPlus theme)
- **Copy button:** Copies raw text to clipboard via `navigator.clipboard`
- **Expand modal:** Full-screen overlay with larger text rendering
- **Scanline effect:** Animated gradient sweep across the text area (CSS `animate-scanline`)
- **Blinking cursor:** Appends " ▌" to text during streaming

---

### `components/verdict-panel.tsx` — The Judge's Verdict

**Renders when:** `isActive=true` AND `data` is not null

**Layout:** 4-column grid on desktop:
1. **Subjectivity Score:** Large number + gradient progress bar (green→yellow→red)
2. **Bias Tag + Summary:** Badge (e.g., "Left-Leaning") + 2-sentence summary
3. **Agreement Rate:** HIGH / MEDIUM / LOW
4. **Confidence:** Percentage

---

### `components/sidebar.tsx` — The Vault

**State:** `isOpen`, `history[]`, `loading`

**Mechanics:**
- Opens via hamburger button → background overlay → sliding drawer from left
- `useEffect` fetches history when drawer opens
- "New Audit" button triggers `onNewAudit` and closes drawer
- Each audit card shows prompt preview + subjectivity score
- Delete button appears on hover (`opacity-0 group-hover:opacity-100`)
- Click on card triggers `onSelectAudit(audit)` and closes drawer

---

### `components/dashboard-header.tsx` — The Header

- Shield icon with glow blur effect
- "BIASBENCH" title + "AI Bias Forensics Lab" subtitle
- Status badges: "SYS:ONLINE" (animated pulse) and "v2.4.1"

---

### `components/guide-modal.tsx` — The Help Guide

- Modal with 4 sections: What is BiasBench?, How does the Judge AI work?, Your History Vault, Pro Tips
- Opens from the floating "How it works" button
- Closeable via X button or background click

---

### `components/bias-radar-chart.tsx` — The Radar Chart

- Uses Recharts library (`RadarChart`, `PolarGrid`, etc.)
- **Currently uses hardcoded demo data** — not connected to live audit responses
- Shows 6 axes: Sentiment, Toxicity, Subjectivity, Polarity, Factuality, Neutrality
- Three overlapping radar shapes in cyan, magenta, and green

---

### UI Component Library (`components/ui/`)

57 shadcn/ui components generated via `npx shadcn-ui`. Notable ones used by the app:
- `Badge` — used in ModelColumn for model tags
- `Button` — used in PromptBar for the AUDIT button
- `Chart` — wraps Recharts for the radar chart

---

## 7. Backend Deep Dive

### `main.py` — The API Server

**File:** `backend/main.py` (132 lines)

**Global State:**
- `JOBS = {}` — In-memory dictionary storing job states. Keys are UUID strings, values are `{status, data/error}`.
- `llm_engine = LLMFactory()` — Single instance of the AI orchestrator.

**Startup:**
- `models.Base.metadata.create_all(bind=engine)` — Creates/migrates the `audits` table on boot.
- CORS configured with `allow_origins=["*"]` — allows any frontend to connect.

**Request Model:**
```python
class PromptRequest(BaseModel):
    prompt: str = Field(..., min_length=5, max_length=500)
    models: List[str] = ["gemini", "llama_70b", "llama_8b"]
```

---

### `app/services/llm_factory.py` — The AI Engine

**File:** `backend/app/services/llm_factory.py` (216 lines)

**This is the core intelligence of the entire application.**

**Constructor (`__init__`):**
- Initializes 3 API clients:
  - `self.gemini_client` — Google GenAI SDK (`genai.Client`)
  - `self.groq_client` — Groq async client (`AsyncGroq`)
  - `self.openrouter_client` — OpenAI-compatible client pointed at OpenRouter

**Model Fetchers:**

| Method | API Provider | Model ID | Temperature |
|--------|-------------|----------|-------------|
| `fetch_gemini()` | Google GenAI SDK | `gemini-2.5-flash` | default |
| `fetch_llama()` | Groq | `llama-3.3-70b-versatile` | 0.7 |
| `fetch_llama_8b()` | Groq | `llama-3.1-8b-instant` | 0.7 |
| `fetch_mixtral()` | Groq | `mixtral-8x7b-32768` | 0.7 |
| `fetch_gemma()` | Groq | `gemma2-9b-it` | 0.7 |

**The Judge (`evaluate_bias` + `_fetch_judge_response`):**

The Judge AI is a **carefully prompted** instance that:
1. Receives system instructions demanding JSON-only output
2. Reads all model responses as a single context block
3. Outputs a structured verdict matching `JudgeResponseSchema`:
   ```python
   class JudgeResponseSchema(BaseModel):
       summary: str
       subjectivity_score: int    # 0-100
       bias_tag: str              # Left-Leaning | Right-Leaning | Neutral/Centrist | Highly Subjective
       agreement_rate: str        # HIGH | MEDIUM | LOW
       confidence: int            # 0-100
   ```
4. Uses `response_format={"type": "json_object"}` to force JSON mode
5. Uses `temperature=0.1` for near-deterministic output
6. Has retry logic: `@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))`
7. Strips markdown code fences (` ```json `) before parsing
8. Validates response against Pydantic schema before returning

**The Orchestrator (`run_all`):**

```
run_all(prompt, selected_models)
    ├── Maps model keys to fetcher functions via available_models dict
    ├── asyncio.gather(*tasks) — fires all API calls simultaneously
    ├── Zips results: dict(zip(valid_model_keys, results))
    ├── Calls evaluate_bias(prompt, answers_dict)
    └── Returns: {responses: {...}, verdict: {...}}
```

---

### `app/database.py` — Database Setup

**Connection Logic:**
```python
raw_db_url = os.getenv("DATABASE_URL", "postgresql://postgres:password@localhost:5432/biasbench")
SQLALCHEMY_DATABASE_URL = raw_db_url.replace("postgres://", "postgresql+psycopg://", 1)
                                     .replace("postgresql://", "postgresql+psycopg://", 1)
```

This double-replace handles Render's legacy `postgres://` URLs by converting them to the modern `postgresql+psycopg://` driver format.

**Session Management:**
- `SessionLocal` — sessionmaker factory, no autocommit, no autoflush
- `get_db()` — generator for FastAPI dependency injection (yield + finally close)

---

### `app/models.py` — The Database Schema

**Table: `audits`**

| Column | Type | Notes |
|--------|------|-------|
| `id` | Integer | Primary key, auto-increment, indexed |
| `prompt` | String | The user's input prompt, indexed |
| `selected_models` | JSON | Array of model key strings |
| `responses` | JSON | Dictionary of model_key → response_text |
| `verdict` | JSON | Judge AI verdict object |
| `created_at` | DateTime | Auto-set to `datetime.utcnow()` |

---

## 8. Database Layer

### Schema Design

The application uses a **single-table design**. All data for one audit lives in one row. The JSON columns (`selected_models`, `responses`, `verdict`) allow flexible, schema-less storage of complex objects.

### Why JSON Columns?

Instead of normalizing into `models`, `responses`, and `verdicts` tables with foreign keys, the project stores everything as JSON. This is appropriate because:
1. The data is always read/written as a complete unit
2. There's no need to query individual model responses independently
3. It dramatically simplifies the codebase (1 model, 1 table, done)

### Session Patterns

Two different session patterns are used:
1. **Dependency Injection** (for route handlers): `get_db()` generator via `Depends()`
2. **Manual Session** (for background tasks): Direct `SessionLocal()` creation with try/finally close

This dual pattern exists because FastAPI's `Depends()` only works within request handlers, not inside background tasks.

---

## 9. API Contract

### `POST /api/audit`

**Request:**
```json
{
  "prompt": "Is AI dangerous?",
  "models": ["gemini", "llama_70b", "llama_8b"]
}
```

**Response (immediate):**
```json
{
  "job_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

### `GET /api/jobs/{job_id}`

**Response (processing):**
```json
{
  "status": "processing",
  "data": null
}
```

**Response (completed):**
```json
{
  "status": "completed",
  "data": {
    "status": "success",
    "data": {
      "responses": {
        "gemini": "AI can be dangerous if...",
        "llama_70b": "The question of AI danger...",
        "llama_8b": "As an AI language model..."
      },
      "verdict": {
        "summary": "All three models acknowledge potential risks...",
        "subjectivity_score": 45,
        "bias_tag": "Neutral/Centrist",
        "agreement_rate": "HIGH",
        "confidence": 88
      }
    },
    "audit_id": 42
  }
}
```

**Response (failed):**
```json
{
  "status": "failed",
  "error": "Error message string"
}
```

### `GET /api/history`

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "id": 42,
      "prompt": "Is AI dangerous?",
      "selected_models": ["gemini", "llama_70b", "llama_8b"],
      "responses": { ... },
      "verdict": { ... },
      "created_at": "2026-06-28T14:00:00"
    }
  ]
}
```

### `DELETE /api/history/{audit_id}`

**Response:**
```json
{
  "message": "Audit with ID 42 has been deleted successfully."
}
```

---

## 10. Streaming vs Fast Mode

### How the Toggle Works

| Step | Live Mode (default) | Fast Mode |
|------|-------------------|-----------|
| User toggles | Green button, "Live" | Yellow button, "Fast" |
| After data arrives | `setStreaming(true)` | `setHasAudited(true)` + `setFinishedTypingCount(3)` |
| ModelColumn behavior | Character-by-character animation (10-30ms/char) | `displayedText = response` (instant) |
| Verdict appears | After all 3 columns report `onFinish()` | Immediately |

### Mid-Stream Toggle

If the user switches from Live → Fast while streaming:
```javascript
useEffect(() => {
  if (!enableStreaming && isStreaming) {
    setStreaming(false);
    setHasAudited(true);
    setFinishedTypingCount(3);
  }
}, [enableStreaming, isStreaming]);
```
This instantly stops typing and reveals everything.

### Toggle Lock

The toggle is disabled (`toggleDisabled={hasAudited}`) after audit completes to prevent confusing state changes.

---

## 11. Export System

### Markdown Report Format

```markdown
# BiasBench AI Forensics Report

**Date:** 6/28/2026, 7:42:08 PM

**Prompt:**
> Is AI dangerous?

---

## ⚖️ Judge's Verdict

- **Bias Tag:** Neutral/Centrist
- **Subjectivity Score:** 45/100
- **Agreement Rate:** HIGH
- **Confidence:** 88%

**Summary:**
All three models acknowledge potential risks but frame them differently...

---

## 🤖 Model Responses

### Google Gemini 2.5 Flash

AI can be dangerous if...

---

### Meta Llama 3.3 (70B)

The question of AI danger...

---
```

### Download Mechanism

```javascript
const blob = new Blob([md], { type: 'text/markdown' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = `biasbench-report-${new Date().getTime()}.md`;
document.body.appendChild(a);
a.click();
document.body.removeChild(a);
URL.revokeObjectURL(url);
```

---

## 12. Environment & Deployment

### Local Development

| Service | URL | Start Command |
|---------|-----|---------------|
| Frontend | `http://localhost:3000` | `cd frontend && npm run dev` |
| Backend | `http://127.0.0.1:8000` | `cd backend && uvicorn main:app --reload` |

### Production

| Service | Platform | Notes |
|---------|----------|-------|
| Frontend | Vercel | Must set `NEXT_PUBLIC_API_URL` env var to Render backend URL |
| Backend | Render | `DATABASE_URL` provided automatically by Render PostgreSQL addon |

### Environment Variables

| Variable | Location | Purpose |
|----------|----------|---------|
| `GEMINI_API_KEY` | backend/.env | Google Gemini API access |
| `GROQ_API_KEY` | backend/.env | Groq API access (Llama, Mixtral, Gemma) |
| `OPENROUTER_API_KEY` | backend/.env | OpenRouter API access (Judge AI) |
| `DATABASE_URL` | backend/.env | PostgreSQL connection string |
| `NEXT_PUBLIC_API_URL` | frontend/.env.local | Backend URL for frontend API calls |

---

## 13. End-to-End Sequence Diagram

```
User                Frontend (page.tsx)        Backend (main.py)          LLMFactory              External APIs
  │                       │                         │                        │                        │
  │─── types prompt ─────►│                         │                        │                        │
  │─── clicks AUDIT ─────►│                         │                        │                        │
  │                       │── POST /api/audit ─────►│                        │                        │
  │                       │                         │── create job_id ──────►│                        │
  │                       │◄── {job_id} ────────────│                        │                        │
  │                       │                         │── BackgroundTask ─────►│                        │
  │                       │                         │                        │── fetch_gemini() ─────►│ Google API
  │                       │                         │                        │── fetch_llama() ──────►│ Groq API
  │                       │                         │                        │── fetch_llama_8b() ───►│ Groq API
  │                       │                         │                        │◄── all responses ──────│
  │                       │                         │                        │── evaluate_bias() ────►│ OpenRouter
  │                       │                         │                        │◄── verdict ────────────│
  │                       │                         │◄── results ────────────│                        │
  │                       │                         │── save to DB           │                        │
  │                       │                         │── JOBS[id]=completed   │                        │
  │                       │                         │                        │                        │
  │                       │── GET /api/jobs/{id} ──►│                        │                        │
  │                       │◄── {status:completed} ──│                        │                        │
  │                       │                         │                        │                        │
  │◄── responses stream ──│                         │                        │                        │
  │◄── verdict appears ───│                         │                        │                        │
  │                       │                         │                        │                        │
  │─── clicks Export ────►│                         │                        │                        │
  │◄── .md file download──│                         │                        │                        │
  │                       │                         │                        │                        │
  │─── opens sidebar ────►│                         │                        │                        │
  │                       │── GET /api/history ────►│                        │                        │
  │                       │◄── past audits ─────────│                        │                        │
  │◄── history list ──────│                         │                        │                        │
```

---

> **This document is the single source of truth for understanding the BiasBench codebase.** Every file, every function, every state variable, every API call, and every user interaction is documented above.
