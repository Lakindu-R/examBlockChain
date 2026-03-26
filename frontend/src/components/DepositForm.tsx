import React, { useState, useMemo } from "react";

interface DepositFormProps {
  feeBps: bigint;
  isPaused: boolean;
  loading: boolean;
  error: string | null;
  success: string | null;
  onDeposit: (amount: string) => void;
  onClear: () => void;
}

export default function DepositForm({
  feeBps,
  isPaused,
  loading,
  error,
  success,
  onDeposit,
  onClear,
}: DepositFormProps) {
  const [amount, setAmount] = useState("");

  const preview = useMemo(() => {
    const val = parseFloat(amount);
    if (!amount || isNaN(val) || val <= 0) return null;
    const feeFraction = Number(feeBps) / 10000;
    const fee = val * feeFraction;
    const net = val - fee;
    return {
      fee: fee.toFixed(8),
      net: net.toFixed(8),
    };
  }, [amount, feeBps]);

  const handleSubmit = () => {
    if (!amount || parseFloat(amount) <= 0) return;
    onDeposit(amount);
    setAmount("");
  };

  const isDisabled = isPaused || loading || !amount || parseFloat(amount) <= 0;

  return (
    <div style={styles.card}>
      <h3 style={styles.title}>Deposit ETH</h3>

      <div style={styles.inputRow}>
        <input
          type="number"
          min="0"
          step="0.001"
          placeholder="0.000"
          value={amount}
          onChange={(e) => { setAmount(e.target.value); onClear(); }}
          style={styles.input}
          disabled={isPaused || loading}
        />
        <span style={styles.unit}>ETH</span>
      </div>

      {preview && (
        <div style={styles.preview}>
          <div style={styles.previewRow}>
            <span style={styles.previewLabel}>Fee → Treasury</span>
            <span style={styles.previewFee}>{preview.fee} ETH</span>
          </div>
          <div style={styles.divider} />
          <div style={styles.previewRow}>
            <span style={styles.previewLabel}>Credited to you</span>
            <span style={styles.previewNet}>{preview.net} ETH</span>
          </div>
          <div style={styles.feeNote}>
            {Number(feeBps) / 100}% fee ({feeBps.toString()} bps)
          </div>
        </div>
      )}

      {error && (
        <div style={styles.errorBox}>
          <span style={styles.errorIcon}>✗</span> {error}
        </div>
      )}
      {success && (
        <div style={styles.successBox}>
          <span style={styles.successIcon}>✓</span> {success}
        </div>
      )}

      <button
        style={{ ...styles.button, opacity: isDisabled ? 0.5 : 1, cursor: isDisabled ? "not-allowed" : "pointer" }}
        onClick={handleSubmit}
        disabled={isDisabled}
      >
        {loading ? (
          <span style={styles.spinnerWrap}>
            <span style={styles.spinner} /> Confirming…
          </span>
        ) : isPaused ? (
          "Vault Paused"
        ) : (
          "Deposit"
        )}
      </button>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    background: "rgba(16, 22, 42, 0.7)",
    border: "1px solid rgba(0, 212, 255, 0.12)",
    borderRadius: "16px",
    padding: "28px 24px",
    marginBottom: "16px",
  },
  title: {
    fontFamily: "'Inter', sans-serif",
    fontSize: "16px",
    fontWeight: 600,
    color: "#c8d0e0",
    marginBottom: "20px",
    marginTop: 0,
  },
  inputRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "16px",
  },
  input: {
    flex: 1,
    background: "rgba(8, 14, 28, 0.8)",
    border: "1px solid rgba(0, 212, 255, 0.2)",
    borderRadius: "10px",
    color: "#00D4FF",
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: "18px",
    fontWeight: 500,
    padding: "12px 16px",
    outline: "none",
    transition: "border-color 0.2s",
  },
  unit: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: "14px",
    color: "#5a6480",
    minWidth: "32px",
  },
  preview: {
    background: "rgba(0, 212, 255, 0.04)",
    border: "1px solid rgba(0, 212, 255, 0.1)",
    borderRadius: "10px",
    padding: "14px 16px",
    marginBottom: "16px",
  },
  previewRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "3px 0",
  },
  previewLabel: {
    fontFamily: "'Inter', sans-serif",
    fontSize: "12px",
    color: "#5a6480",
  },
  previewFee: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: "13px",
    color: "#ff8c57",
  },
  previewNet: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: "13px",
    color: "#00D4FF",
    fontWeight: 500,
  },
  divider: {
    height: "1px",
    background: "rgba(0, 212, 255, 0.08)",
    margin: "8px 0",
  },
  feeNote: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: "11px",
    color: "#3a4460",
    marginTop: "8px",
    textAlign: "right" as const,
  },
  errorBox: {
    background: "rgba(200, 50, 50, 0.1)",
    border: "1px solid rgba(200, 50, 50, 0.3)",
    borderRadius: "8px",
    color: "#ff7070",
    fontFamily: "'Inter', sans-serif",
    fontSize: "13px",
    padding: "10px 14px",
    marginBottom: "14px",
  },
  errorIcon: { marginRight: "6px" },
  successBox: {
    background: "rgba(0, 200, 120, 0.08)",
    border: "1px solid rgba(0, 200, 120, 0.25)",
    borderRadius: "8px",
    color: "#00c878",
    fontFamily: "'Inter', sans-serif",
    fontSize: "13px",
    padding: "10px 14px",
    marginBottom: "14px",
  },
  successIcon: { marginRight: "6px" },
  button: {
    width: "100%",
    background: "linear-gradient(135deg, #00D4FF 0%, #0099cc 100%)",
    border: "none",
    borderRadius: "10px",
    color: "#0a0e1a",
    fontFamily: "'Inter', sans-serif",
    fontWeight: 700,
    fontSize: "15px",
    padding: "14px",
    transition: "transform 0.15s ease, opacity 0.15s ease",
    boxShadow: "0 0 20px rgba(0, 212, 255, 0.2)",
  },
  spinnerWrap: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },
  spinner: {
    display: "inline-block",
    width: "14px",
    height: "14px",
    border: "2px solid rgba(10, 14, 26, 0.3)",
    borderTopColor: "#0a0e1a",
    borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
  },
};
