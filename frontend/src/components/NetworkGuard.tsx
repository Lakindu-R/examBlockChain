import React from "react";

const SEPOLIA_CHAIN_ID = 11155111;
const SEPOLIA_HEX = "0xaa36a7";

interface NetworkGuardProps {
  chainId: number | null;
  account: string | null;
  children: React.ReactNode;
}

export default function NetworkGuard({ chainId, account, children }: NetworkGuardProps) {
  const isWrongNetwork = account && chainId !== SEPOLIA_CHAIN_ID;
  const isNotConnected = !account;

  const switchNetwork = async () => {
    if (!window.ethereum) return;
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: SEPOLIA_HEX }],
      });
    } catch (err: unknown) {
      // Chain not added — try to add it
      if ((err as { code?: number }).code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: SEPOLIA_HEX,
              chainName: "Sepolia Test Network",
              nativeCurrency: { name: "SepoliaETH", symbol: "ETH", decimals: 18 },
              rpcUrls: ["https://rpc.sepolia.org"],
              blockExplorerUrls: ["https://sepolia.etherscan.io"],
            },
          ],
        });
      }
    }
  };

  if (isNotConnected || isWrongNetwork) {
    return (
      <>
        {children}
        <div style={styles.overlay}>
          <div style={styles.card}>
            <div style={styles.iconWrap}>
              <span style={styles.icon}>⛓</span>
            </div>
            {isWrongNetwork ? (
              <>
                <h2 style={styles.title}>Wrong Chain Detected</h2>
                <p style={styles.subtitle}>
                  FundFlow lives on Sepolia.<br />
                  Switch networks or go home.
                </p>
                <p style={styles.chainInfo}>
                  Connected to chain <span style={styles.highlight}>#{chainId}</span>
                  {" "}— need <span style={styles.highlight}>#11155111</span>
                </p>
                <button style={styles.button} onClick={switchNetwork}>
                  Switch to Sepolia
                </button>
              </>
            ) : (
              <>
                <h2 style={styles.title}>Wallet Not Connected</h2>
                <p style={styles.subtitle}>
                  Connect your wallet to interact with the vault.<br />
                  FundFlow requires MetaMask or a compatible Web3 wallet.
                </p>
                <p style={styles.chainInfo}>
                  Make sure you're on <span style={styles.highlight}>Sepolia Testnet</span>
                </p>
              </>
            )}
          </div>
        </div>
      </>
    );
  }

  return <>{children}</>;
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(8, 12, 26, 0.92)",
    backdropFilter: "blur(12px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  card: {
    background: "rgba(18, 24, 32, 0.95)",
    border: "1px solid rgba(0, 229, 160, 0.2)",
    borderRadius: "20px",
    padding: "56px 48px",
    textAlign: "center",
    maxWidth: "440px",
    width: "90%",
    boxShadow: "0 0 60px rgba(0, 229, 160, 0.06)",
  },
  iconWrap: {
    marginBottom: "24px",
  },
  icon: {
    fontSize: "48px",
    filter: "grayscale(0.3)",
  },
  title: {
    fontFamily: "'Inter', sans-serif",
    fontSize: "26px",
    fontWeight: 700,
    color: "#e8edf5",
    marginBottom: "12px",
  },
  subtitle: {
    fontFamily: "'Inter', sans-serif",
    fontSize: "15px",
    color: "#7a8499",
    lineHeight: 1.7,
    marginBottom: "20px",
  },
  chainInfo: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: "12px",
    color: "#556",
    marginBottom: "32px",
  },
  highlight: {
    color: "#00E5A0",
  },
  button: {
    background: "linear-gradient(135deg, #00E5A0 0%, #00b377 100%)",
    border: "none",
    borderRadius: "10px",
    color: "#0a1a12",
    cursor: "pointer",
    fontFamily: "'Inter', sans-serif",
    fontWeight: 700,
    fontSize: "15px",
    padding: "14px 32px",
    transition: "transform 0.15s ease",
    boxShadow: "0 0 24px rgba(0, 229, 160, 0.3)",
    width: "100%",
  },
};
