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
    <div className="space-y-3 mt-4">
      <h3 className="text-base font-semibold text-left">Gas Estimator</h3>
      <form onSubmit={handleEstimate} className="space-y-2">
        <div className="grid grid-cols-[100px_1fr] gap-2 items-center">
          <Label htmlFor="to" className="text-xs">To Address</Label>
          <Input
            id="to"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="0x..."
            className="h-8 text-sm"
          />
        </div>

        <div className="grid grid-cols-[100px_1fr] gap-2 items-center">
          <Label htmlFor="value" className="text-xs">Value (wei)</Label>
          <Input
            id="value"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="0"
            className="h-8 text-sm"
          />
        </div>

        <div className="grid grid-cols-[100px_1fr] gap-2 items-center">
          <Label htmlFor="data" className="text-xs">Data (hex)</Label>
          <Input
            id="data"
            value={data}
            onChange={(e) => setData(e.target.value)}
            placeholder="0x"
            className="h-8 text-sm"
          />
        </div>

        <div className="grid grid-cols-[100px_1fr] gap-2 items-center text-left">
          <div></div>
          <Button type="submit" disabled={loading} size="sm" className="h-8">
            {loading ? "Estimating..." : "Estimate Gas"}
          </Button>
        </div>
      </form>

      <div className="space-y-1.5">
        <Label className="text-xs text-left">Quick Presets</Label>
        <div className="flex gap-1.5">
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
              className="h-7 text-xs flex-1"
            >
              {preset.name}
            </Button>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-destructive/20 text-destructive p-2 rounded-md text-xs">
          {error}
        </div>
      )}

      {gasEstimate && (
        <div className="bg-green-50 border border-green-200 p-2 rounded-md">
          <div className="font-medium text-green-800 text-xs">
            Estimated Gas: {gasEstimate} units
          </div>
          <div className="text-xs text-green-600 mt-0.5">
            This is an estimate and actual gas usage may vary
          </div>
        </div>
      )}
    </div>
  );
}