import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { Question } from '../data/questions';
import type { QuizRecord } from '../store/store';

export interface QuizRequest { title: string; titleAr?: string; questions: Question[]; kind: QuizRecord['kind']; ref: string; mode: 'practice' | 'exam'; back?: string }
interface Nav { page: string; go: (p: string, anchor?: string) => void; quiz: QuizRequest | null; startQuiz: (r: QuizRequest) => void; verb: string | null; openVerb: (b: string | null) => void }
const N = createContext<Nav>(null as unknown as Nav);
export const useNav = () => useContext(N);

const read = () => { try { return decodeURIComponent(window.location.hash.slice(1)) || 'dashboard'; } catch { return 'dashboard'; } };

export function NavProvider({ children }: { children: React.ReactNode }) {
  const [page, setPage] = useState(read);
  const [quiz, setQuiz] = useState<QuizRequest | null>(null);
  const [verb, openVerb] = useState<string | null>(null);
  useEffect(() => { const f = () => setPage(read()); window.addEventListener('hashchange', f); return () => window.removeEventListener('hashchange', f); }, []);
  const go = useCallback((p: string, anchor?: string) => {
    if (p === read()) setPage(p); else { try { window.location.hash = p; } catch { /* sandboxed */ } setPage(p); }
    setTimeout(() => {
      if (anchor) document.getElementById(anchor)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      else document.getElementById('main')?.scrollTo({ top: 0 }) ?? window.scrollTo({ top: 0 });
      if (!anchor) window.scrollTo({ top: 0 });
    }, 30);
  }, []);
  const startQuiz = useCallback((r: QuizRequest) => { setQuiz(r); go('quiz'); }, [go]);
  return <N.Provider value={{ page, go, quiz, startQuiz, verb, openVerb }}>{children}</N.Provider>;
}
