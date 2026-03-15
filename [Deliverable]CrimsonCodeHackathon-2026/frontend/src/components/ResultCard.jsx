import { useState } from 'react';
import DocumentPanel from './DocumentPanel.jsx';
import styles from './ResultCard.module.css';

const DOC_TYPE_COLORS = {
  'Rule': '#16a34a',
  'Proposed Rule': '#d97706',
  'Notice': '#2563eb',
  'Supporting & Related Material': '#7c3aed',
  'Other': '#64748b',
};

function formatDate(dateStr) {
  if (!dateStr) return null;
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function regGovLink(type, id) {
  if (!id) return null;
  const map = { documents: 'document', document: 'document', comments: 'comment', comment: 'comment', dockets: 'docket', docket: 'docket' };
  return `https://www.regulations.gov/${map[type] || 'document'}/${id}`;
}

function typeClass(resultType) {
  if (resultType === 'documents' || resultType === 'document') return styles.typeDocument;
  if (resultType === 'comments'  || resultType === 'comment')  return styles.typeComment;
  if (resultType === 'dockets'   || resultType === 'docket')   return styles.typeDocket;
  return '';
}

export default function ResultCard({ item, resultType, onDraftComment }) {
  const [panelOpen, setPanelOpen] = useState(false);

  if (!item) return null;
  const { id, attributes: attr = {} } = item;
  const href = regGovLink(resultType, id);

  const isDocument = resultType === 'documents' || resultType === 'document';
  const isComment  = resultType === 'comments'  || resultType === 'comment';
  const isDocket   = resultType === 'dockets'   || resultType === 'docket';

  const docTypeColor = DOC_TYPE_COLORS[attr.documentType] || '#64748b';
  const withdrawn = attr.withdrawn === true;

  return (
    <div className={`${styles.card} ${typeClass(resultType)} ${withdrawn ? styles.withdrawn : ''}`}>
      <div className={styles.body}>
        {/* Top row */}
        <div className={styles.topRow}>
          <div className={styles.badges}>
            {isDocument && attr.documentType && (
              <span className={styles.typeBadge} style={{ '--badge-color': docTypeColor }}>
                {attr.documentType}
              </span>
            )}
            {isDocket && attr.docketType && (
              <span className={styles.typeBadge} style={{ '--badge-color': '#7c3aed' }}>
                {attr.docketType}
              </span>
            )}
            {isComment && (
              <span className={styles.typeBadge} style={{ '--badge-color': '#0891b2' }}>
                Public Comment
              </span>
            )}
            {withdrawn && <span className={styles.withdrawnBadge}>Withdrawn</span>}
            {isDocument && attr.openForComment && !withdrawn && (
              <span className={styles.openBadge}>Open for Comment</span>
            )}
          </div>
          {attr.agencyId && <span className={styles.agencyChip}>{attr.agencyId}</span>}
        </div>

        {/* Title */}
        <h3 className={styles.title}>{attr.title || id || 'Untitled'}</h3>

        {/* Meta */}
        <div className={styles.meta}>
          {(attr.postedDate || attr.lastModifiedDate) && (
            <span className={styles.metaItem}>
              <CalendarIcon />
              {isDocument || isComment
                ? formatDate(attr.postedDate)
                : `Updated ${formatDate(attr.lastModifiedDate)}`}
            </span>
          )}
          {attr.docketId && (
            <span className={styles.metaItem}>
              <FolderIcon />
              {attr.docketId}
            </span>
          )}
          {isDocument && attr.commentCount != null && (
            <span className={styles.metaItem}>
              <CommentIcon />
              {attr.commentCount.toLocaleString()} comment{attr.commentCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Comment text */}
        {isComment && attr.comment && (
          <blockquote className={styles.commentText}>
            {truncate(attr.comment, 400)}
          </blockquote>
        )}
        {isComment && attr.commentOn && (
          <p className={styles.commentOn}><strong>On:</strong> {attr.commentOn}</p>
        )}

        {/* Action buttons */}
        {isDocument && !withdrawn && (
          <div className={styles.actionRow}>
            <button
              className={`${styles.actionBtn} ${panelOpen ? styles.actionBtnActive : ''}`}
              onClick={() => setPanelOpen((v) => !v)}
            >
              <SummaryIcon /> {panelOpen ? 'Hide Summary' : 'Summarize'}
            </button>
            {attr.openForComment && onDraftComment && (
              <button
                className={`${styles.actionBtn} ${styles.actionBtnComment}`}
                onClick={() => onDraftComment(item)}
              >
                <PenIcon /> Draft Comment
              </button>
            )}
          </div>
        )}

        {/* Document panel (summary + Q&A) */}
        {panelOpen && (
          <DocumentPanel
            item={item}
            resultType={resultType}
            onClose={() => setPanelOpen(false)}
          />
        )}
      </div>

      {/* Footer link */}
      {href && (
        <div className={styles.cardFooter}>
          <a href={href} target="_blank" rel="noopener noreferrer" className={styles.viewLink}>
            View on Regulations.gov
            <ExternalIcon />
          </a>
        </div>
      )}
    </div>
  );
}

function truncate(str, max) {
  if (!str || str.length <= max) return str;
  return str.slice(0, max) + '…';
}

const CalendarIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const FolderIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
  </svg>
);
const CommentIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);
const ExternalIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
  </svg>
);
const SummaryIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="21" y1="6" x2="3" y2="6"/><line x1="15" y1="12" x2="3" y2="12"/><line x1="17" y1="18" x2="3" y2="18"/>
  </svg>
);
const PenIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
  </svg>
);
