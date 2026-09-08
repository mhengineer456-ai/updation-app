import React, { useState, useEffect, useRef } from 'react';

const SplashScreen = ({ onLoadingComplete }) => {
  const [progress, setProgress] = useState(0);
  const onCompleteRef = useRef(onLoadingComplete);
  onCompleteRef.current = onLoadingComplete;

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100;
        const step = prev < 50 ? 14 : prev < 85 ? 10 : 18;
        return Math.min(100, prev + step);
      });
    }, 110);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (progress >= 100) {
      const timer = setTimeout(() => {
        if (onCompleteRef.current) {
          onCompleteRef.current();
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [progress]);

  const getStatusText = () => {
    if (progress < 40) return 'Connecting to operations...';
    if (progress < 80) return 'Loading supervisor lots...';
    return 'Ready';
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Brand Icon SVG */}
        <div style={styles.iconContainer}>
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2L15 8L21 9L17 14L18 20L12 17L6 20L7 14L3 9L9 8L12 2Z"
              fill="#2563EB"
              opacity="0.1"
            />
            <circle cx="12" cy="12" r="9" stroke="#2563EB" strokeWidth="2" />
            <path
              d="M8 12C8 9.79086 9.79086 8 12 8C14.2091 8 16 9.79086 16 12C16 14.2091 14.2091 16 12 16"
              stroke="#0F172A"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle cx="12" cy="12" r="2" fill="#2563EB" />
          </svg>
        </div>

        {/* Title */}
        <div style={styles.brandBlock}>
          <span style={styles.tagline}>MANUFACTURING OPERATIONS</span>
          <h1 style={styles.title}>KajButton</h1>
          <p style={styles.subtitle}>Daily Supervisor Portal</p>
        </div>

        {/* Progress */}
        <div style={styles.progressBlock}>
          <div style={styles.progressInfo}>
            <span style={styles.statusLabel}>{getStatusText()}</span>
            <span style={styles.percentNumber}>{progress}%</span>
          </div>
          <div style={styles.progressBarTrack}>
            <div style={{ ...styles.progressBarFill, width: `${progress}%` }} />
          </div>
        </div>

        {/* Subtle footer */}
        <div style={styles.footer}>
          <span style={styles.versionBadge}>v2.4 Mobile</span>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    position: 'fixed',
    inset: 0,
    backgroundColor: '#f0f6ff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    zIndex: 9999,
    fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif",
  },
  card: {
    width: '100%',
    maxWidth: '340px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    animation: 'fadeIn 0.35s ease',
  },
  iconContainer: {
    width: '68px',
    height: '68px',
    borderRadius: '20px',
    backgroundColor: '#ffffff',
    border: '1.5px solid #bfdbfe',
    boxShadow: '0 8px 24px -4px rgba(37, 99, 235, 0.12), 0 2px 6px rgba(37, 99, 235, 0.06)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '22px',
  },
  brandBlock: {
    marginBottom: '32px',
  },
  tagline: {
    fontSize: '11px',
    fontWeight: '800',
    color: '#2563eb',
    letterSpacing: '1px',
    display: 'block',
    marginBottom: '6px',
  },
  title: {
    fontSize: '28px',
    fontWeight: '800',
    color: '#0f274a',
    margin: 0,
    letterSpacing: '-0.5px',
  },
  subtitle: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#64748b',
    marginTop: '4px',
  },
  progressBlock: {
    width: '100%',
    marginBottom: '28px',
  },
  progressInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '12px',
    fontWeight: '600',
    marginBottom: '8px',
  },
  statusLabel: {
    color: '#64748b',
  },
  percentNumber: {
    color: '#2563EB',
    fontWeight: '700',
    fontVariantNumeric: 'tabular-nums',
  },
  progressBarTrack: {
    width: '100%',
    height: '5px',
    backgroundColor: '#dbeafe',
    borderRadius: '999px',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#2563EB',
    borderRadius: '999px',
    transition: 'width 0.15s ease',
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
  },
  versionBadge: {
    fontSize: '11px',
    color: '#1d4ed8',
    fontWeight: '700',
    backgroundColor: '#ffffff',
    padding: '4px 12px',
    borderRadius: '20px',
    border: '1px solid #bfdbfe',
    boxShadow: '0 1px 3px rgba(37, 99, 235, 0.08)',
  },
};

export default SplashScreen;