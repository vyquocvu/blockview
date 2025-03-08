import { useEffect, useState } from "react";
import { provider } from "../lib/blockchain";
import { Card, CardContent } from "./ui/card";

export function NetworkInfo() {
  const [loading, setLoading] = useState(true);
  const [network, setNetwork] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNetworkInfo = async () => {
      try {
        setError(null);
        const network = await provider.getNetwork();
        const chainList = await fetch('https://chainid.network/chains_mini.json');
        const chainListData = await chainList.json();
        const chain = chainListData.find((chain: any) => chain.chainId === Number(network.chainId));
        setNetwork(chain);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching network info:", err);
        setError("Failed to fetch network information");
        setLoading(false);
      }
    };
    fetchNetworkInfo();
  }, []);

  // Viction's native token is VIC
  const nativeToken = network?.nativeCurrency?.symbol;

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Network Information</h2>
            <p className="text-muted-foreground">{network?.name}</p>
          </div>
          <div className="text-right">
            {error ? (
              <div className="text-destructive">{error}</div>
            ) : loading ? (
              <div className="text-muted-foreground">Loading...</div>
            ) : (
              <div className="space-y-1">
                <div className="text-lg">
                  <span className="font-semibold">Chain ID:</span> {network?.chainId}
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