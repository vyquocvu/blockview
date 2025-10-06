import { useEffect, useState } from "react";
import { TransactionReceipt, TransactionResponse } from "ethers";

import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { getTransaction, getTransactionReceipt, formatTimestamp, getDetailedTrace } from "../lib/blockchain";
import { formatAddress } from "../lib/format";
import { TransactionData } from "./transaction/TransactionData";
import { TransactionLogs } from "./transaction/TransactionLogs";
import { DetailedTrace } from "./transaction/DetailedTrace";

interface TransactionDetailsProps {
  txHash: string;
  onBack?: () => void;
}

type Txn = Partial<TransactionResponse> & {
  timestamp?: number;
}

type DecodedFunction = {
  name: string;
  params: Array<{ name: string; value: string; type: string }>;
}

type DecodedLog = {
  name: string;
  params: Array<{ name: string; value: string; type: string }>;
  address: string;
}

export function TransactionDetails({ txHash, onBack }: TransactionDetailsProps) {
  const [transaction, setTransaction] = useState<Txn | null>(null);
  const [receipt, setReceipt] = useState<TransactionReceipt | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [decodedFunction, setDecodedFunction] = useState<DecodedFunction | null>(null);
  const [decodedLogs, setDecodedLogs] = useState<DecodedLog[]>([]);
  const [trace, setTrace] = useState<any | null>(null);
  const [traceLoading, setTraceLoading] = useState(false);
  const [traceError, setTraceError] = useState<string | null>(null);

  const handleFetchTrace = async () => {
    setTraceLoading(true);
    setTrace(null);
    setTraceError(null);
    try {
      const traceData = await getDetailedTrace(txHash);
      if (!traceData) {
        throw new Error("Trace data is null or undefined.");
      }
      setTrace(traceData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      console.error("Error fetching trace data:", err);
      setTraceError(errorMessage);
    } finally {
      setTraceLoading(false);
    }
  };

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
          <CardTitle className="text-xl text-left">Transaction {formatAddress(txHash)}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-left grid gap-1">
            <div className="grid gap-1">
              <div className="flex">
                <h3 className="text-sm w-32 font-medium text-muted-foreground">Transaction Hash</h3>
                <p className="text-sm font-mono break-all">{txHash}</p>
              </div>
              <div className="flex">
                <h3 className="text-sm w-32 font-medium text-muted-foreground">Status</h3>
                <p className={`text-sm font-medium ${statusColor}`}>{status}</p>
              </div>
              <div className="flex">
                <h3 className="text-sm w-32 font-medium text-muted-foreground">Block</h3>
                <p className="text-sm">
                  <a href={`#/block/${transaction.blockNumber}`} className="text-primary hover:underline">
                    {transaction.blockNumber}
                  </a>
                </p>
              </div>
              <div className="flex">
                <h3 className="text-sm w-32 font-medium text-muted-foreground">Timestamp</h3>
                <p className="text-sm">{transaction.blockNumber ? formatTimestamp(transaction.timestamp || 0) : 'Pending'}</p>
              </div>
              <div className="flex">
                <h3 className="text-sm w-32 font-medium text-muted-foreground">From</h3>
                <p className="text-sm font-mono break-all">
                  <a href={`#/address/${transaction.from}`} className="text-primary hover:underline">
                    {transaction.from}
                  </a>
                </p>
              </div>
              <div className="flex">
                <h3 className="text-sm w-32 font-medium text-muted-foreground">To</h3>
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
              <div className="flex">
                <h3 className="text-sm w-32 font-medium text-muted-foreground">Value</h3>
                <p className="text-sm">{transaction.value ? Number(transaction.value) / 1e18 : 0} ETH</p>
              </div>
              <div className="flex">
                <h3 className="text-sm w-32 font-medium text-muted-foreground">Gas Price</h3>
                <p className="text-sm">{transaction.gasPrice ? Number(transaction.gasPrice) / 1e9 : 0} Gwei</p>
              </div>
              <div className="flex">
                <h3 className="text-sm w-32 font-medium text-muted-foreground">Gas Used</h3>
                <p className="text-sm">{receipt ? receipt.gasUsed.toString() : 'Pending'}</p>
              </div>
              <div className="flex">
                <h3 className="text-sm w-32 font-medium text-muted-foreground">Nonce</h3>
                <p className="text-sm">{transaction.nonce}</p>
              </div>
            </div>

            {transaction.data && transaction.data !== '0x' && (
              <TransactionData
                transactionData={transaction.data}
                transactionValue={transaction.value}
                decodedFunction={decodedFunction}
                onDecodedFunction={setDecodedFunction}
              />
            )}
            <div className="h-3" />
            {receipt && receipt.logs && receipt.logs.length > 0 && (
              <TransactionLogs
                receipt={receipt}
                decodedLogs={decodedLogs}
                onDecodedLogs={setDecodedLogs}
              />
            )}
          </div>
          <div className="mt-4 flex items-center gap-4">
            <Button onClick={handleFetchTrace} disabled={traceLoading}>
              {traceLoading ? "Loading Trace..." : "Fetch Trace"}
            </Button>
            {trace && <DetailedTrace trace={trace} />}
          </div>
          {traceError && (
            <div className="mt-4 text-red-500 bg-red-100 dark:bg-red-900 p-3 rounded-md">
              <p><strong>Error fetching trace:</strong> {traceError}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}