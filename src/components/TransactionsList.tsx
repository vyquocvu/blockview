import { TransactionResponse } from "ethers";
import { useEffect, useState } from "react";
import { getTransaction, getLatestBlockNumber, getBlock } from "../lib/blockchain";
import { formatAddress } from "../lib/format";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { Copy, Check } from "lucide-react";

export function TransactionsList() {
  const [transactions, setTransactions] = useState<TransactionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      // Get the latest block number and fetch transactions from recent blocks
      const latestBlockNumber = await getLatestBlockNumber();
      const txPromises = [];
      // Get transactions from the last 5 blocks
      for (let i = 0; i < 5; i++) {
        if (latestBlockNumber - i >= 0) {
          const block = await getBlock(latestBlockNumber - i);
          
          if (block && block.transactions) {
            // Take up to 5 transactions from each block
            const blockTxs = block.transactions.slice(0, 5);
            for (const txHash of blockTxs) {
              txPromises.push(getTransaction(txHash as string));
            }
          }
        }
      }
      
      const fetchedTransactions = await Promise.all(txPromises);
      setTransactions(fetchedTransactions.filter(tx => tx !== null));
    } catch (err) {
      console.error("Error fetching transactions:", err);
      setError("Failed to fetch transactions. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedHash(text);
      setTimeout(() => setCopiedHash(null), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  useEffect(() => {
    fetchTransactions();

    // Set up polling to refresh transactions every 15 seconds if autoRefresh is enabled
    let interval: number | undefined;
    if (autoRefresh) {
      interval = Number(setInterval(fetchTransactions, 15000))
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Latest Transactions</h2>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Switch 
              id="auto-refresh" 
              checked={autoRefresh} 
              onCheckedChange={setAutoRefresh}
            />
            <Label htmlFor="auto-refresh">Auto-refresh</Label>
          </div>
          <Button onClick={fetchTransactions} disabled={loading}>
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/20 text-destructive p-4 rounded-md">
          {error}
        </div>
      )}

      {loading && transactions.length === 0 ? (
        <div className="text-center p-8">
          <p>Loading transactions...</p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 text-left">Tx Hash</th>
                <th className="px-4 py-3 text-left">Block</th>
                <th className="px-4 py-3 text-left">From</th>
                <th className="px-4 py-3 text-left">To</th>
                <th className="px-4 py-3 text-left">Value</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.hash} className="border-t hover:bg-muted/50 text-left text-base">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <a
                        href={`#/tx/${tx.hash}`}
                        className="text-primary hover:underline"
                      >
                        {formatAddress(tx.hash)}
                      </a>
                      <button
                        onClick={() => copyToClipboard(tx.hash)}
                        className="text-muted-foreground hover:text-primary transition-colors"
                        title="Copy transaction hash"
                      >
                        {copiedHash === tx.hash ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <a
                      href={`#/block/${tx.blockNumber}`}
                      className="text-primary hover:underline"
                    >
                      {tx.blockNumber}
                    </a>
                  </td>
                  <td className="px-4 py-3">
                    <a
                      href={`#/address/${tx.from}`}
                      className="text-primary hover:underline"
                    >
                      {formatAddress(tx.from)}
                    </a>
                  </td>
                  <td className="px-4 py-3">
                    {tx.to ? (
                      <a
                        href={`#/address/${tx.to}`}
                        className="text-primary hover:underline"
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
        </div>
      )}
    </div>
  );
}