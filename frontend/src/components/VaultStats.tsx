import React from "react";

interface VaultStatsProps {
  userBalance: string;
  contractBalance: string;
  feeBps: bigint;
  treasury: string;
  account: string | null;
}

export default function VaultStats({
  userBalance,
  contractBalance,
  feeBps,
  treasury,
  account,
}: VaultStatsProps) {
  const feePercent = account ? `${(Number(feeBps) / 100).toFixed(2)}%` : "—";
  const truncate = (addr: string) =>
    addr ? `${addr.slice(0, 8)}…${addr.slice(-6)}` : "—";

  const stats = [
    {
      label: "Your Balance",
      value: account ? `${parseFloat(userBalance).toFixed(6)} ETH` : "—",
      accent: true,
    },
    {
      label: "Vault TVL",
      value: account ? `${parseFloat(contractBalance).toFixed(6)} ETH` : "—",
      accent: false,
    },
    {
      label: "Deposit Fee",
      value: feePercent,
      accent: false,
    },
    {
      label: "Treasury",
      value: truncate(treasury),
      accent: false,
      mono: true,
      small: true,
    },
  ];

  return (
    <div style={styles.grid}>
      {stats.map((s) => (
        <div key={s.label} style={styles.card}>
          <div style={styles.label}>{s.label}</div>
          <div
            style={{
              ...styles.value,
              ...(s.accent ? styles.accentValue : {}),
              ...(s.small ? styles.smallValue : {}),
              fontFamily: s.mono ? "'IBM Plex Mono', monospace" : "'IBM Plex Mono', monospace",
            }}
          >
            {s.value}
          </div>
        </div>
      ))}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "16px",
    marginBottom: "28px",
  },
  card: {
    background: "rgba(16, 22, 42, 0.7)",
    border: "1px solid rgba(0, 212, 255, 0.1)",
    borderRadius: "14px",
    padding: "22px 20px",
    transition: "border-color 0.2s",
  },
  label: {
    fontFamily: "'Inter', sans-serif",
    fontSize: "11px",
    fontWeight: 500,
    color: "#5a6480",
    textTransform: "uppercase" as const,
    letterSpacing: "1px",
    marginBottom: "10px",
  },
  value: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: "20px",
    fontWeight: 500,
    color: "#c8d0e0",
    letterSpacing: "0.5px",
  },
  accentValue: {
    color: "#00D4FF",
    textShadow: "0 0 12px rgba(0, 212, 255, 0.3)",
  },
  smallValue: {
    fontSize: "13px",
    color: "#7a8499",
  },
};
