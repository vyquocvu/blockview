import React, { useEffect, useState } from "react";
import { Card, CardContent } from "./ui/card";
import { RpcUrlDialog } from "./RpcUrlDialog";
import { WalletConnectButton } from "./WalletConnectButton";
import { useWallet } from "../context/WalletContext";
import { provider } from "../lib/blockchain";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {

  const { account } = useWallet();
  const [chainId, setChainId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchNetworkInfo = async () => {
    try {
      setError(null);
      const network = await provider.getNetwork();
      setChainId(Number(network.chainId));
    } catch (err) {
      console.error("Error fetching network info:", err);
      setError("Failed to fetch network information");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNetworkInfo();
  }, []);

  const renderChildren = () => {
    if (loading) {
      return (
        <div>
          <p>Loading...</p>
          {/* Show children anyway in case of demo/testing */}
          {children}
        </div>
      );
    } else if (error) {
      return (
        <div>
          <p>Error: {error}</p>
          {/* Show children even with network error for demo purposes */}
          {children}
        </div>
      );
    } else {
      // Check if children is a valid React element before using cloneElement
      return React.isValidElement(children) 
        ? React.cloneElement(children as React.ReactElement<{ chainId?: number | null }>, { chainId })
        : children;
    }
  };
  
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 w-full border-b bg-background">
        <div className="w-full flex h-16 items-center justify-between">
          <div className="flex items-center gap-6 md:gap-10">
            <h1 className="text-xl font-bold">EVM Blockchain Explorer</h1>
          </div>
          <nav className="flex items-center space-x-6">
            <a href="#/" className="text-sm font-medium transition-colors hover:text-primary">Home</a>
            <a href="#/transactions" className="text-sm font-medium transition-colors hover:text-primary">Transactions</a>
            <a href="#/blocks" className="text-sm font-medium transition-colors hover:text-primary">Blocks</a>
            <a href="#/accounts" className="text-sm font-medium transition-colors hover:text-primary">Accounts</a>
            <a href="#/tokens" className="text-sm font-medium transition-colors hover:text-primary">Tokens</a>
            <a href="#/logs" className="text-sm font-medium transition-colors hover:text-primary">Logs</a>
            <a href="#/rpc" className="text-sm font-medium transition-colors hover:text-primary">RPC</a>
            <a href="#/helper" className="text-sm font-medium transition-colors hover:text-primary">Helper</a>
            <a href="#/web3-demo" className="text-sm font-medium transition-colors hover:text-primary">Web3</a>
            {account && (
              <a href={`#/profile/${account}`} className="text-sm font-medium transition-colors hover:text-primary">Profile</a>
            )}
            <div className="flex items-center space-x-2">
              <WalletConnectButton />
              <RpcUrlDialog onUpdate={fetchNetworkInfo} />
            </div>
          </nav>
        </div>
      </header>
      <main className="container mx-auto py-6">
        <Card>
          <CardContent className="p-6">
            {children ? renderChildren() : null}
            </CardContent>
        </Card>
      </main>
    </div>
  );
}