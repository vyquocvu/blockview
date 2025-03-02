import { useEffect, useState } from "react";
import { TransactionReceipt, TransactionResponse } from "ethers";

import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { getTransaction, getTransactionReceipt, formatAddress, formatTimestamp } from "../lib/blockchain";

interface TransactionDetailsProps {
  txHash: string;
  onBack?: () => void;
}

type Txn = Partial<TransactionResponse> & {
  timestamp?: number;
}

export function TransactionDetails({ txHash, onBack }: TransactionDetailsProps) {
  const [transaction, setTransaction] = useState<Txn | null>(null);
  const [receipt, setReceipt] = useState<TransactionReceipt | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransactionData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [txData, txReceipt] = await Promise.all([
          getTransaction(txHash),
          getTransactionReceipt(txHash)
        ]);

        setTransaction(txData);
        setReceipt(txReceipt);
      } catch (err) {
        console.error("Error fetching transaction data:", err);
        setError("Failed to fetch transaction data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (txHash) {
      fetchTransactionData();
    }
  }, [txHash]);

  if (loading) {
    return (
      <div className="text-center p-8">
        <p>Loading transaction data...</p>
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

  if (!transaction) {
    return (
      <div className="text-center p-8">
        <p>Transaction not found</p>
        {onBack && (
          <Button onClick={onBack} className="mt-4">
            Go Back
          </Button>
        )}
      </div>
    );
  }

  const status = receipt ? (receipt.status ? "Success" : "Failed") : "Pending";
  const statusColor = status === "Success" ? "text-green-600" : status === "Failed" ? "text-red-600" : "text-yellow-600";

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Transaction Details</h2>
        {onBack && (
          <Button onClick={onBack} variant="outline">
            Go Back
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Transaction {formatAddress(txHash)}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Transaction Hash</h3>
                <p className="text-sm font-mono break-all">{txHash}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                <p className={`text-sm font-medium ${statusColor}`}>{status}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Block</h3>
                <p className="text-sm">
                  <a href={`#/block/${transaction.blockNumber}`} className="text-primary hover:underline">
                    {transaction.blockNumber}
                  </a>
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Timestamp</h3>
                <p className="text-sm">{transaction.blockNumber ? formatTimestamp(transaction.timestamp || 0) : 'Pending'}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">From</h3>
                <p className="text-sm font-mono break-all">
                  <a href={`#/address/${transaction.from}`} className="text-primary hover:underline">
                    {transaction.from}
                  </a>
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">To</h3>
                <p className="text-sm font-mono break-all">
                  {transaction.to ? (
                    <a href={`#/address/${transaction.to}`} className="text-primary hover:underline">
                      {transaction.to}
                    </a>
                  ) : (
                    <span className="text-muted-foreground">Contract Creation</span>
                  )}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Value</h3>
                <p className="text-sm">{transaction.value ? Number(transaction.value) / 1e18 : 0} ETH</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Gas Price</h3>
                <p className="text-sm">{transaction.gasPrice ? Number(transaction.gasPrice) / 1e9 : 0} Gwei</p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Gas Used</h3>
              <p className="text-sm">{receipt ? receipt.gasUsed.toString() : 'Pending'}</p>
            </div>

            {transaction.data && transaction.data !== '0x' && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Input Data</h3>
                <div className="bg-muted p-3 rounded-md mt-1 overflow-x-auto">
                  <pre className="text-xs font-mono">{transaction.data}</pre>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}