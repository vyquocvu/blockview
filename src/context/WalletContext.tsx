import { BrowserProvider } from "ethers";
import { createContext, useContext, useState, ReactNode } from "react";

interface WalletContextType {
  account: string | null;
  provider: BrowserProvider | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
}

const WalletContext = createContext<WalletContextType>({
  account: null,
  provider: null,
  connectWallet: async () => {},
  disconnectWallet: () => {},
});

export function WalletProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);

  const connectWallet = async () => {
    try {
      const ethProvider: any = (window as any).ethereum || (window as any).okxwallet;
      if (!ethProvider) {
        throw new Error("No wallet provider found");
      }
      const accounts: string[] = await ethProvider.request({ method: "eth_requestAccounts" });
      setProvider(new BrowserProvider(ethProvider));
      setAccount(accounts[0]);
    } catch (err) {
      console.error("Failed to connect wallet:", err);
      throw err;
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setProvider(null);
  };

  return (
    <WalletContext.Provider value={{ account, provider, connectWallet, disconnectWallet }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  return useContext(WalletContext);
}
