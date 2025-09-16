import { useEffect, useState } from "react";
import { provider, getNetworkInfo, makeRpcCall } from "../lib/blockchain";
import { Card, CardContent } from "./ui/card";

export function NetworkInfo() {
  const [loading, setLoading] = useState(true);
  const [network, setNetwork] = useState<any | null>(null);
  const [clientVersion, setClientVersion] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNetworkInfo = async () => {
      try {
        setError(null);
        // Get basic network info
        const networkData = await provider.getNetwork();
        
        // Fetch chain list to get network name
        const chainList = await fetch('https://chainid.network/chains_mini.json');
        const chainListData = await chainList.json();
        const chain = chainListData.find((chain: any) => chain.chainId === Number(networkData.chainId));
        
        // Try to get client version via RPC
        let clientVer = null;
        try {
          clientVer = await makeRpcCall('web3_clientVersion');
        } catch (err) {
          console.log("Client version not available:", err);
        }
        
        setNetwork(chain || {
          chainId: Number(networkData.chainId),
          name: `Unknown Network (${networkData.chainId})`,
          nativeCurrency: { symbol: 'ETH' }
        });
        setClientVersion(clientVer);
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
            {clientVersion && (
              <p className="text-xs text-muted-foreground mt-1">
                Client: {clientVersion}
              </p>
            )}
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