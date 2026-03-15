import styles from './SearchSuggestions.module.css';

const SUGGESTIONS = [
  { icon: '💧', label: 'Clean water regulations',   question: 'What regulations exist about clean water?' },
  { icon: '💊', label: 'FDA proposed rules',         question: 'Show me recent proposed rules from the FDA' },
  { icon: '🚗', label: 'Vehicle emissions rules',    question: 'Find rules about vehicle emissions standards' },
  { icon: '💬', label: 'Comments on EPA docket',     question: 'Show me comments on docket EPA-HQ-OAR-2003-0129' },
  { icon: '🏥', label: 'Healthcare comments',        question: 'Show me recent public comments about healthcare' },
  { icon: '📁', label: 'Immigration dockets',        question: 'Find dockets related to immigration policy' },
];

export default function SearchSuggestions({ onSelect }) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.hero}>
        <div className={styles.heroIconRing}>🏛️</div>
        <h2 className={styles.heroTitle}>Regulations.gov Assistant</h2>
        <p className={styles.heroSub}>
          Ask any question about U.S. federal regulations, proposed rules, public
          comments, and rulemaking dockets — powered by live data from{' '}
          <a href="https://www.regulations.gov" target="_blank" rel="noopener noreferrer">
            Regulations.gov
          </a>
          .
        </p>
      </div>

      <div className={styles.suggestionGrid}>
        {SUGGESTIONS.map((s) => (
          <button key={s.question} className={styles.chip} onClick={() => onSelect(s.question)}>
            <span className={styles.chipIconWrap}>{s.icon}</span>
            <span className={styles.chipLabel}>{s.label}</span>
            <svg className={styles.chipArrow} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
            </svg>
          </button>
        ))}
      </div>

      <div className={styles.divider}>
        <span className={styles.dividerLine} />
        <span className={styles.dividerText}>or type your own question below</span>
        <span className={styles.dividerLine} />
      </div>
    </div>
  );
}
