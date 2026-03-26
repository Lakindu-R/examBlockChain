import React from "react";

interface PauseBannerProps {
  isPaused: boolean;
}

export default function PauseBanner({ isPaused }: PauseBannerProps) {
  if (!isPaused) return null;

  return (
    <div style={styles.banner}>
      <span style={styles.icon}>⚠</span>
      <span style={styles.text}>
        VAULT PAUSED — All deposits and withdrawals are currently disabled by the owner.
      </span>
      <span style={styles.icon}>⚠</span>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  banner: {
    position: "sticky",
    top: 0,
    zIndex: 100,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
    padding: "14px 24px",
    background: "linear-gradient(90deg, #7b1113 0%, #b5451b 50%, #7b1113 100%)",
    backgroundSize: "200% 100%",
    animation: "shimmer 3s ease infinite",
    borderBottom: "1px solid rgba(255, 80, 60, 0.4)",
    boxShadow: "0 2px 20px rgba(200, 50, 30, 0.3)",
  },
  icon: {
    fontSize: "16px",
    color: "#ffd166",
  },
  text: {
    fontFamily: "'Inter', sans-serif",
    fontWeight: 600,
    fontSize: "13px",
    color: "#ffe0d0",
    letterSpacing: "0.6px",
    textTransform: "uppercase" as const,
  },
};
