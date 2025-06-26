import { useEffect, useState } from "react";
import { getErc20Info, type Erc20Info } from "../lib/blockchain";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface TokenDetailsProps {
  address: string;
  onBack?: () => void;
}

export function TokenDetails({ address, onBack }: TokenDetailsProps) {
  const [info, setInfo] = useState<Erc20Info | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setError(null);
        setLoading(true);
        const data = await getErc20Info(address);
        if (!data) {
          setError("Token not found");
        }
        setInfo(data);
      } catch (err) {
        console.error("Failed to load token data:", err);
        setError("Failed to load token data");
      } finally {
        setLoading(false);
      }
    };
    if (address) {
      loadData();
    }
  }, [address]);

  if (loading) {
    return (
      <div className="text-center p-8">
        <p>Loading token data...</p>
      </div>
    );
  }

  if (error) {
    return <div className="bg-destructive/20 text-destructive p-4 rounded-md">{error}</div>;
  }

  if (!info) {
    return <p className="p-4">Token not found.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Token Details</h2>
        {onBack && (
          <Button onClick={onBack} variant="outline">
            Go Back
          </Button>
        )}
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{info.name} ({info.symbol})</CardTitle>
        </CardHeader>
        <CardContent className="text-left grid gap-1">
          <div className="flex">
            <h3 className="text-sm w-32 font-medium text-muted-foreground">Address</h3>
            <p className="text-sm font-mono break-all">{address}</p>
          </div>
          <div className="flex">
            <h3 className="text-sm w-32 font-medium text-muted-foreground">Decimals</h3>
            <p className="text-sm">{info.decimals}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
