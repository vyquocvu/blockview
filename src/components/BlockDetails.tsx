import { useEffect, useState } from "react";
import { getBlock, getTransaction, formatTimestamp, formatAddress } from "../lib/blockchain";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Block, TransactionResponse } from "ethers";

interface BlockDetailsProps {
  blockNumber: string;
  onBack?: () => void;
}

export function BlockDetails({ blockNumber, onBack }: BlockDetailsProps) {
  const [block, setBlock] = useState<Block | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [transactions, setTransactions] = useState<TransactionResponse[]>([]);

  useEffect(() => {
    const fetchBlockData = async () => {
      try {
        setLoading(true);
        setError(null);
        const blockData = await getBlock(parseInt(blockNumber));
        setBlock(blockData);

        // Fetch transaction details for the first 25 transactions
        if (blockData && blockData.transactions.length > 0) {
          const txPromises = blockData.transactions.slice(0, 25).map((txHash: string) => {
            return getTransaction(txHash);
          });
          const txDetails = await Promise.all(txPromises);
          setTransactions(txDetails.filter(tx => tx !== null));
        }
      } catch (err) {
        console.error("Error fetching block data:", err);
        setError("Failed to fetch block data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (blockNumber) {
      fetchBlockData();
    }
  }, [blockNumber]);

  if (loading) {
    return (
      <div className="text-center p-8">
        <p>Loading block data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-destructive/20 text-destructive p-4 rounded-md">
        {error}
      </div>
    );
  }

  if (!block) {
    return (
      <div className="text-center p-8">
        <p>Block not found</p>
        {onBack && (
          <Button onClick={onBack} className="mt-4">
            Go Back
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Block #{blockNumber}</h2>
        {onBack && (
          <Button onClick={onBack} variant="outline">
            Go Back
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Block Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Block Height</h3>
                <p className="text-sm">{block.number}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Timestamp</h3>
                <p className="text-sm">{formatTimestamp(block.timestamp)}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Transactions</h3>
                <p className="text-sm">{block.transactions.length}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Gas Used</h3>
                <p className="text-sm">{block.gasUsed ? block.gasUsed.toString() : 'N/A'}</p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Miner</h3>
              <p className="text-sm font-mono break-all">
                <a href={`#/address/${block.miner}`} className="text-primary hover:underline">
                  {block.miner}
                </a>
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Hash</h3>
              <p className="text-sm font-mono break-all">{block.hash}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Parent Hash</h3>
              <p className="text-sm font-mono break-all">
                <a href={`#/block/${block.number - 1}`} className="text-primary hover:underline">
                  {block.parentHash}
                </a>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {block.transactions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No transactions in this block</p>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-3 text-left">Transaction Hash</th>
                    <th className="px-4 py-3 text-left">From</th>
                    <th className="px-4 py-3 text-left">To</th>
                    <th className="px-4 py-3 text-left">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.hash} className="border-t hover:bg-muted/50 text-left">
                      <td className="px-4 py-3">
                        <a
                          href={`#/tx/${tx.hash}`}
                          className="text-primary hover:underline font-mono"
                        >
                          {formatAddress(tx.hash)}
                        </a>
                      </td>
                      <td className="px-4 py-3">
                        <a
                          href={`#/address/${tx.from}`}
                          className="text-primary hover:underline font-mono"
                        >
                          {formatAddress(tx.from)}
                        </a>
                      </td>
                      <td className="px-4 py-3">
                        {tx.to ? (
                          <a
                            href={`#/address/${tx.to}`}
                            className="text-primary hover:underline font-mono"
                          >
                            {formatAddress(tx.to)}
                          </a>
                        ) : (
                          <span className="text-muted-foreground">Contract Creation</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {tx.value ? Number(tx.value) / 1e18 : 0} ETH
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {block.transactions.length > 25 && (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  Showing {transactions.length} of {block.transactions.length} transactions
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}