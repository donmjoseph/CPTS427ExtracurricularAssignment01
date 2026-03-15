import { useState } from 'react';
import SimpleMarkdown from './SimpleMarkdown.jsx';
import styles from './CommentDrafter.module.css';

const POSITIONS = [
  { value: 'support', label: 'Support', emoji: '✅' },
  { value: 'oppose', label: 'Oppose', emoji: '❌' },
  { value: 'neutral', label: 'Neutral / Suggest Changes', emoji: '📝' },
];

export default function CommentDrafter({ doc, onClose }) {
  const [position, setPosition] = useState('support');
  const [perspective, setPerspective] = useState('');
  const [draft, setDraft] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  if (!doc) return null;

  const { id, attributes: attr = {} } = doc;

  async function generateDraft() {
    if (!perspective.trim() || loading) return;
    setLoading(true);
    setError(null);
    setDraft(null);
    try {
      const res = await fetch('/api/draft-comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ document: doc, position, perspective: perspective.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Error ${res.status}`);
      setDraft(data.comment);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function copyToClipboard() {
    if (!draft) return;
    // Strip markdown for clipboard
    const plain = draft.replace(/\*\*/g, '').replace(/^[•\-\*]\s/gm, '- ');
    await navigator.clipboard.writeText(plain);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <div className={styles.modalTitleGroup}>
            <span className={styles.modalIcon}>📝</span>
            <div>
              <h2 className={styles.modalTitle}>Draft Public Comment</h2>
              <p className={styles.modalSub}>AI-assisted formal comment for submission</p>
            </div>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">✕</button>
        </div>

        {/* Document reference */}
        <div className={styles.docRef}>
          <span className={styles.docRefLabel}>Document:</span>
          <span className={styles.docRefTitle}>{attr.title || id}</span>
          {attr.docketId && <span className={styles.docRefDocket}>Docket: {attr.docketId}</span>}
        </div>

        <div className={styles.body}>
          {!draft ? (
            <>
              {/* Position selector */}
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Your Position</label>
                <div className={styles.positionGrid}>
                  {POSITIONS.map((p) => (
                    <button
                      key={p.value}
                      className={`${styles.positionBtn} ${position === p.value ? styles.positionActive : ''}`}
                      onClick={() => setPosition(p.value)}
                    >
                      <span className={styles.positionEmoji}>{p.emoji}</span>
                      <span>{p.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Perspective */}
              <div className={styles.field}>
                <label className={styles.fieldLabel}>
                  Your Perspective
                  <span className={styles.fieldHint}> — Who are you and why does this matter to you?</span>
                </label>
                <textarea
                  className={styles.perspectiveInput}
                  value={perspective}
                  onChange={(e) => setPerspective(e.target.value)}
                  placeholder="E.g. I am a small farmer in Iowa. This rule would require expensive equipment upgrades that are financially unfeasible for operations of my scale…"
                  rows={5}
                />
              </div>

              {error && <p className={styles.error}>{error}</p>}

              <button
                className={styles.generateBtn}
                onClick={generateDraft}
                disabled={loading || !perspective.trim()}
              >
                {loading ? (
                  <><span className={styles.spinner} /> Drafting comment…</>
                ) : (
                  '✨ Generate Comment Draft'
                )}
              </button>
            </>
          ) : (
            <>
              {/* Draft output */}
              <div className={styles.draftHeader}>
                <span className={styles.draftLabel}>Your Draft Comment</span>
                <div className={styles.draftActions}>
                  <button className={styles.copyBtn} onClick={copyToClipboard}>
                    {copied ? '✓ Copied!' : '📋 Copy Text'}
                  </button>
                  <button className={styles.reviseBtn} onClick={() => setDraft(null)}>
                    ✏️ Revise
                  </button>
                </div>
              </div>

              <div className={styles.draftBox}>
                <SimpleMarkdown text={draft} />
              </div>

              <div className={styles.submitNote}>
                <span className={styles.submitIcon}>💡</span>
                <span>
                  To submit this comment, visit{' '}
                  <a
                    href={`https://www.regulations.gov/document/${id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    the document on Regulations.gov
                  </a>{' '}
                  and click "Submit a Formal Comment".
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
