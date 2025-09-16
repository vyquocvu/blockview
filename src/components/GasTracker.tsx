import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { getGasPrice } from "../lib/blockchain";
import { formatUnits } from "ethers";

export function GasTracker() {
  const [gasData, setGasData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGasData = async () => {
      try {
        setError(null);
        const feeData = await getGasPrice();
        setGasData(feeData);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching gas data:", err);
        setError("Failed to fetch gas information");
        setLoading(false);
      }
    };

    fetchGasData();
    
    // Refresh gas data every 15 seconds
    const interval = setInterval(fetchGasData, 15000);
    return () => clearInterval(interval);
  }, []);

  const formatGwei = (wei: bigint | null) => {
    if (!wei) return "N/A";
    return parseFloat(formatUnits(wei, "gwei")).toFixed(2);
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-xl">Gas Tracker</CardTitle>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="text-destructive">{error}</div>
        ) : loading ? (
          <div className="text-muted-foreground">Loading gas data...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatGwei(gasData?.gasPrice)} Gwei
              </div>
              <div className="text-sm text-muted-foreground">Standard</div>
            </div>
            {gasData?.maxFeePerGas && (
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {formatGwei(gasData.maxFeePerGas)} Gwei
                </div>
                <div className="text-sm text-muted-foreground">Max Fee</div>
              </div>
            )}
            {gasData?.maxPriorityFeePerGas && (
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {formatGwei(gasData.maxPriorityFeePerGas)} Gwei
                </div>
                <div className="text-sm text-muted-foreground">Priority Fee</div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}