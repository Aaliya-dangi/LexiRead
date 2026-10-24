# Product Requirements Document (PRD)
## An Intelligent AI-Powered Dyslexia-Friendly Reading Assistant with Real-Time Adaptive Support

**Project Type:** Final Year B.E. Project (CSE)
**Institution:** Anjuman Institute of Technology & Management, Bhatkal (VTU)
**Team:** Aaliya Dangi, Aayisha Haifa, Saniya Tahsin Kalo, Uzma Khanum
**Guide:** Mrs. Arzoo, Assistant Professor, Dept. of CSE

---

## 1. Overview

Dyslexia affects reading, spelling, comprehension, and word-recognition ability. Most existing
tools (reviewed in the literature survey — eye-tracking, EEG, MRI, transformer-based detection
models, etc.) focus almost entirely on **detecting/diagnosing** dyslexia rather than **helping
someone read right now**. They are also often hardware-heavy (EEG/MRI/AR headsets), which
makes them impractical for everyday classroom or home use.

This project instead builds a **software-only, real-time reading assistant**: the user uploads or
pastes text (typed text, an image, a PDF, or a scanned document), and the system extracts it,
simplifies it, reads it aloud, highlights it in sync, and — based on how the person is actually
reading (speed, pauses, repeated difficult words) — adapts the experience for them over time. A
secondary module converts dense text into diagrams/flowcharts/visual summaries.

## 2. Problem Statement

Dyslexic learners struggle to process dense textual content through traditional, one-size-fits-all
teaching material. Existing AI systems for dyslexia are overwhelmingly diagnostic (classification
accuracy focused) rather than assistive, require specialized/expensive hardware (EEG, MRI,
eye-trackers), and — even where assistive features exist (OCR, TTS, chatbots) — they are
fragmented single-feature tools rather than one integrated, adaptive, real-time platform.

## 3. Goals & Objectives

1. Build an AI-powered reading assistant usable by dyslexic learners with no special hardware.
2. Provide real-time adaptive support driven by observed reading behavior (speed, pauses,
   re-reads, flagged words) rather than a static profile.
3. Simplify difficult text (vocabulary + sentence structure) using NLP.
4. Provide synchronized audio narration and pronunciation support via TTS/Speech Recognition.
5. Convert dense text into diagrams/flowcharts/visual summaries for non-linear understanding.
6. Support dyslexia-friendly presentation: adjustable fonts (e.g. OpenDyslexic-style), spacing,
   line height, color themes, word highlighting.
7. Keep the platform cost-effective, browser-based, and deployable in schools, special-education
   centers, and at home.

## 4. Target Users

- **Primary:** School and college students with dyslexia or general reading difficulty.
- **Secondary:** Special-education teachers/therapists who assign or supervise reading material.
- **Tertiary:** Parents supporting home learning.

## 5. Scope

### In scope (MVP, matches the report's proposed system)
- Text input via: direct typed/pasted text, image upload (OCR), PDF upload, scanned document.
- OCR text extraction (images, PDFs, scans).
- NLP-based text simplification (hard vocabulary → simpler synonyms, long/complex sentences →
  shorter sentences).
- Dyslexia-friendly reading view: adjustable font/size/spacing/theme, word-by-word highlighting.
- Text-to-Speech narration synced with highlighting; adjustable reading speed.
- Speech Recognition for pronunciation practice / read-along interaction.
- Real-time adaptive engine: tracks reading speed, pause locations, re-read/backtrack behavior,
  and words the user struggles with; adjusts simplification level, highlighting pace, and flags
  vocabulary for review.
- AI-based visual learning module: converts a paragraph/section into a simple diagram, flowchart,
  or bullet-style visual summary.
- User accounts with persisted reading history, preferences, and progress (MongoDB/Firebase).

### Out of scope (future work, per report's future scope)
- Clinical dyslexia detection/diagnosis (EEG, MRI, eye-tracking) — this project assumes the user
  is already a self-identified or diagnosed dyslexic learner, and does not diagnose.
- Multilingual support (future scope).
- Native mobile apps (future scope; MVP is web-based, responsive).
- Advanced AI-based learning analytics dashboards for teachers (future scope).
- AR/VR-based learning content.

