# Regulations.gov Assistant

> **CrimsonCode Hackathon 2026** — An AI-powered civic tool that makes U.S. federal rulemaking accessible to everyone.

---

## What It Is

Federal regulations affect every American — from food safety to financial rules to environmental standards. But navigating [Regulations.gov](https://www.regulations.gov) is notoriously difficult: dense legalese, complex search, thousands of documents, and a steep learning curve to participate.

**Regulations.gov Assistant** fixes that. It's a conversational AI interface that lets anyone search, understand, and engage with federal regulations using plain English. You don't need a law degree — just type a question.

---

## Demo

```
You:  "What clean water rules is the EPA currently proposing?"

AI:   Found 8 documents matching your search...
      [EPA-HQ-OW-2024-0051] Revised Effluent Guidelines — Open for Comment (12 days left)
      [EPA-HQ-OW-2023-0098] Waters of the United States Definition — Final Rule
      ...

      → Click "Summarize" to get a plain-English breakdown
      → Click "Draft Comment" to write a formal public comment
      → Click "Synthesize" to analyze all 8 together
```

---

## Five Key Features

### Feature A — Document Summarizer + Q&A
Click **Summarize** on any regulation to get an AI-generated breakdown:
- **Summary** — What this regulation does in 2–3 sentences
- **Key Points** — 3–5 bullet points of the most important content
- **Who Is Affected** — Which industries, agencies, or people are impacted
- **Important Dates** — Deadlines, effective dates, comment windows
- **Bottom Line** — One sentence takeaway

Then ask **follow-up questions** in a built-in Q&A panel. The AI answers in context of that specific document.

---

### Feature B — Public Comment Drafter
Every American has the right to comment on proposed federal rules. Most people don't because writing a formal public comment is intimidating.

Click **Draft Comment** on any open regulation, specify your position (Support / Oppose / Suggest Changes) and your background, and get a 250–400 word formal comment ready to submit — no legal writing skills required.

---

### Feature C — Open for Comment Dashboard
A live dashboard showing all federal regulations currently accepting public input. Filter by agency (EPA, FDA, DOT, HHS, etc.) and sort by urgency:

- 🔴 **Urgent** — 3 days or fewer remaining
- 🟠 **Soon** — 3–14 days remaining
- 🟢 **Comfortable** — More than 14 days remaining

One click links directly to Regulations.gov to submit your comment.

---

### Feature D — Personalized Regulatory Briefing
Tell the AI who you are — *"I'm a small organic farmer in Vermont"* or *"I run a fintech startup"* — and it searches regulations relevant to your situation, then generates a personalized briefing:

- Your Regulatory Landscape
- Key Regulations to Know
- Time-Sensitive Items
- Your Next Steps

---

### Feature E — Multi-Document Synthesis
When a search returns multiple documents, click **Synthesize** to have the AI analyze them together and produce:

- Regulatory Landscape overview
- Key Themes & Trends across documents
- Most Significant Items
- Actionable next steps and deadlines

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Browser                              │
│                                                              │
│  ┌──────────┐  ┌────────────┐  ┌────────────┐              │
│  │   Chat   │  │  Dashboard │  │  Profile   │  ← React tabs│
│  │  Window  │  │ (Open for  │  │  Briefing  │              │
│  │          │  │  Comment)  │  │            │              │
│  └──────────┘  └────────────┘  └────────────┘              │
│                                                              │
│  ┌──────────┐  ┌──────────────┐  ┌────────────────────┐    │
│  │ Result   │  │  Document    │  │  Comment Drafter   │    │
│  │  Cards   │  │  Panel (Q&A) │  │  (Modal)           │    │
│  └──────────┘  └──────────────┘  └────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                          │  /api/*
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    Express.js Backend (port 3001)            │
│                                                              │
│   POST /api/chat          ← Main agentic chat loop           │
│   POST /api/summarize     ← Document summarization           │
│   POST /api/document-qa   ← Document Q&A                    │
│   POST /api/draft-comment ← Comment generation              │
│   GET  /api/open-for-comment ← Dashboard feed               │
│   POST /api/profile-briefing ← Personalized briefing        │
│   POST /api/synthesize    ← Multi-document analysis         │
└─────────────────────────────────────────────────────────────┘
          │                              │
          ▼                              ▼
  ┌───────────────┐            ┌──────────────────┐
  │ Regulations   │            │  Google Gemini   │
  │   .gov API    │            │   (Flash 2.0)    │
  │               │            │                  │
  │  Documents    │◄───────────│  Function-       │
  │  Comments     │  tool use  │  Calling API     │
  │  Dockets      │            │  (agentic loop)  │
  └───────────────┘            └──────────────────┘
```

---

## How the Agentic Loop Works

The core AI behavior is an **agentic tool-use loop**:

1. User sends a natural language message
2. Gemini reads the message and decides which tool(s) to call
3. Backend executes the chosen Regulations.gov API call(s)
4. Results are fed back to Gemini
5. Gemini synthesizes a response and returns structured results
6. Frontend renders rich result cards + AI narrative text

Gemini has access to **6 tools**:

| Tool | Description |
|------|-------------|
| `search_documents` | Find rules, proposed rules, and notices |
| `get_document` | Fetch a single document by exact ID |
| `search_comments` | Find public comments by topic or docket |
| `get_comment` | Fetch a single comment with attachments |
| `search_dockets` | Find rulemaking dockets |
| `get_docket` | Fetch a single docket by exact ID |

Gemini decides which tool fits the user's intent — no hardcoded routing.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite 5 |
| Styling | CSS Modules |
| Backend | Node.js + Express.js |
| AI Model | Google Gemini Flash 2.0 |
| Data Source | Regulations.gov API v4 |
| Communication | REST / JSON |

No database. No auth system. Stateless by design — conversation history is maintained client-side and sent with each request.

---

## Component Map

```
frontend/src/
├── App.jsx                   # Root: state, routing, message dispatch
├── components/
│   ├── TabBar.jsx            # Chat / Dashboard / Profile tab nav
│   ├── ChatWindow.jsx        # Scrollable message list
│   ├── MessageBubble.jsx     # User and assistant message rendering
│   ├── ResultCard.jsx        # Document / comment / docket card
│   ├── SearchSuggestions.jsx # Starter question chips (empty state)
│   ├── Dashboard.jsx         # Open-for-comment live feed + agency filter
│   ├── DocumentPanel.jsx     # Summarize + Q&A panel
│   ├── CommentDrafter.jsx    # Modal: position → draft → copy
│   ├── ProfileView.jsx       # Profile input → personalized briefing
│   └── SimpleMarkdown.jsx    # Lightweight markdown renderer
```

```
backend/
└── server.js                 # All endpoints + Gemini tool definitions + agentic loop
```

---

## Running Locally

**Prerequisites:** Node.js 18+

### 1. Get API Keys

- **Regulations.gov key** — free at https://api.regulations.gov/ (instant)
- **Gemini key** — free at https://aistudio.google.com/apikey

### 2. Configure Environment

```bash
# backend/.env
REGULATIONS_GOV_API_KEY=your_key_here
GEMINI_API_KEY=your_key_here
```

### 3. Start Backend

```bash
cd backend
npm install
npm start
# ✅  Backend running on http://localhost:3001
```

### 4. Start Frontend

```bash
cd frontend
npm install
npm run dev
# Open http://localhost:5173
```

---

## API Rate Limits

Regulations.gov enforces:
- **50 requests / minute**
- **500 requests / hour**

The app surfaces rate limit errors clearly so users know when to pause.

---

## Why This Matters

Public comment periods are a cornerstone of American democracy — agencies are legally required to read and respond to substantive public comments. But only a tiny fraction of the population ever participates, largely because the process is opaque and technically demanding.

This tool removes those barriers. Anyone — a farmer worried about pesticide rules, a small business owner tracking labor regulations, a student studying environmental policy — can now search, understand, and participate in the federal rulemaking process.

**Civic participation shouldn't require a law degree.**
