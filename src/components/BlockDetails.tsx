import { useEffect, useState } from "react";
import { getBlock, getTransaction, formatTimestamp } from "../lib/blockchain";
import { formatAddress } from "../lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select"
import { Block, TransactionResponse } from "ethers";
import { Copy, Check } from "lucide-react";

interface BlockDetailsProps {
  blockNumber: string;
  onBack?: () => void;
}

export function BlockDetails({ blockNumber, onBack }: BlockDetailsProps) {
  const [block, setBlock] = useState<Block | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [transactions, setTransactions] = useState<TransactionResponse[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [txsPerPage, setTxsPerPage] = useState(25);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlockData = async () => {
      try {
        setLoading(true);
        setError(null);
        const blockData = await getBlock(parseInt(blockNumber));
        setBlock(blockData);

        // Reset to first page when loading a new block
        setCurrentPage(1);
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

  useEffect(() => {
    if (block) {
      fetchTransactionsForPage(block, currentPage);
    }
  }, [block, currentPage, txsPerPage]);

  const fetchTransactionsForPage = async (blockData: Block, page: number) => {
    const startIndex = (page - 1) * txsPerPage;
    const endIndex = Math.min(startIndex + txsPerPage, blockData.transactions.length);
    
    const txPromises = blockData.transactions.slice(startIndex, endIndex).map((txHash: string) => {
      return getTransaction(txHash);
    });
    
    const txDetails = await Promise.all(txPromises);
    setTransactions(txDetails.filter(tx => tx !== null));
  };

  const handlePageChange = async (newPage: number) => {
    if (block) {
      setLoading(true);
      await fetchTransactionsForPage(block, newPage);
      setCurrentPage(newPage);
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
      setTimeout(() => setCopiedText(null), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

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
          <div className="grid gap-1 text-left">
              <div className="flex">
                <h3 className="text-sm w-32 font-medium text-muted-foreground">Block Height</h3>
                <p className="text-sm text-left">{block.number}</p>
              </div>
              <div className="flex">
                <h3 className="text-sm w-32 font-medium text-muted-foreground">Timestamp</h3>
                <p className="text-sm text-left">{formatTimestamp(block.timestamp)}</p>
              </div>
              <div className="flex">
                <h3 className="text-sm w-32 font-medium text-muted-foreground">Transactions</h3>
                <p className="text-sm text-left">{block.transactions.length}</p>
              </div>
              <div className="flex">
                <h3 className="text-sm w-32 font-medium text-muted-foreground">Gas Used</h3>
                <p className="text-sm text-left">{block.gasUsed ? block.gasUsed.toString() : '0'}</p>
              </div>
              <div className="flex">
                <h3 className="text-sm w-32 font-medium text-muted-foreground">Miner</h3>
                <p className="text-sm font-mono break-all text-left">
                  <a href={`#/address/${block.miner}`} className="text-primary hover:underline">
                    {block.miner}
                  </a>
                </p>
              </div>
              <div className="flex">
                <h3 className="text-sm w-32 font-medium text-muted-foreground">Hash</h3>
                <p className="text-sm font-mono break-all text-left">{block.hash}</p>
              </div>
              <div className="flex">
                <h3 className="text-sm w-32 font-medium text-muted-foreground">Parent Hash</h3>
                <p className="text-sm font-mono break-all text-left">
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
                        <div className="flex items-center gap-2">
                          <a
                            href={`#/tx/${tx.hash}`}
                            className="text-primary hover:underline font-mono"
                          >
                            {formatAddress(tx.hash)}
                          </a>
                          <button
                            onClick={() => copyToClipboard(tx.hash)}
                            className="text-muted-foreground hover:text-primary transition-colors"
                            title="Copy transaction hash"
                          >
                            {copiedText === tx.hash ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <a
                            href={`#/address/${tx.from}`}
                            className="text-primary hover:underline font-mono"
                          >
                            {formatAddress(tx.from)}
                          </a>
                          <button
                            onClick={() => copyToClipboard(tx.from)}
                            className="text-muted-foreground hover:text-primary transition-colors"
                            title="Copy from address"
                          >
                            {copiedText === tx.from ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {tx.to ? (
                          <div className="flex items-center gap-2">
                            <a
                              href={`#/address/${tx.to}`}
                              className="text-primary hover:underline font-mono"
                            >
                              {formatAddress(tx.to)}
                            </a>
                            <button
                              onClick={() => copyToClipboard(tx.to!)}
                              className="text-muted-foreground hover:text-primary transition-colors"
                              title="Copy to address"
                            >
                              {copiedText === tx.to ? (
                                <Check className="h-4 w-4 text-green-500" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Contract Creation</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {tx.value ? Number(tx.value) / 1e18 : 0} VIC
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {block.transactions.length > txsPerPage && (
                <div className="p-4 flex justify-between items-center border-t">
                  <div className="text-sm text-muted-foreground flex">
                    Showing {(currentPage - 1) * txsPerPage + 1} to {Math.min(currentPage * txsPerPage, block.transactions.length)} of {block.transactions.length} transactions
                  </div>
                  <div className="flex space-x-2">
                    <Select onValueChange={(value) => setTxsPerPage(+value)}>
                      <SelectTrigger className="w-16">
                        <SelectValue placeholder={txsPerPage} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="25">25</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1 || loading}
                    >
                      Previous
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage * txsPerPage >= block.transactions.length || loading}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}