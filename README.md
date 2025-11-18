# PULSE — AI-Powered User Flow Optimization

PULSE is a web platform that analyzes user flows (onboarding, checkout, login, etc.) and generates AI-driven recommendations to improve conversion, usability, and overall experience. 

> **Upload your flow → Set a goal → Get an intelligent report with actionable improvements.**

Designed for **Product Managers, UX/UI Designers, Growth teams, and Founders** to optimize UX without manual research or long analysis cycles. Simply upload your flow, set a goal, and receive an intelligent UX Optimization Report with actionable insights, benchmarks, and improvement proposals. 

**Short description:** a web app where you upload a user flow and instantly get AI-generated suggestions to optimize it based on your specific objective.

---

## Objective

* Enable teams to upload user flows quickly and intuitively
* Provide automated UX/UI analysis powered by vision + language models
* Deliver prioritized (MoSCoW) recommendations
* Reduce UX audit time from days → minutes

---

## Problem

* PMs struggle to identify **where** to optimize a flow
* Analytics tools show **data**, not **actions**
* No existing solution delivers **goal-oriented UX evaluation using AI**

---

## Value Proposition

* Automated heuristic UX/UI analysis
* MoSCoW-prioritized improvements

---

## Target Users

| User Type        | Primary Need                                             |
| ---------------- | -------------------------------------------------------- |
| Product Manager  | Identify bottlenecks and get actionable improvements     |
| UX/UI Designer   | Validate hierarchy, consistency, and copy                |
| Founder / Growth | Improve conversion on key funnels                        |
| UX Consultant    | Evaluate clients efficiently with a consistent framework |

---

## Supported Inputs

* Screenshots (drag & drop or zip upload)

In future versions, we are planning to add:
* Figma file or public link (via API)
* Store App ID (automatic store screenshot extraction)
* SDK/API (optional for dynamic flows)

---

## Output: UX Optimization Report

The report includes:

* Visual flow map
* Critical UX findings
* Actionable recommendations
* Best-practice comparisons

---

## Hypotheses

* Reducing analysis time leads to weekly use
* Visual contextualization increases perceived value
* AI can detect common UX issues with >85% accuracy

---

# Functional Requirements (MoSCoW)

| ID     | Functionality        | Description                            | Priority        |
| ------ | -------------------- | -------------------------------------- | --------------- |
| **F1** | Flow Upload          | Upload files, screenshots, Figma links | Must            |
| **F2** | Flow Detection       | Auto-order screens + visual map        | Must            |
| **F3** | Objective Definition | Free text + suggestions                | Must            |
| **F4** | AI Analysis          | Visual + NLP processing                | Must            |
| **F5** | Recommendations      | Actionable insights (impact vs effort) | Must            |
| **F6** | UX Benchmarks        | Visual best-practice comparisons       | Should          |
| **F7** | Report Export        | PDF, Notion, Slack                     | Should          |
| **F8** | Compare Versions     | Differences between flows              | Could           |
| **F9** | AI Wireframes        | Generated redesigns                    | Won't (for now) |
| **F10** | Flow Upload - Figma | Figma links                            | Won't (for now) |
| **F10** | Flow Upload - Store | Store App ID and SDK/API               | Won't (for now) |

---

# Non-Functional Requirements

* **Performance:** Analysis < 2 minutes
* **Security:** Encrypted uploads + optional non-storage mode
* **Privacy:** Full user-controlled data deletion
* **Scalability:** Web, mobile, desktop flows
* **UX Style:** Clean, minimal, “Figma meets Notion”

---

# Screen Architecture (MVP)

```text
[Landing Page]
   |
   +-- [Login / Sign Up]
   |       └── OAuth (Google, Notion, GitHub)
   |
   +-- [Dashboard]
   |       ├── New Analysis
   |       ├── Previous analyses
   |       └── Status indicators
   |
   +-- [New Analysis]
   |       ├── Upload flow
   |       ├── Define objective
   |       └── Analyze with AI
   |
   +-- [Processing]
   |       └── Loader + input summary
   |
   └-- [Analysis Result]
           ├── Overview
           ├── Insights & Recommendations (MoSCoW)
           ├── Flow Map
           ├── Benchmarks
           └── Export / Compare
```

---

# User Stories (MVP)

* As a **Product Manager**, I want to upload an onboarding flow and get recommendations to improve conversion.
* As a **UX Designer**, I want feedback on hierarchy, consistency, and copy.
* As a **Founder**, I want to compare my signup flow with competitors.
* As an **advanced user**, I want Figma sync for automatic analysis.

---

# Success Metrics

| Metric             | Target      |
| ------------------ | ----------- |
| Avg. analysis time | < 2 minutes |
| Monthly retention  | > 30%       |
| Recommendation NPS | > 8/10      |
| Report downloads   | > 50%       |
| Repeat analyses    | > 40%       |

---

# Roadmap

| Phase          | Objective        | Deliverables                       |
| -------------- | ---------------- | ---------------------------------- |
| v0 vibecoding prototype test  | Validate the core value by testing with an AI-first approach. | - Vibecoding prototype in Google AI Studio, 
- Test vision + prompt refinement
- Evaluate flow detection + recommendations
- Define initial JSON output structure |
| 0.1 — AI Tool comparison (Google AI Studio vs V0 vs Lovable) | Compare output quality and understand where PULSE can outperform alternatives. | - Side-by-side comparison prototype
- Quality evaluation matrix (insights, flow detection, clarity)
- Identified strengths/weaknesses of each tool
- Prompt improvements based on findings     |
| Backend foundations (supabase)       | Define all technical requirements for the backend implementation     | - Data model (users, analyses, screens, reports)
- Supabase schema (tables + storage buckets)
- Authentication plan (Google/GitHub/Email)
- API requirements (endpoints)   |
| MVP UX/UI Iteration (Figma)       | Iterate and improve the UX/UI design MVP created in Figma. Design report views.
    | Clean prototype of the core flow with the essentials pages   |

---

# Risks & Mitigations

| Risk                     | Mitigation                         |
| ------------------------ | ---------------------------------- |
| Low AI analysis accuracy | Better dataset + refined prompting |
| Privacy concerns         | “No storage” mode by default       |
| Slow Figma API           | Async processing + notifications   |

---

# Competitors

* Contentsquare
* UX Analyzer
* Userflow
* Overflow
* UXCam
* FullStory

---


# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1aPE-Qv2WWkPc4DmOjCxAzROErxrXEPyI

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
