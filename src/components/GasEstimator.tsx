import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { estimateGas } from "../lib/blockchain";

export function GasEstimator() {
  const [to, setTo] = useState("");
  const [value, setValue] = useState("");
  const [data, setData] = useState("");
  const [gasEstimate, setGasEstimate] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEstimate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setGasEstimate(null);

    try {
      const transaction: any = {};
      
      if (to) transaction.to = to;
      if (value) transaction.value = value;
      if (data) transaction.data = data;

      const estimate = await estimateGas(transaction);
      setGasEstimate(estimate.toString());
    } catch (err: any) {
      console.error("Error estimating gas:", err);
      setError(err.message || "Failed to estimate gas");
    } finally {
      setLoading(false);
    }
  };

  const presets = [
    {
      name: "Simple Transfer",
      to: "0x...",
      value: "1000000000000000000", // 1 ETH in wei
      data: ""
    },
    {
      name: "ERC20 Transfer",
      to: "0x...", // Token contract address
      value: "0",
      data: "0xa9059cbb000000000000000000000000..." // transfer(address,uint256)
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Gas Estimator</CardTitle>
        <p className="text-sm text-muted-foreground">
          Estimate gas costs for transactions before sending them
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleEstimate} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="to">To Address</Label>
            <Input
              id="to"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="0x..."
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="value">Value (wei)</Label>
            <Input
              id="value"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="0"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="data">Data (hex)</Label>
            <Input
              id="data"
              value={data}
              onChange={(e) => setData(e.target.value)}
              placeholder="0x"
            />
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? "Estimating..." : "Estimate Gas"}
          </Button>
        </form>

        <div className="grid gap-2">
          <Label>Quick Presets</Label>
          {presets.map((preset, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => {
                setTo(preset.to);
                setValue(preset.value);
                setData(preset.data);
              }}
              className="justify-start text-left"
            >
              {preset.name}
            </Button>
          ))}
        </div>

        {error && (
          <div className="bg-destructive/20 text-destructive p-4 rounded-md">
            {error}
          </div>
        )}

        {gasEstimate && (
          <div className="bg-green-50 border border-green-200 p-4 rounded-md">
            <div className="font-medium text-green-800">
              Estimated Gas: {gasEstimate} units
            </div>
            <div className="text-sm text-green-600 mt-1">
              This is an estimate and actual gas usage may vary
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}