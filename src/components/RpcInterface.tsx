import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { makeRpcCall } from "../lib/blockchain";

export function RpcInterface() {
  const [method, setMethod] = useState("");
  const [params, setParams] = useState("[]");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const commonMethods = [
    { name: "eth_blockNumber", params: "[]" },
    { name: "eth_gasPrice", params: "[]" },
    { name: "eth_chainId", params: "[]" },
    { name: "net_version", params: "[]" },
    { name: "web3_clientVersion", params: "[]" },
    { name: "eth_getBlockByNumber", params: '["latest", false]' },
    { name: "eth_getBalance", params: '["0x...", "latest"]' },
    { name: "eth_getTransactionCount", params: '["0x...", "latest"]' },
    { name: "eth_getCode", params: '["0x...", "latest"]' },
    { name: "eth_estimateGas", params: '[{"to": "0x...", "data": "0x..."}]' },
    { name: "eth_getLogs", params: '[{"fromBlock": "latest", "toBlock": "latest"}]' },
  ];

  const handleMethodSelect = (selectedMethod: string, selectedParams: string) => {
    setMethod(selectedMethod);
    setParams(selectedParams);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const parsedParams = JSON.parse(params);
      const response = await makeRpcCall(method, parsedParams);
      setResult(response);
    } catch (err: any) {
      console.error("RPC call error:", err);
      setError(err.message || "Failed to make RPC call");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">RPC Interface</CardTitle>
          <p className="text-sm text-muted-foreground">
            Make direct RPC calls to the connected blockchain node
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="method">Method</Label>
            <Input
              id="method"
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              placeholder="eth_blockNumber"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="params">Parameters (JSON array)</Label>
            <Textarea
              id="params"
              value={params}
              onChange={(e) => setParams(e.target.value)}
              placeholder='["latest", false]'
              rows={3}
            />
          </div>

          <Button onClick={handleSubmit} disabled={loading || !method}>
            {loading ? "Calling..." : "Call RPC Method"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Common Methods</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            {commonMethods.map((item, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => handleMethodSelect(item.name, item.params)}
                className="justify-start text-left"
              >
                {item.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm bg-destructive/10 p-4 rounded overflow-auto">
              {error}
            </pre>
          </CardContent>
        </Card>
      )}

      {result !== null && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Result</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm bg-muted p-4 rounded overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}