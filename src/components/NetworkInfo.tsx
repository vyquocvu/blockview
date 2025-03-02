import { useEffect, useState } from "react";
import { provider } from "../lib/blockchain";
import { Card, CardContent } from "./ui/card";

export function NetworkInfo() {
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

  // Viction's native token is VIC
  const nativeToken = "VIC";

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Network Information</h2>
            <p className="text-muted-foreground">Viction Blockchain</p>
          </div>
          <div className="text-right">
            {error ? (
              <div className="text-destructive">{error}</div>
            ) : loading ? (
              <div className="text-muted-foreground">Loading...</div>
            ) : (
              <div className="space-y-1">
                <div className="text-lg">
                  <span className="font-semibold">Chain ID:</span> {chainId}
                </div>
                <div className="text-lg">
                  <span className="font-semibold">Native Token:</span> {nativeToken}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}