## 6. Key Features (Functional Requirements)

| # | Feature | Description |
|---|---|---|
| F1 | Multi-format input | Upload image / PDF / scanned doc, or paste/type text |
| F2 | OCR extraction | Extract machine-readable text from uploaded documents |
| F3 | Text simplification | NLP simplifies vocabulary and sentence complexity, preserving meaning |
| F4 | Dyslexia-friendly rendering | Adjustable font family/size, line/letter spacing, background/text color themes |
| F5 | Word highlighting | Highlights current word/line as it is read, synced to TTS |
| F6 | Text-to-Speech | Reads content aloud; adjustable voice speed/pitch |
| F7 | Pronunciation support | Speech recognition lets the user attempt a word/passage and get feedback |
| F8 | Adaptive engine | Monitors reading speed, pause points, backtracking, and repeated-difficulty words; adjusts UI/content difficulty and flags vocabulary |
| F9 | Visual learning module | Converts a passage into a diagram/flowchart/mind-map/visual summary |
| F10 | Progress tracking | Stores reading history, performance trends, and preferences per user |
| F11 | User profiles | Login/signup; persisted personalization settings |

## 7. Non-Functional Requirements

- **Usability:** UI must itself be dyslexia-friendly (no default small serif fonts, no dense walls
  of text, generous spacing, calm color palette) — the interface is part of the accessibility story.
- **Performance:** OCR + simplification + TTS setup for a typical page should complete in a few
  seconds; word highlighting must stay in sync with audio (no perceptible drift).
- **Accessibility:** WCAG-aware color contrast, keyboard navigability, screen-reader compatibility
  as a baseline in addition to dyslexia-specific accommodations.
- **Cost-effectiveness:** Prefer free/open-source or low-cost APIs and libraries where possible,
  consistent with the report's "cost-effective" goal.
- **Privacy:** Reading data and uploaded documents may include personal/academic material —
  store only what's needed, and allow account/data deletion.
- **Portability:** Web-based, responsive; works on typical school/home hardware (no special
  hardware such as EEG/eye-trackers required).

## 8. Technology Stack (as specified in the report)

- **Frontend:** React.js + Tailwind CSS
- **Backend:** Node.js + Express.js
- **Database:** MongoDB or Firebase (user data, reading history, personalization settings)
- **AI/NLP:** NLP libraries/APIs for text simplification
- **OCR:** OCR engine/API for text extraction from images/PDFs/scans
- **Speech:** Text-to-Speech and Speech Recognition APIs
- **AI Visualization:** AI-based module to generate diagrams/flowcharts from text

## 9. Success Metrics (suggested — for evaluation/demo purposes)

- Simplification reduces average sentence length / reading-difficulty score (e.g., Flesch-Kincaid)
  by a target margin without changing meaning.
- Word-highlight/TTS sync accuracy (no drift beyond X ms over a page).
- Adaptive engine measurably changes behavior (e.g., simplification level, pacing) within a
  session based on live reading signals.
- Usability feedback from a small user test group (even informal, since this is an academic
  project) shows improved comprehension/confidence vs. plain-text baseline.

## 10. Risks & Constraints

- OCR accuracy on poor-quality scans/handwriting may be limited.
- "Real-time adaptive ML" is ambitious for a student project scope — an MVP heuristic
  (rule-based adaptation using reading-speed/pause thresholds) is a realistic first version, with
  a true ML model as a stretch goal.
- TTS/word-highlight sync depends on the chosen TTS API's word-boundary event support.
- Speech recognition accuracy varies by accent/mic quality — treat as supportive, not evaluative.

## 11. Milestones (suggested phasing for a final-year project timeline)

1. **Phase 1 – Core pipeline:** input → OCR → simplification → dyslexia-friendly rendering.
2. **Phase 2 – Audio layer:** TTS narration + synced highlighting + speech recognition.
3. **Phase 3 – Adaptive engine:** behavior tracking + rule-based (then ML-based) adaptation.
4. **Phase 4 – Visual learning module:** text-to-diagram/flowchart generation.
5. **Phase 5 – Accounts & persistence:** auth, history, progress tracking, polish, and demo/report.
