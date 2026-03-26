import { useState, useCallback, useEffect } from "react";
import { BrowserProvider, Contract, parseEther, formatEther } from "ethers";
import FundFlowABI from "../abi/FundFlow.json";

// Replace with your deployed contract address after running deploy
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || "0xd002E90a7893857f2A6AA3b496A7181a6bd81dac";
const SEPOLIA_CHAIN_ID = 11155111;

export interface FundFlowState {
  account: string | null;
  chainId: number | null;
  userBalance: string;       // formatted ETH
  contractBalance: string;   // formatted ETH
  feeBps: bigint;
  treasury: string;
  isPaused: boolean;
  isOwner: boolean;
  loading: boolean;
  error: string | null;
  success: string | null;
}

export interface FundFlowHook extends FundFlowState {
  connectWallet: () => Promise<void>;
  deposit: (amountEth: string) => Promise<void>;
  withdraw: () => Promise<void>;
  setTreasury: (addr: string) => Promise<void>;
  setFee: (bps: number) => Promise<void>;
  pause: () => Promise<void>;
  unpause: () => Promise<void>;
  refreshState: () => Promise<void>;
  clearMessages: () => void;
}

export function useFundFlow(): FundFlowHook {
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [userBalance, setUserBalance] = useState<string>("0");
  const [contractBalance, setContractBalance] = useState<string>("0");
  const [feeBps, setFeeBps] = useState<bigint>(0n);
  const [treasury, setTreasuryState] = useState<string>("");
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const getProvider = useCallback(() => {
    if (!window.ethereum) throw new Error("No wallet detected. Install MetaMask.");
    return new BrowserProvider(window.ethereum as ConstructorParameters<typeof BrowserProvider>[0]);
  }, []);

  const getContract = useCallback(async (withSigner = false) => {
    const provider = getProvider();
    if (withSigner) {
      const signer = await provider.getSigner();
      return new Contract(CONTRACT_ADDRESS, FundFlowABI, signer);
    }
    return new Contract(CONTRACT_ADDRESS, FundFlowABI, provider);
  }, [getProvider]);

  const refreshState = useCallback(async () => {
    if (!account || !window.ethereum) return;
    try {
      const contract = await getContract();
      const provider = getProvider();

      const [bal, cBal, fee, treas, paused, owner] = await Promise.all([
        contract.balances(account),
        provider.getBalance(CONTRACT_ADDRESS),
        contract.feeBasisPoints(),
        contract.treasury(),
        contract.paused(),
        contract.owner(),
      ]);

      setUserBalance(formatEther(bal as bigint));
      setContractBalance(formatEther(cBal));
      setFeeBps(fee as bigint);
      setTreasuryState(treas as string);
      setIsPaused(paused as boolean);
      setIsOwner((owner as string).toLowerCase() === account.toLowerCase());
    } catch (err) {
      console.error("Error refreshing state:", err);
    }
  }, [account, getContract, getProvider]);

  const connectWallet = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const provider = getProvider();
      const accounts = await provider.send("eth_requestAccounts", []);
      const network = await provider.getNetwork();
      setAccount((accounts as string[])[0]);
      setChainId(Number(network.chainId));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to connect wallet");
    } finally {
      setLoading(false);
    }
  }, [getProvider]);

  const deposit = useCallback(async (amountEth: string) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const contract = await getContract(true);
      const tx = await contract.deposit({ value: parseEther(amountEth) });
      await tx.wait();
      setSuccess(`Deposited ${amountEth} ETH successfully!`);
      await refreshState();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Deposit failed");
    } finally {
      setLoading(false);
    }
  }, [getContract, refreshState]);

  const withdraw = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const contract = await getContract(true);
      const rawBalance = await contract.balances(account);
      if ((rawBalance as bigint) === 0n) throw new Error("No balance to withdraw");
      const tx = await contract.withdraw(rawBalance);
      await tx.wait();
      setSuccess(`Withdrew ${formatEther(rawBalance as bigint)} ETH successfully!`);
      await refreshState();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Withdrawal failed");
    } finally {
      setLoading(false);
    }
  }, [account, getContract, refreshState]);

  const setTreasury = useCallback(async (addr: string) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const contract = await getContract(true);
      const tx = await contract.setTreasury(addr);
      await tx.wait();
      setSuccess(`Treasury updated to ${addr}`);
      await refreshState();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update treasury");
    } finally {
      setLoading(false);
    }
  }, [getContract, refreshState]);

  const setFee = useCallback(async (bps: number) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const contract = await getContract(true);
      const tx = await contract.setFee(bps);
      await tx.wait();
      setSuccess(`Fee updated to ${bps} bps (${bps / 100}%)`);
      await refreshState();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update fee");
    } finally {
      setLoading(false);
    }
  }, [getContract, refreshState]);

  const pause = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const contract = await getContract(true);
      const tx = await contract.pause();
      await tx.wait();
      setSuccess("Vault paused successfully");
      await refreshState();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to pause");
    } finally {
      setLoading(false);
    }
  }, [getContract, refreshState]);

  const unpause = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const contract = await getContract(true);
      const tx = await contract.unpause();
      await tx.wait();
      setSuccess("Vault unpaused successfully");
      await refreshState();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to unpause");
    } finally {
      setLoading(false);
    }
  }, [getContract, refreshState]);

  const clearMessages = useCallback(() => {
    setError(null);
    setSuccess(null);
  }, []);

  // Listen for account/chain changes
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts: unknown) => {
      const accs = accounts as string[];
      setAccount(accs.length > 0 ? accs[0] : null);
    };

    const handleChainChanged = (hexChainId: unknown) => {
      setChainId(parseInt(hexChainId as string, 16));
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);

    // Auto-detect if already connected
    (async () => {
      try {
        const provider = new BrowserProvider(window.ethereum as ConstructorParameters<typeof BrowserProvider>[0]);
        const accounts = await provider.send("eth_accounts", []);
        if ((accounts as string[]).length > 0) {
          setAccount((accounts as string[])[0]);
          const network = await provider.getNetwork();
          setChainId(Number(network.chainId));
        }
      } catch {
        // Not connected yet
      }
    })();

    return () => {
      window.ethereum?.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum?.removeListener("chainChanged", handleChainChanged);
    };
  }, []);

  // Refresh contract state whenever account or chainId changes
  useEffect(() => {
    if (account && chainId === SEPOLIA_CHAIN_ID) {
      refreshState();
    }
  }, [account, chainId, refreshState]);

  return {
    account,
    chainId,
    userBalance,
    contractBalance,
    feeBps,
    treasury,
    isPaused,
    isOwner,
    loading,
    error,
    success,
    connectWallet,
    deposit,
    withdraw,
    setTreasury,
    setFee,
    pause,
    unpause,
    refreshState,
    clearMessages,
  };
}
