import { createContext, useContext, useState, ReactNode } from 'react';

type NetworkContextType = {
  chainId: number | null;
  rpcUrl: string | null;
  setChainId: (chainId: number) => void;
  setRpcUrl: (rpcUrl: string) => void;
};

const NetworkContext = createContext<NetworkContextType>({
  chainId: null,
  rpcUrl: null,
  setChainId: () => {},
  setRpcUrl: () => {},
});

export function NetworkProvider({ children }: { children: ReactNode }) {
  const [chainId, setChainId] = useState<number | null>(null);
  const [rpcUrl, setRpcUrl] = useState<string | null>(
    localStorage.getItem("custom_rpc_url") || "https://rpc.viction.xyz"
  );

  return (
    <NetworkContext.Provider value={{ chainId, rpcUrl, setChainId, setRpcUrl }}>
      {children}
    </NetworkContext.Provider>
  );
}

export function useNetwork() {
  return useContext(NetworkContext);
}