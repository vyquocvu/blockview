import { useEffect, useState } from "react";
import { getLatestBlockNumber } from "../lib/blockchain";
import { Card, CardContent } from "./ui/card";

export function BlockCounter() {
  const [blockNumber, setBlockNumber] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLatestBlockNumber = async () => {
    try {
      setError(null);
      const latestBlock = await getLatestBlockNumber();
      setBlockNumber(latestBlock);
    } catch (err) {
      console.error("Error fetching latest block number:", err);
      setError("Failed to fetch latest block number");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLatestBlockNumber();
    // Set up polling to refresh block number every 5 seconds
    const interval = setInterval(fetchLatestBlockNumber, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Current Block Height</h2>
            <p className="text-muted-foreground">Updates every 5 seconds</p>
          </div>
          <div className="text-right">
            {error ? (
              <div className="text-destructive">{error}</div>
            ) : loading ? (
              <div className="text-muted-foreground">Loading...</div>
            ) : (
              <div className="text-4xl font-bold text-primary">{blockNumber?.toLocaleString()}</div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}