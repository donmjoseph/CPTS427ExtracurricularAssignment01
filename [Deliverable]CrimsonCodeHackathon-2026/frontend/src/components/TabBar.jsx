import styles from './TabBar.module.css';

const TABS = [
  { id: 'chat',      label: 'Chat',              icon: '💬' },
  { id: 'dashboard', label: 'Open for Comment',  icon: '📋' },
  { id: 'profile',   label: 'My Profile',        icon: '👤' },
];

export default function TabBar({ activeTab, onTabChange }) {
  return (
    <nav className={styles.tabBar}>
      {TABS.map(tab => (
        <button
          key={tab.id}
          className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
          onClick={() => onTabChange(tab.id)}
        >
          <span className={styles.tabIcon}>{tab.icon}</span>
          <span className={styles.tabLabel}>{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
