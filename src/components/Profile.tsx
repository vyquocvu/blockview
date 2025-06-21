import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { getTokenBalances, getNftHoldings } from "@/lib/blockchain";
import type { Erc20Token, Erc721Token } from "@/lib/tokens";
import { formatAddress } from "@/lib/format";
import { useWallet } from "../context/WalletContext";

interface ProfileProps {
  address?: string;
  onBack?: () => void;
}

export function Profile({ address, onBack }: ProfileProps) {
  const { account } = useWallet();
  const [erc20Balances, setErc20Balances] = useState<Array<{ token: Erc20Token; balance: string }>>([]);
  const [nfts, setNfts] = useState<Array<{ nft: Erc721Token; tokenIds: string[] }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const addr = address || account || "";

  useEffect(() => {
    const loadData = async () => {
      if (!addr) return;
      try {
        setError(null);
        setLoading(true);
        const [tokens, ownedNfts] = await Promise.all([
          getTokenBalances(addr),
          getNftHoldings(addr),
        ]);
        setErc20Balances(tokens);
        setNfts(ownedNfts);
      } catch (err) {
        console.error("Failed to load profile data:", err);
        setError("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [addr]);

  if (!addr) {
    return <p className="p-4">Connect wallet or specify an address.</p>;
  }

  if (loading) {
    return <p className="p-4">Loading profile...</p>;
  }

  if (error) {
    return <div className="bg-destructive/20 text-destructive p-4 rounded-md">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Profile {formatAddress(addr)}</h2>
        {onBack && (
          <Button onClick={onBack} variant="outline">
            Go Back
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">ERC20 Tokens</CardTitle>
        </CardHeader>
        <CardContent>
          {erc20Balances.length === 0 ? (
            <p>No tokens found.</p>
          ) : (
            <ul className="space-y-2">
              {erc20Balances.map(({ token, balance }) => (
                <li key={token.address} className="flex justify-between">
                  <span>{token.symbol}</span>
                  <span>{balance}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">NFTs</CardTitle>
        </CardHeader>
        <CardContent>
          {nfts.length === 0 ? (
            <p>No NFTs found.</p>
          ) : (
            nfts.map(({ nft, tokenIds }) => (
              <div key={nft.address} className="mb-4">
                <h3 className="font-medium mb-2">{nft.name}</h3>
                <p className="text-sm">IDs: {tokenIds.join(', ')}</p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
