# English for Everyday Life

**Mr. Nabegh's Learning Journey · تعلم اللغة الإنجليزية للحياة اليومية**

A bilingual (English + Arabic) English-learning web app focused on tenses, verbs, helping verbs and practical sentences for everyday and business life.

## Features

- **12 tense lessons**: timelines, formulas, all subjects, four sentence forms, 15+ real-life examples, common mistakes and a quiz in each lesson
- **Grammar engine**: conjugates any verb in all 12 tenses (affirmative, negative, question, negative question), with Arabic sentences for 40 core verbs
- **Verb library**: 402 verbs with V1/V2/V3, -ing and he/she/it forms, Arabic meanings, pronunciation, filters and flashcards
- **Question bank**: 643 questions in 10 formats; practice and exam modes; 80% mastery level
- **My Mistakes**: wrong answers return for review after 1, 3 and 7 days
- Sentence builder, tense comparison, conversations, time expressions, S/ES/IES rules, quick reference, progress charts
- Progress is saved in the browser (localStorage), with export/import backup

## Run locally

```bash
npm install
npm run dev      # development server
npm run build    # single-file build in dist/index.html
```

## Deploy

Pushing to `main` builds and deploys to GitHub Pages through `.github/workflows/deploy.yml`.
In the repository go to **Settings → Pages → Source** and choose **GitHub Actions** (one time).

## Project structure

```
src/
  data/        verbs, tenses, lessons, conversations, question bank
  engine/      grammar.ts (English), arabic.ts (Arabic), spelling.ts
  store/       progress state + localStorage persistence
  lib/         UI kit, quiz logic, search, navigation
  components/  layout (header, sidebar, assistant), quiz runner
  pages/       dashboard, lessons, tools, practice, reference
```

Built with React, TypeScript, Tailwind CSS, Lucide icons and Recharts.
