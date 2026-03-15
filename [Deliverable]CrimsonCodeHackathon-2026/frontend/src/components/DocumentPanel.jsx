import { useState, useEffect } from 'react';
import SimpleMarkdown from './SimpleMarkdown.jsx';
import styles from './DocumentPanel.module.css';

export default function DocumentPanel({ item, resultType, onClose }) {
  const [phase, setPhase] = useState('loading');
  const [summary, setSummary] = useState(null);
  const [summaryError, setSummaryError] = useState(null);
  const [qaInput, setQaInput] = useState('');
  const [qaHistory, setQaHistory] = useState([]);
  const [qaApiHistory, setQaApiHistory] = useState([]);
  const [qaLoading, setQaLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function fetchSummary() {
      try {
        const res = await fetch('/api/summarize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ item, resultType }),
        });
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) throw new Error(data.error || `Error ${res.status}`);
        setSummary(data.summary);
      } catch (err) {
        if (!cancelled) setSummaryError(err.message);
      } finally {
        if (!cancelled) setPhase('ready');
      }
    }
    fetchSummary();
    return () => { cancelled = true; };
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  async function askQuestion(e) {
    e.preventDefault();
    const q = qaInput.trim();
    if (!q || qaLoading) return;
    setQaLoading(true);
    setQaInput('');
    try {
      const res = await fetch('/api/document-qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q, item, qaHistory: qaApiHistory }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Error ${res.status}`);
      setQaHistory((prev) => [...prev, { question: q, answer: data.answer }]);
      if (data.qaHistory) setQaApiHistory(data.qaHistory);
    } catch (err) {
      setQaHistory((prev) => [
        ...prev,
        { question: q, answer: `Error: ${err.message}` },
      ]);
    } finally {
      setQaLoading(false);
    }
  }

  return (
    <div className={styles.panel}>
      {phase === 'loading' && (
        <div className={styles.loadingRow}>
          <span className={styles.spinner} />
          <span>Analyzing document…</span>
        </div>
      )}

      {phase === 'ready' && (
        <>
          <div className={styles.panelHeader}>
            <span className={styles.panelTitle}>Document Summary</span>
            <button className={styles.closeBtn} onClick={onClose} aria-label="Close">✕</button>
          </div>

          {summaryError ? (
            <p className={styles.error}>{summaryError}</p>
          ) : (
            <SimpleMarkdown text={summary} className={styles.summaryText} />
          )}

          <div className={styles.qaSection}>
            <p className={styles.qaLabel}>Ask a question about this document</p>
            {qaHistory.map((entry, i) => (
              <div key={i} className={styles.qaEntry}>
                <p className={styles.qaQuestion}>Q: {entry.question}</p>
                <SimpleMarkdown text={entry.answer} className={styles.qaAnswer} />
              </div>
            ))}
            <form className={styles.qaForm} onSubmit={askQuestion}>
              <input
                className={styles.qaInput}
                value={qaInput}
                onChange={(e) => setQaInput(e.target.value)}
                placeholder="What are the compliance deadlines?"
                disabled={qaLoading}
              />
              <button className={styles.qaBtn} type="submit" disabled={qaLoading || !qaInput.trim()}>
                {qaLoading ? <span className={styles.miniSpinner} /> : 'Ask'}
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
