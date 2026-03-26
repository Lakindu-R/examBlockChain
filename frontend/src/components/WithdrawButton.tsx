import React from "react";

interface WithdrawButtonProps {
  userBalance: string;
  isPaused: boolean;
  loading: boolean;
  error: string | null;
  success: string | null;
  onWithdraw: () => void;
  onClear: () => void;
}

export default function WithdrawButton({
  userBalance,
  isPaused,
  loading,
  error,
  success,
  onWithdraw,
  onClear,
}: WithdrawButtonProps) {
  const hasBalance = parseFloat(userBalance) > 0;
  const isDisabled = isPaused || loading || !hasBalance;

  return (
    <div style={styles.card}>
      <h3 style={styles.title}>Withdraw ETH</h3>

      <div style={styles.balanceRow}>
        <span style={styles.balanceLabel}>Available to withdraw</span>
        <span style={styles.balanceValue}>
          {parseFloat(userBalance).toFixed(8)} ETH
        </span>
      </div>

      {!hasBalance && !isPaused && (
        <p style={styles.hint}>Deposit ETH first to build a withdrawable balance.</p>
      )}

      {error && (
        <div style={styles.errorBox}>
          <span>✗</span> {error}
        </div>
      )}
      {success && (
        <div style={styles.successBox}>
          <span>✓</span> {success}
        </div>
      )}

      <button
        style={{
          ...styles.button,
          ...(isDisabled ? styles.buttonDisabled : {}),
        }}
        onClick={() => { onClear(); onWithdraw(); }}
        disabled={isDisabled}
      >
        {loading ? (
          <span style={styles.spinnerWrap}>
            <span style={styles.spinner} /> Confirming…
          </span>
        ) : isPaused ? (
          "Vault Paused"
        ) : !hasBalance ? (
          "No Balance"
        ) : (
          `Withdraw ${parseFloat(userBalance).toFixed(6)} ETH`
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
  balanceRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "rgba(0, 212, 255, 0.04)",
    border: "1px solid rgba(0, 212, 255, 0.08)",
    borderRadius: "10px",
    padding: "14px 16px",
    marginBottom: "16px",
  },
  balanceLabel: {
    fontFamily: "'Inter', sans-serif",
    fontSize: "12px",
    color: "#5a6480",
  },
  balanceValue: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: "15px",
    fontWeight: 500,
    color: "#00D4FF",
  },
  hint: {
    fontFamily: "'Inter', sans-serif",
    fontSize: "12px",
    color: "#3a4460",
    marginBottom: "14px",
    marginTop: 0,
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
    display: "flex",
    gap: "6px",
  },
  successBox: {
    background: "rgba(0, 200, 120, 0.08)",
    border: "1px solid rgba(0, 200, 120, 0.25)",
    borderRadius: "8px",
    color: "#00c878",
    fontFamily: "'Inter', sans-serif",
    fontSize: "13px",
    padding: "10px 14px",
    marginBottom: "14px",
    display: "flex",
    gap: "6px",
  },
  button: {
    width: "100%",
    background: "linear-gradient(135deg, rgba(0,212,255,0.15) 0%, rgba(0,153,204,0.15) 100%)",
    border: "1px solid rgba(0, 212, 255, 0.4)",
    borderRadius: "10px",
    color: "#00D4FF",
    cursor: "pointer",
    fontFamily: "'Inter', sans-serif",
    fontWeight: 600,
    fontSize: "15px",
    padding: "14px",
    transition: "all 0.15s ease",
  },
  buttonDisabled: {
    opacity: 0.4,
    cursor: "not-allowed",
    borderColor: "rgba(0, 212, 255, 0.1)",
    color: "#3a4460",
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
    border: "2px solid rgba(0, 212, 255, 0.2)",
    borderTopColor: "#00D4FF",
    borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
  },
};
