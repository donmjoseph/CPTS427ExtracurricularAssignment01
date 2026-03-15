import { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble.jsx';
import styles from './ChatWindow.module.css';

export default function ChatWindow({ messages, loading, onLoadMore, onDraftComment }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  return (
    <div className={styles.window}>
      <div className={styles.messages}>
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            onLoadMore={(pagination) => onLoadMore(msg.id, pagination)}
            onDraftComment={onDraftComment}
          />
        ))}

        {loading && (
          <div className={styles.typingRow}>
            <div className={styles.typingAvatar}>🏛️</div>
            <div className={styles.typingBubble}>
              <span className={styles.dot} />
              <span className={styles.dot} />
              <span className={styles.dot} />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
