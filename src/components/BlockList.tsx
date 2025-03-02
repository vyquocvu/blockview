import { Block } from "ethers";
import { useEffect, useState } from "react";
import { getBlocks, formatTimestamp } from "../lib/blockchain";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";

export function BlockList() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchBlocks = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedBlocks: Block[] = await getBlocks(10);
      console.log('fetchedBlocks', fetchedBlocks)
      setBlocks(fetchedBlocks);
    } catch (err) {
      console.error("Error fetching blocks:", err);
      setError("Failed to fetch blocks. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlocks();

    // Set up polling to refresh blocks every 15 seconds if autoRefresh is enabled
    let interval: number | undefined;
    if (autoRefresh) {
      interval = Number(setInterval(fetchBlocks, 15000))
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Latest Blocks</h2>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Switch 
              id="auto-refresh" 
              checked={autoRefresh} 
              onCheckedChange={setAutoRefresh}
            />
            <Label htmlFor="auto-refresh">Auto-refresh</Label>
          </div>
          <Button onClick={fetchBlocks} disabled={loading}>
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/20 text-destructive p-4 rounded-md">
          {error}
        </div>
      )}

      {loading && blocks.length === 0 ? (
        <div className="text-center p-8">
          <p>Loading blocks...</p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 text-left">Block</th>
                <th className="px-4 py-3 text-left">Age</th>
                <th className="px-4 py-3 text-left">Txns</th>
                <th className="px-4 py-3 text-left">Gas</th>
              </tr>
            </thead>
            <tbody>
              {blocks.map((block) => (
                <tr key={block.number} className="border-t hover:bg-muted/50 text-left text-base">
                  <td className="px-4 py-3  ">
                    <a
                      href={`#/block/${block.number}`}
                      className="text-primary hover:underline "
                    >
                      {block.number}
                    </a>
                  </td>
                  <td className="px-4 py-3">{formatTimestamp(block.timestamp)}</td>
                  <td className="px-4 py-3">{block.transactions.length}</td>
                  <td className="px-4 py-3 truncate max-w-[200px]">
                      {block.gasUsed}
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