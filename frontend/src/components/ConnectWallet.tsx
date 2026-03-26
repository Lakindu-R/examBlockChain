import React from "react";

interface ConnectWalletProps {
  account: string | null;
  loading: boolean;
  onConnect: () => void;
}

export default function ConnectWallet({ account, loading, onConnect }: ConnectWalletProps) {
  const truncate = (addr: string) =>
    `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  return (
    <div style={styles.wrapper}>
      {account ? (
        <div style={styles.connected}>
          <span style={styles.dot} />
          <span style={styles.address}>{truncate(account)}</span>
        </div>
      ) : (
        <button
          style={{ ...styles.button, opacity: loading ? 0.6 : 1 }}
          onClick={onConnect}
          disabled={loading}
        >
          {loading ? "Connecting…" : "Connect Wallet"}
        </button>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    display: "flex",
    alignItems: "center",
  },
  connected: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "rgba(0, 229, 160, 0.08)",
    border: "1px solid rgba(0, 229, 160, 0.25)",
    borderRadius: "8px",
    padding: "8px 14px",
  },
  dot: {
    display: "inline-block",
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "#00E5A0",
    boxShadow: "0 0 6px #00E5A0",
  },
  address: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: "13px",
    color: "#00E5A0",
    letterSpacing: "0.5px",
  },
  button: {
    background: "linear-gradient(135deg, #00E5A0 0%, #00b377 100%)",
    border: "none",
    borderRadius: "8px",
    color: "#0a1a12",
    cursor: "pointer",
    fontFamily: "'Inter', sans-serif",
    fontWeight: 600,
    fontSize: "14px",
    padding: "10px 20px",
    transition: "transform 0.15s ease, box-shadow 0.15s ease",
    boxShadow: "0 0 16px rgba(0, 229, 160, 0.3)",
  },
};
