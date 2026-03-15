import { useState, useEffect } from 'react';
import styles from './Dashboard.module.css';

function formatDate(dateStr) {
  if (!dateStr) return null;
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  } catch { return dateStr; }
}

function daysUntil(dateStr) {
  if (!dateStr) return null;
  const diff = new Date(dateStr) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function urgencyClass(days, styles) {
  if (days === null) return '';
  if (days <= 3) return styles.urgent;
  if (days <= 14) return styles.soon;
  return styles.comfortable;
}

export default function Dashboard() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/open-for-comment');
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || `Error ${res.status}`);
        // Server returns raw Reg.gov format: { data: [{ id, attributes: {...} }] }
        const raw = Array.isArray(data.data) ? data.data : [];
        const normalized = raw.map((item) => ({
          id: item.id,
          ...item.attributes,
        }));
        setItems(normalized);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const agencies = ['all', ...new Set(items.map((i) => i.agencyId).filter(Boolean))];

  const filtered = filter === 'all' ? items : items.filter((i) => i.agencyId === filter);

  return (
    <div className={styles.dashboard}>
      <div className={styles.dashHeader}>
        <div>
          <h2 className={styles.dashTitle}>Open for Public Comment</h2>
          <p className={styles.dashSub}>Federal regulations currently accepting public input</p>
        </div>
        {!loading && !error && (
          <span className={styles.countBadge}>{filtered.length} rule{filtered.length !== 1 ? 's' : ''}</span>
        )}
      </div>

      {/* Agency filter */}
      {!loading && !error && agencies.length > 1 && (
        <div className={styles.filterRow}>
          {agencies.slice(0, 12).map((a) => (
            <button
              key={a}
              className={`${styles.filterChip} ${filter === a ? styles.filterActive : ''}`}
              onClick={() => setFilter(a)}
            >
              {a === 'all' ? 'All Agencies' : a}
            </button>
          ))}
        </div>
      )}

      {loading && (
        <div className={styles.centeredMsg}>
          <span className={styles.spinner} />
          <span>Loading open rules…</span>
        </div>
      )}

      {error && (
        <div className={styles.errorCard}>
          <span>⚠️</span> {error}
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className={styles.centeredMsg}>No open-for-comment documents found.</div>
      )}

      {!loading && !error && (
        <div className={styles.cardGrid}>
          {filtered.map((item) => {
            const days = daysUntil(item.commentEndDate);
            return (
              <div key={item.id} className={styles.card}>
                <div className={styles.cardTop}>
                  <div className={styles.cardBadges}>
                    {item.agencyId && (
                      <span className={styles.agencyBadge}>{item.agencyId}</span>
                    )}
                    {item.documentType && (
                      <span className={styles.typeBadge}>{item.documentType}</span>
                    )}
                  </div>
                  {days !== null && (
                    <span className={`${styles.deadlinePill} ${urgencyClass(days, styles)}`}>
                      {days <= 0 ? 'Closed' : `${days}d left`}
                    </span>
                  )}
                </div>

                <h3 className={styles.cardTitle}>{item.title}</h3>

                <div className={styles.cardMeta}>
                  {item.postedDate && (
                    <span className={styles.metaItem}>
                      <CalIcon /> Posted {formatDate(item.postedDate)}
                    </span>
                  )}
                  {item.commentEndDate && (
                    <span className={styles.metaItem}>
                      <DeadlineIcon /> Deadline {formatDate(item.commentEndDate)}
                    </span>
                  )}
                  {item.commentCount != null && (
                    <span className={styles.metaItem}>
                      <CommentIcon /> {item.commentCount.toLocaleString()} comments
                    </span>
                  )}
                </div>

                <div className={styles.cardFooter}>
                  <a
                    href={`https://www.regulations.gov/document/${item.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.viewBtn}
                  >
                    View &amp; Comment <ExternalIcon />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const CalIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const DeadlineIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const CommentIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);
const ExternalIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
  </svg>
);
