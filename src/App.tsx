import React from 'react';
import { StoreProvider } from './store/store';
import { NavProvider, useNav } from './lib/nav';
import { Layout } from './components/Layout';
import { Dashboard, Roadmap } from './pages/Home';
import { SubjectsPage, HelpingPage, SesIesPage, TimePage } from './pages/Grammar';
import { TenseLesson, FamilyPage, PerfectPage, ComparePage } from './pages/Tenses';
import { VerbsPage } from './pages/Verbs';
import { BuilderPage, ConversationsPage } from './pages/Tools';
import { QuizzesPage, QuizPage, MistakesPage, ProgressPage } from './pages/Practice';
import { ReferencePage } from './pages/Reference';
import { TENSE_MAP } from './data/tenses';

function Router() {
  const { page } = useNav();
  if (TENSE_MAP[page]) return <TenseLesson key={page} id={page} />;
  switch (page) {
    case 'roadmap': return <Roadmap />;
    case 'subjects': return <SubjectsPage />;
    case 'helping': return <HelpingPage />;
    case 'present': case 'past': case 'future': return <FamilyPage key={page} time={page} />;
    case 'perfect': return <PerfectPage />;
    case 'compare': return <ComparePage />;
    case 'verbs': return <VerbsPage />;
    case 'sesies': return <SesIesPage />;
    case 'time': return <TimePage />;
    case 'builder': return <BuilderPage />;
    case 'conversations': return <ConversationsPage />;
    case 'quizzes': return <QuizzesPage />;
    case 'quiz': return <QuizPage />;
    case 'mistakes': return <MistakesPage />;
    case 'progress': return <ProgressPage />;
    case 'reference': return <ReferencePage />;
    default: return <Dashboard />;
  }
}

export function App() {
  return <StoreProvider><NavProvider><Layout><Router /></Layout></NavProvider></StoreProvider>;
}
