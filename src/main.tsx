import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { App } from './App';

// Label table cells for the stacked mobile layout (td::before uses data-l).
new MutationObserver(() => {
  for (const c of document.querySelectorAll<HTMLTableCellElement>('table.stack td:not([data-l])')) {
    let i = 0; let p: Element | null = c;
    while ((p = p.previousElementSibling)) i += (p as HTMLTableCellElement).colSpan;
    c.dataset.l = c.closest('table')?.querySelector('thead tr')?.children[i]?.textContent || '';
  }
}).observe(document, { childList: true, subtree: true });

ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>);
