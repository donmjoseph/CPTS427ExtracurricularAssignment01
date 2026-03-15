import { useState } from 'react';
import ResultCard from './ResultCard.jsx';
import SimpleMarkdown from './SimpleMarkdown.jsx';
import styles from './MessageBubble.module.css';

export default function MessageBubble({ message, onLoadMore, onDraftComment }) {
  const [loadingMore, setLoadingMore] = useState(false);
  const [synthesis, setSynthesis] = useState(null);
  const [synthLoading, setSynthLoading] = useState(false);
  const { role, text, isError, errorText, results, pagination } = message;

  async function handleLoadMore() {
    setLoadingMore(true);
    try {
      await onLoadMore(pagination);
    } finally {
      setLoadingMore(false);
    }
  }

  async function handleSynthesize(items) {
    setSynthLoading(true);
    setSynthesis(null);
    try {
      const res = await fetch('/api/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          resultType: results?.type,
          originalQuery: message.userQuery || '',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Error ${res.status}`);
      setSynthesis(data.synthesis);
    } catch (err) {
      setSynthesis(`Error: ${err.message}`);
    } finally {
      setSynthLoading(false);
    }
  }

  // Gather items to render
  const items = getItems(results);
  const docItems = items.filter((i) => {
    const rt = results?.type;
    return rt === 'documents' || rt === 'document';
  });

  if (role === 'user') {
    return (
      <div className={styles.userRow}>
        <div className={styles.userBubble}>{text}</div>
      </div>
    );
  }

  return (
    <div className={styles.assistantRow}>
      <div className={styles.avatar}>🏛️</div>
      <div className={styles.assistantContent}>
        {isError ? (
          <div className={styles.errorBubble}>
            <span className={styles.errorIcon}>⚠️</span>
            <span>{errorText}</span>
          </div>
        ) : (
          text && <div className={styles.assistantBubble}>{text}</div>
        )}

        {items.length > 0 && (
          <div className={styles.cards}>
            {items.map((item) => (
              <ResultCard
                key={item.id}
                item={item}
                resultType={results?.type}
                onDraftComment={onDraftComment}
              />
            ))}
          </div>
        )}

        {/* Synthesize button — only for 2+ document results */}
        {docItems.length >= 2 && !synthesis && (
          <div className={styles.synthesizeRow}>
            <button
              className={styles.synthesizeBtn}
              onClick={() => handleSynthesize(docItems)}
              disabled={synthLoading}
            >
              {synthLoading ? (
                <><span className={styles.miniSpinner} /> Synthesizing {docItems.length} documents…</>
              ) : (
                <>✨ Synthesize {docItems.length} Documents</>
              )}
            </button>
          </div>
        )}

        {/* Synthesis output */}
        {synthesis && (
          <div className={styles.synthesisBox}>
            <div className={styles.synthesisHeader}>
              <span className={styles.synthesisLabel}>📊 Multi-Document Synthesis</span>
              <button className={styles.closeSynthBtn} onClick={() => setSynthesis(null)}>✕</button>
            </div>
            <SimpleMarkdown text={synthesis} className={styles.synthesisContent} />
          </div>
        )}

        {pagination?.hasMore && (
          <div className={styles.loadMoreRow}>
            <button
              className={styles.loadMoreBtn}
              onClick={handleLoadMore}
              disabled={loadingMore}
            >
              {loadingMore ? (
                <>
                  <span className={styles.miniSpinner} /> Loading…
                </>
              ) : (
                `Load more results`
              )}
            </button>
            {pagination.totalElements > 0 && (
              <span className={styles.totalHint}>
                Showing {items.length} of {pagination.totalElements} total
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function getItems(results) {
  if (!results) return [];
  const raw = results.data;
  if (!raw) return [];

  // List response: { data: [...] }
  if (Array.isArray(raw.data)) return raw.data;

  // Single item response: { data: { id, type, attributes } }
  if (raw.data && raw.data.id) return [raw.data];

  return [];
}
