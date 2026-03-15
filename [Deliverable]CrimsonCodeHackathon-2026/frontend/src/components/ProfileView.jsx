import { useState } from 'react';
import SimpleMarkdown from './SimpleMarkdown.jsx';
import styles from './ProfileView.module.css';

const EXAMPLES = [
  'Small organic farmer in Vermont, concerned about pesticide regulations and farm bill updates',
  'Environmental attorney focused on Clean Air Act enforcement and EPA rulemaking',
  'Healthcare administrator at a rural hospital, tracking CMS reimbursement rules',
  'Tech startup founder building fintech products, watching CFPB and SEC regulations',
];

export default function ProfileView() {
  const [description, setDescription] = useState('');
  const [briefing, setBriefing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function getBriefing() {
    if (!description.trim() || loading) return;
    setLoading(true);
    setError(null);
    setBriefing(null);
    try {
      const res = await fetch('/api/profile-briefing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: description.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Error ${res.status}`);
      setBriefing(data.briefing);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.profileView}>
      <div className={styles.heroSection}>
        <div className={styles.heroIcon}>👤</div>
        <h2 className={styles.heroTitle}>My Regulatory Profile</h2>
        <p className={styles.heroSub}>
          Tell us who you are and we'll generate a personalized briefing on the regulations
          most relevant to you — powered by live data from Regulations.gov.
        </p>
      </div>

      <div className={styles.inputSection}>
        <label className={styles.inputLabel}>
          Describe yourself or your organization
        </label>
        <textarea
          className={styles.textarea}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="E.g. I run a small brewery in Colorado and want to know about TTB labeling regulations and state distribution rules…"
          rows={4}
        />

        {/* Example chips */}
        <div className={styles.examples}>
          <span className={styles.examplesLabel}>Quick examples:</span>
          <div className={styles.exampleChips}>
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                className={styles.exampleChip}
                onClick={() => setDescription(ex)}
              >
                {ex}
              </button>
            ))}
          </div>
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <button
          className={styles.briefingBtn}
          onClick={getBriefing}
          disabled={loading || !description.trim()}
        >
          {loading ? (
            <><span className={styles.spinner} /> Researching your regulations…</>
          ) : (
            '🔍 Get My Personalized Briefing'
          )}
        </button>
      </div>

      {briefing && (
        <div className={styles.briefingSection}>
          <div className={styles.briefingHeader}>
            <span className={styles.briefingIcon}>📋</span>
            <div>
              <h3 className={styles.briefingTitle}>Your Regulatory Briefing</h3>
              <p className={styles.briefingMeta}>Based on live data from Regulations.gov</p>
            </div>
            <button className={styles.refreshBtn} onClick={() => setBriefing(null)}>
              ↺ New Profile
            </button>
          </div>
          <div className={styles.briefingContent}>
            <SimpleMarkdown text={briefing} />
          </div>
          <div className={styles.briefingFooter}>
            <span className={styles.footerIcon}>💡</span>
            <span>Use the Chat tab to dig deeper into any of these topics or ask follow-up questions.</span>
          </div>
        </div>
      )}
    </div>
  );
}
