import React, { useState } from "react";

interface OwnerPanelProps {
  isPaused: boolean;
  feeBps: bigint;
  treasury: string;
  loading: boolean;
  error: string | null;
  success: string | null;
  onSetTreasury: (addr: string) => void;
  onSetFee: (bps: number) => void;
  onPause: () => void;
  onUnpause: () => void;
  onClear: () => void;
}

export default function OwnerPanel({
  isPaused,
  feeBps,
  treasury,
  loading,
  error,
  success,
  onSetTreasury,
  onSetFee,
  onPause,
  onUnpause,
  onClear,
}: OwnerPanelProps) {
  const [newTreasury, setNewTreasury] = useState("");
  const [newFee, setNewFee] = useState("");

  const handleTreasuryUpdate = () => {
    if (!newTreasury) return;
    onClear();
    onSetTreasury(newTreasury);
    setNewTreasury("");
  };

  const handleFeeUpdate = () => {
    const bps = parseInt(newFee, 10);
    if (isNaN(bps) || bps < 0 || bps > 1000) return;
    onClear();
    onSetFee(bps);
    setNewFee("");
  };

  const feePreview = newFee ? `${(parseInt(newFee, 10) / 100).toFixed(2)}%` : null;

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <span style={styles.badge}>OWNER</span>
        <h3 style={styles.title}>Admin Panel</h3>
      </div>

      {/* Current settings */}
      <div style={styles.currentRow}>
        <span style={styles.currentLabel}>Current Treasury</span>
        <span style={styles.currentValue}>{treasury ? `${treasury.slice(0, 10)}…${treasury.slice(-8)}` : "—"}</span>
      </div>
      <div style={styles.currentRow}>
        <span style={styles.currentLabel}>Current Fee</span>
        <span style={styles.currentValue}>{Number(feeBps) / 100}% ({feeBps.toString()} bps)</span>
      </div>

      <div style={styles.divider} />

      {/* Update treasury */}
      <div style={styles.section}>
        <label style={styles.label}>New Treasury Address</label>
        <div style={styles.inputRow}>
          <input
            type="text"
            placeholder="0x…"
            value={newTreasury}
            onChange={(e) => setNewTreasury(e.target.value)}
            style={styles.input}
            disabled={loading}
          />
          <button
            style={{ ...styles.actionBtn, opacity: (!newTreasury || loading) ? 0.5 : 1 }}
            onClick={handleTreasuryUpdate}
            disabled={!newTreasury || loading}
          >
            Update Treasury
          </button>
        </div>
      </div>

      {/* Update fee */}
      <div style={styles.section}>
        <label style={styles.label}>
          New Fee (basis points, max 1000)
          {feePreview && <span style={styles.feeHint}> → {feePreview}</span>}
        </label>
        <div style={styles.inputRow}>
          <input
            type="number"
            min="0"
            max="1000"
            placeholder="0–1000"
            value={newFee}
            onChange={(e) => setNewFee(e.target.value)}
            style={{ ...styles.input, maxWidth: "160px" }}
            disabled={loading}
          />
          <button
            style={{ ...styles.actionBtn, opacity: (!newFee || loading) ? 0.5 : 1 }}
            onClick={handleFeeUpdate}
            disabled={!newFee || loading}
          >
            Update Fee
          </button>
        </div>
      </div>

      <div style={styles.divider} />

      {/* Pause / Unpause */}
      <div style={styles.section}>
        <label style={styles.label}>Vault State</label>
        <button
          style={{
            ...styles.pauseBtn,
            ...(isPaused ? styles.unpauseBtn : styles.pauseBtnActive),
            opacity: loading ? 0.5 : 1,
          }}
          onClick={() => { onClear(); isPaused ? onUnpause() : onPause(); }}
          disabled={loading}
        >
          {loading ? "Processing…" : isPaused ? "⟳ Unpause Vault" : "⏸ Pause Vault"}
        </button>
      </div>

      {error && (
        <div style={styles.errorBox}>✗ {error}</div>
      )}
      {success && (
        <div style={styles.successBox}>✓ {success}</div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    background: "rgba(20, 18, 14, 0.75)",
    border: "1px solid rgba(245, 158, 11, 0.2)",
    borderRadius: "16px",
    padding: "28px 24px",
    marginBottom: "16px",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "20px",
  },
  badge: {
    background: "rgba(245, 158, 11, 0.12)",
    border: "1px solid rgba(245, 158, 11, 0.4)",
    borderRadius: "6px",
    color: "#f59e0b",
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: "10px",
    fontWeight: 600,
    letterSpacing: "1.5px",
    padding: "3px 8px",
  },
  title: {
    fontFamily: "'Inter', sans-serif",
    fontSize: "16px",
    fontWeight: 600,
    color: "#c8d0e0",
    margin: 0,
  },
  currentRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "6px 0",
  },
  currentLabel: {
    fontFamily: "'Inter', sans-serif",
    fontSize: "12px",
    color: "#5a6480",
  },
  currentValue: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: "12px",
    color: "#8090b0",
  },
  divider: {
    height: "1px",
    background: "rgba(245, 158, 11, 0.1)",
    margin: "18px 0",
  },
  section: {
    marginBottom: "18px",
  },
  label: {
    display: "block",
    fontFamily: "'Inter', sans-serif",
    fontSize: "11px",
    color: "#5a6480",
    letterSpacing: "0.8px",
    textTransform: "uppercase" as const,
    marginBottom: "8px",
  },
  feeHint: {
    color: "#f59e0b",
    textTransform: "none" as const,
    letterSpacing: 0,
  },
  inputRow: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap" as const,
  },
  input: {
    flex: 1,
    minWidth: "160px",
    background: "rgba(10, 16, 12, 0.8)",
    border: "1px solid rgba(245, 158, 11, 0.2)",
    borderRadius: "8px",
    color: "#cdd5e0",
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: "13px",
    padding: "10px 14px",
    outline: "none",
  },
  actionBtn: {
    background: "rgba(245, 158, 11, 0.12)",
    border: "1px solid rgba(245, 158, 11, 0.35)",
    borderRadius: "8px",
    color: "#f59e0b",
    cursor: "pointer",
    fontFamily: "'Inter', sans-serif",
    fontWeight: 600,
    fontSize: "13px",
    padding: "10px 18px",
    whiteSpace: "nowrap" as const,
    transition: "opacity 0.15s",
  },
  pauseBtn: {
    width: "100%",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontFamily: "'Inter', sans-serif",
    fontWeight: 600,
    fontSize: "14px",
    padding: "12px",
    transition: "opacity 0.15s",
  },
  pauseBtnActive: {
    background: "rgba(200, 50, 50, 0.15)",
    border: "1px solid rgba(200, 50, 50, 0.35)",
    color: "#ff6060",
  },
  unpauseBtn: {
    background: "rgba(0, 200, 120, 0.1)",
    border: "1px solid rgba(0, 200, 120, 0.3)",
    color: "#00c878",
  },
  errorBox: {
    background: "rgba(200, 50, 50, 0.1)",
    border: "1px solid rgba(200, 50, 50, 0.3)",
    borderRadius: "8px",
    color: "#ff7070",
    fontFamily: "'Inter', sans-serif",
    fontSize: "13px",
    padding: "10px 14px",
    marginTop: "12px",
  },
  successBox: {
    background: "rgba(0, 200, 120, 0.08)",
    border: "1px solid rgba(0, 200, 120, 0.25)",
    borderRadius: "8px",
    color: "#00c878",
    fontFamily: "'Inter', sans-serif",
    fontSize: "13px",
    padding: "10px 14px",
    marginTop: "12px",
  },
};
