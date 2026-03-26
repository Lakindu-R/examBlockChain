import React from "react";
import { useFundFlow } from "./hooks/useFundFlow";
import ConnectWallet from "./components/ConnectWallet";
import NetworkGuard from "./components/NetworkGuard";
import PauseBanner from "./components/PauseBanner";
import VaultStats from "./components/VaultStats";
import DepositForm from "./components/DepositForm";
import WithdrawButton from "./components/WithdrawButton";
import OwnerPanel from "./components/OwnerPanel";

export default function App() {
  const ff = useFundFlow();

  return (
    <>
      {/* Global styles injected via style tag */}
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #root { height: 100%; }
        body {
          background: #0d1117;
          color: #cdd5e0;
          font-family: 'Inter', sans-serif;
          -webkit-font-smoothing: antialiased;
        }
        /* Grid texture overlay */
        body::before {
          content: '';
          position: fixed;
          inset: 0;
          background-image:
            linear-gradient(rgba(0,229,160,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,229,160,0.025) 1px, transparent 1px);
          background-size: 40px 40px;
          pointer-events: none;
          z-index: 0;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { opacity: 0.3; }
        input:focus {
          border-color: rgba(0,229,160,0.5) !important;
          box-shadow: 0 0 0 3px rgba(0,229,160,0.08);
        }
        button:hover:not(:disabled) {
          transform: translateY(-1px);
        }
      `}</style>

      <NetworkGuard chainId={ff.chainId} account={ff.account}>
        <div style={styles.root}>
          {/* Pause banner */}
          <PauseBanner isPaused={ff.isPaused} />

          {/* Header */}
          <header style={styles.header}>
            <div style={styles.brand}>
              <span style={styles.brandMark}>◈</span>
              <span style={styles.brandName}>FundFlow</span>
              <span style={styles.brandTag}>Sepolia</span>
            </div>
            <ConnectWallet
              account={ff.account}
              loading={ff.loading}
              onConnect={ff.connectWallet}
            />
          </header>

          {/* Main content */}
          <main style={styles.main}>
            <div style={styles.container}>

              {/* Hero text */}
              <div style={styles.hero}>
                <h1 style={styles.heroTitle}>Decentralized ETH Vault</h1>
                <p style={styles.heroSub}>
                  Deposit ETH, earn your net credit, withdraw anytime.
                  A configurable fee is routed to the treasury on every deposit.
                </p>
              </div>

              {/* Stats */}
              <VaultStats
                userBalance={ff.userBalance}
                contractBalance={ff.contractBalance}
                feeBps={ff.feeBps}
                treasury={ff.treasury}
                account={ff.account}
              />

              {/* Actions grid */}
              {ff.account && (
                <div style={styles.actionsGrid}>
                  <DepositForm
                    feeBps={ff.feeBps}
                    isPaused={ff.isPaused}
                    loading={ff.loading}
                    error={ff.error}
                    success={ff.success}
                    onDeposit={ff.deposit}
                    onClear={ff.clearMessages}
                  />
                  <WithdrawButton
                    userBalance={ff.userBalance}
                    isPaused={ff.isPaused}
                    loading={ff.loading}
                    error={ff.error}
                    success={ff.success}
                    onWithdraw={ff.withdraw}
                    onClear={ff.clearMessages}
                  />
                </div>
              )}

              {/* Owner panel */}
              {ff.isOwner && (
                <OwnerPanel
                  isPaused={ff.isPaused}
                  feeBps={ff.feeBps}
                  treasury={ff.treasury}
                  loading={ff.loading}
                  error={ff.error}
                  success={ff.success}
                  onSetTreasury={ff.setTreasury}
                  onSetFee={ff.setFee}
                  onPause={ff.pause}
                  onUnpause={ff.unpause}
                  onClear={ff.clearMessages}
                />
              )}

              {/* Connect prompt */}
              {!ff.account && (
                <div style={styles.connectPrompt}>
                  <p style={styles.connectText}>
                    Connect your wallet to deposit, withdraw, and view your balance.
                  </p>
                  <button style={styles.connectBtn} onClick={ff.connectWallet}>
                    Connect Wallet
                  </button>
                </div>
              )}
            </div>
          </main>

          {/* Footer */}
          <footer style={styles.footer}>
            <span style={styles.footerText}>
              FundFlow · Sepolia Testnet · Open Source
            </span>
          </footer>
        </div>
      </NetworkGuard>
    </>
  );
}

const styles: Record<string, React.CSSProperties> = {
  root: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    position: "relative",
    zIndex: 1,
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "20px 32px",
    borderBottom: "1px solid rgba(0, 229, 160, 0.08)",
    background: "rgba(13, 17, 23, 0.85)",
    backdropFilter: "blur(16px)",
    position: "sticky",
    top: 0,
    zIndex: 50,
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  brandMark: {
    color: "#00E5A0",
    fontSize: "22px",
    textShadow: "0 0 12px rgba(0, 229, 160, 0.6)",
  },
  brandName: {
    fontFamily: "'Inter', sans-serif",
    fontSize: "18px",
    fontWeight: 700,
    color: "#e8edf5",
    letterSpacing: "-0.3px",
  },
  brandTag: {
    background: "rgba(0, 229, 160, 0.08)",
    border: "1px solid rgba(0, 229, 160, 0.2)",
    borderRadius: "6px",
    color: "#00E5A0",
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: "10px",
    letterSpacing: "1px",
    padding: "3px 7px",
  },
  main: {
    flex: 1,
    padding: "40px 20px",
  },
  container: {
    maxWidth: "760px",
    margin: "0 auto",
  },
  hero: {
    marginBottom: "32px",
  },
  heroTitle: {
    fontFamily: "'Inter', sans-serif",
    fontSize: "32px",
    fontWeight: 700,
    color: "#edf2f7",
    letterSpacing: "-0.5px",
    marginBottom: "10px",
  },
  heroSub: {
    fontFamily: "'Inter', sans-serif",
    fontSize: "15px",
    color: "#5a6480",
    lineHeight: 1.7,
    maxWidth: "560px",
  },
  actionsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "16px",
    marginBottom: "16px",
  },
  connectPrompt: {
    textAlign: "center" as const,
    padding: "56px 24px",
    background: "rgba(18, 24, 32, 0.5)",
    border: "1px dashed rgba(0, 229, 160, 0.15)",
    borderRadius: "16px",
  },
  connectText: {
    fontFamily: "'Inter', sans-serif",
    fontSize: "15px",
    color: "#5a6480",
    marginBottom: "24px",
  },
  connectBtn: {
    background: "linear-gradient(135deg, #00E5A0 0%, #00b377 100%)",
    border: "none",
    borderRadius: "10px",
    color: "#0a1a12",
    cursor: "pointer",
    fontFamily: "'Inter', sans-serif",
    fontWeight: 700,
    fontSize: "15px",
    padding: "14px 32px",
    boxShadow: "0 0 24px rgba(0, 229, 160, 0.3)",
  },
  footer: {
    padding: "20px 32px",
    borderTop: "1px solid rgba(0, 229, 160, 0.06)",
    textAlign: "center" as const,
  },
  footerText: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: "11px",
    color: "#2a3a30",
    letterSpacing: "0.5px",
  },
};
